// =====================================================
// W M+ LOCAL PRINT BRIDGE
//
// PURPOSE:
// Provides the W M+ frontend Print Engine with access to
// local OS/printer functions that a browser cannot perform.
//
// IMPORTANT:
// This bridge performs printer primitive operations only.
// It does NOT own W M+ printer state, timers, print-sequence
// decisions, or Check Register / database updates.
// PrintEngine.js owns the W M+ print sequence and state.
// =====================================================

const http = require('http');
const os = require('os');

const path = require('path');
const fs = require('fs');
const { print } = require('pdf-to-printer');

const {
  IPP_STATUS_TIMEOUT_MS,
  getDefaultPrinter,
  getLiveIppStatus
} = require('./printer-discovery');

const PORT = 3012;

function writeJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  res.end(JSON.stringify(data));
}

function classifyIppResult(result) {
  if (!result || result.available !== true) {
    return 'unavailable';
  }

  // IPP printer-state: 3=idle, 4=processing, 5=stopped.
  // Idle and processing are both usable by W M+ because
  // Windows can queue another job while the printer works.
  if (result.stateCode === 3 || result.stateCode === 4) {
    return 'ready';
  }

  return 'unavailable';
}

async function readAuthorizedPrinterStatus() {
  const printerName = await getDefaultPrinter();

  if (!printerName) {
    return {
      status: 'unavailable',
      printer: null,
      ipp: null,
      timeoutMs: IPP_STATUS_TIMEOUT_MS,
      error: 'No default printer found'
    };
  }

  const ipp = await getLiveIppStatus(printerName);
  const status = classifyIppResult(ipp);

  return {
    status,
    printer: printerName,
    ipp,
    timeoutMs: IPP_STATUS_TIMEOUT_MS,
    error: status === 'ready'
      ? null
      : (ipp.error || 'Authorized printer is not ready')
  };
}

function readRequestBody(req, maxBytes = 10 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    req.on('data', chunk => {
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        reject(new Error('PDF exceeds the 10 MB print limit'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    writeJson(res, 204, {});
    return;
  }

  if (req.method === 'GET' && req.url === '/ping') {
    writeJson(res, 200, {
      service: 'W M+ Local Print Bridge',
      status: 'ready',
      platform: os.platform()
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/authorized-printer') {
    try {
      const printerName = await getDefaultPrinter();

      if (!printerName) {
        writeJson(res, 503, {
          status: 'unavailable',
          printer: null,
          error: 'No default printer found'
        });
        return;
      }

      writeJson(res, 200, {
        status: 'ready',
        printer: printerName
      });
    } catch (error) {
      writeJson(res, 503, {
        status: 'unavailable',
        printer: null,
        error: error.message
      });
    }
    return;
  }

  // One common live printer-status endpoint for startup,
  // the 5-second monitor, and the final pre-print check.
  if (req.method === 'GET' && req.url === '/printer-status') {
    try {
      const result = await readAuthorizedPrinterStatus();
      writeJson(res, 200, result);
    } catch (error) {
      writeJson(res, 200, {
        status: 'unavailable',
        printer: null,
        ipp: null,
        timeoutMs: IPP_STATUS_TIMEOUT_MS,
        error: error.message
      });
    }
    return;
  }

  // Physical PDF submission primitive.
  // This route does not make W M+ issuance decisions and does not touch the DB.
  if (req.method === 'POST' && req.url === '/print-pdf') {
    let tempPdfPath = null;

    try {
      const contentType = String(req.headers['content-type'] || '').toLowerCase();
      if (!contentType.startsWith('application/pdf')) {
        writeJson(res, 415, {
          status: 'failed',
          error: 'Content-Type must be application/pdf'
        });
        return;
      }

      const printerName = await getDefaultPrinter();
      if (!printerName) {
        writeJson(res, 503, {
          status: 'failed',
          printer: null,
          error: 'No default printer found'
        });
        return;
      }

      const pdfBuffer = await readRequestBody(req);
      if (!pdfBuffer.length || pdfBuffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
        writeJson(res, 400, {
          status: 'failed',
          printer: printerName,
          error: 'Request body is not a valid PDF'
        });
        return;
      }

      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wmplus-print-'));
      tempPdfPath = path.join(tempDir, 'wmplus-print-job.pdf');
      fs.writeFileSync(tempPdfPath, pdfBuffer);

      await print(tempPdfPath, {
        printer: printerName,
        scale: 'noscale'
      });

      writeJson(res, 200, {
        status: 'submitted',
        printer: printerName
      });
    } catch (error) {
      writeJson(res, 500, {
        status: 'failed',
        error: error.message
      });
    } finally {
      if (tempPdfPath) {
        try {
          fs.rmSync(path.dirname(tempPdfPath), { recursive: true, force: true });
        } catch (_) {
          // Temporary-file cleanup must not change the print result.
        }
      }
    }

    return;
  }

  writeJson(res, 404, { error: 'Not Found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`W M+ Local Print Bridge running on port ${PORT}`);
});

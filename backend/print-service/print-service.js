// =====================================================
// W M+ LOCAL PRINT BRIDGE
//
// PURPOSE:
// Provides the W M+ frontend Print Engine with access to
// printer functions that a browser cannot perform.
//
// IMPORTANT:
// This bridge reports printer facts only. It does NOT own
// W M+ printer state, timers, or print-sequence decisions.
// PrintEngine.js owns those decisions.
// =====================================================

const http = require('http');
const os = require('os');

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  writeJson(res, 404, { error: 'Not Found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`W M+ Local Print Bridge running on port ${PORT}`);
});

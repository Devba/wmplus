// =====================================================
// W M+ PRINTER DISCOVERY / LIVE IPP STATUS
//
// Windows identifies the authorized printer. Live physical
// status is obtained from the native IppStatusHelper.exe.
// No ICMP ping and no raw TCP reachability test is used.
// =====================================================

const path = require('path');
const { execFile } = require('child_process');

const IPP_STATUS_TIMEOUT_MS = 3000;
const IPP_HELPER_PATH = path.join(
  __dirname,
  'native',
  'IppStatusHelper.exe'
);

function getDefaultPrinter() {
  return new Promise((resolve, reject) => {
    execFile(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        '(Get-CimInstance Win32_Printer | Where-Object Default -eq $true).Name'
      ],
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(stdout.trim());
      }
    );
  });
}

function getLiveIppStatus(printerName) {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    execFile(
      IPP_HELPER_PATH,
      [printerName],
      {
        windowsHide: true,
        timeout: IPP_STATUS_TIMEOUT_MS,
        killSignal: 'SIGKILL',
        maxBuffer: 1024 * 1024
      },
      (error, stdout, stderr) => {
        const elapsedMs = Date.now() - startedAt;

        if (error) {
          const timedOut =
            error.killed === true ||
            error.code === 'ETIMEDOUT';

          resolve({
            available: false,
            printer: printerName,
            state: null,
            stateCode: null,
            reasons: [],
            elapsedMs,
            timedOut,
            error: timedOut
              ? `No IPP status response within ${IPP_STATUS_TIMEOUT_MS} ms`
              : (stderr || error.message || 'IPP status request failed').trim()
          });
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());

          resolve({
            ...result,
            printer: printerName,
            elapsedMs
          });
        } catch (parseError) {
          resolve({
            available: false,
            printer: printerName,
            state: null,
            stateCode: null,
            reasons: [],
            elapsedMs,
            timedOut: false,
            error: `Invalid IPP helper response: ${parseError.message}`
          });
        }
      }
    );
  });
}

module.exports = {
  IPP_STATUS_TIMEOUT_MS,
  getDefaultPrinter,
  getLiveIppStatus
};

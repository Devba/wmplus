// =====================================================
// W M+ PRINT ENGINE
// Common frontend controller for all W M+ printing.
// Checks, letters, reports, forms, etc.
// =====================================================

const PRINT_BRIDGE_URL = 'http://127.0.0.1:3012';
const MONITOR_INTERVAL_MS = 5000;

const printerState = {
  initialized: false,
  authorizedPrinter: null,
  status: 'NOT_STARTED',
  ippState: null,
  ippStateCode: null,
  ippReasons: [],
  lastCheckMs: null,
  lastError: null
};

let monitorTimer = null;
let statusCheckRunning = false;

export function getPrinterState() {
  return {
    ...printerState,
    ippReasons: [...printerState.ippReasons]
  };
}

function applyStatusResult(result) {
  printerState.initialized = true;
  printerState.authorizedPrinter =
    result.printer || printerState.authorizedPrinter;
  printerState.status =
    result.status === 'ready' ? 'READY' : 'UNAVAILABLE';
  printerState.ippState = result.ipp?.state || null;
  printerState.ippStateCode = result.ipp?.stateCode ?? null;
  printerState.ippReasons = Array.isArray(result.ipp?.reasons)
    ? result.ipp.reasons
    : [];
  printerState.lastCheckMs = result.ipp?.elapsedMs ?? null;
  printerState.lastError = result.error || null;
}

async function requestLivePrinterStatus() {
  if (statusCheckRunning) {
    return getPrinterState();
  }

  statusCheckRunning = true;

  try {
    const response = await fetch(`${PRINT_BRIDGE_URL}/printer-status`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Printer status check failed: ${response.status}`);
    }

    const result = await response.json();
    applyStatusResult(result);

    console.log('PRINT ENGINE:', getPrinterState());
    
  } catch (error) {
    printerState.initialized = true;
    printerState.status = 'UNAVAILABLE';
    printerState.ippState = null;
    printerState.ippStateCode = null;
    printerState.ippReasons = [];
    printerState.lastCheckMs = null;
    printerState.lastError = error.message;
  } finally {
    statusCheckRunning = false;
  }

  return getPrinterState();
}

function startPrinterMonitor() {
  if (monitorTimer) return;

  monitorTimer = setInterval(() => {
    requestLivePrinterStatus();
  }, MONITOR_INTERVAL_MS);
}

export async function initializePrintEngine() {
  const state = await requestLivePrinterStatus();
  startPrinterMonitor();
  return state;
}

// Use this immediately before any W M+ print submission.
// It deliberately performs a fresh IPP status request rather
// than trusting the cached 5-second monitor state.
export async function confirmPrinterReadyForPrint() {
  await requestLivePrinterStatus();
  return getPrinterState();
}

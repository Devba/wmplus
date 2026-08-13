


// =====================================================
// W M+ SHARED VOID ENGINE
// React module conversion of Legacy void-engine.js
// Shared by Check Register and Deposit Register
// =====================================================

import { closeOverlay } from '../overlay';
import { API_BASE_URL } from '../../config/api';
const TEMP_REACT_TEST_MODE = false;

export function applyVoidStamp(tr, stampFields) {
  const cells = tr.querySelectorAll('td, .apr-cell');

  stampFields.forEach((rule) => {
    const index = rule.column - 1;

    if (!cells[index]) return;

    if (rule.action === 'clear') {
      cells[index].innerText = '';
    } else if (rule.action === 'set') {
      cells[index].innerText = rule.value ?? '';
    }
  });
}

export function evaluateVoidEligibility(tr, statusColumn) {
  const cells = tr.querySelectorAll('td');
  const index = statusColumn - 1;
  const raw = (cells[index]?.innerText || '').trim().toUpperCase();

  if (raw === 'VOID') {
    return {
      allowed: false,
      message: 'Transaction already voided.'
    };
  }

  const monthNumber = Number(raw);

  if (
    Number.isFinite(monthNumber) &&
    monthNumber >= 1 &&
    monthNumber <= 12
  ) {
    return {
      allowed: false,
      message:
        'This transaction already cleared the bank and cannot be voided.'
    };
  }

  if (raw === '') {
    return { allowed: true };
  }

  return {
    allowed: false,
    message: 'Transaction status not eligible for void.'
  };
}

export async function executeVoid(tr, config) {
  const transactionNumber =
    config.getTransactionNo &&
    typeof config.getTransactionNo === 'function'
      ? config.getTransactionNo(tr)
      : '';

  if (!transactionNumber) {
    window.alert('Transaction # is required.');
    return false;
  }

  const eligibility = evaluateVoidEligibility(
    tr,
    config.statusColumn
  );

  if (!eligibility.allowed) {
    window.alert(eligibility.message);
    return false;
  }

  const confirmed = window.confirm(
    config.confirmMessage ||
      'Are you sure you want to VOID this transaction?'
  );

  if (!confirmed) return false;

  let data;

  if (TEMP_REACT_TEST_MODE) {
    // TEMPORARY REACT TEST MODE.
    // Change TEMP_REACT_TEST_MODE to false when the server is active.
    data = {
      ok: true,
      status: {
        message: 'VOID successful.'
      }
    };
  } else {
    let response;

    try {
      response = await fetch(
        `${API_BASE_URL}/void/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            payload: {
              transaction_no: transactionNumber,
              page: config.page || ''
            }
          })
        }
      );
    } catch (error) {
      window.alert('Server request failed.');
      console.error('VOID execute request failed:', error);
      return false;
    }

    try {
      data = await response.json();
    } catch (error) {
      window.alert('Server returned invalid JSON.');
      console.error('VOID execute JSON parse failed:', error);
      return false;
    }
  }

  if (!data || data.ok !== true) {
    window.alert(
      data?.status?.message || 'Void failed.'
    );
    return false;
  }

  applyVoidStamp(tr, config.stampFields);

  window.alert(
    data?.status?.message || 'VOID successful.'
  );

  closeOverlay();

  return true;
}

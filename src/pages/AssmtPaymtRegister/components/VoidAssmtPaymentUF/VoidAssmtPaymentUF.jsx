


// =====================================================
// VOID ASSESSMENT PAYMENT USER FORM
// R&R from working Deposit Register Void UF
// =====================================================

import { useEffect, useRef } from 'react';

import { executeVoid } from '../../../../engines/void';

import './VoidAssmtPaymentUF.css';

const voidConfig = {
  page: 'APR',

  statusColumn: 6,

  confirmMessage:
    'Are you sure you want to VOID this assessment payment?',

  getTransactionNo(tr) {
    const cells = tr
      ? tr.querySelectorAll('td')
      : [];

    return String(
      cells[10]?.innerText || ''
    ).trim();
  },

stampFields: []
};

function normalize(value) {
  return String(value || '').trim();
}

function getSelectedRow() {
  return (
    document.querySelector(
      '#aprRows tr.is-selected'
    ) ||
    document.querySelector(
      '#aprRows tr.selected'
    )
  );
}

function findRowByTransaction(
  transactionNumber
) {
  const rowsHost =
    document.getElementById('aprRows') ||
    document.querySelector(
      '.apr-table tbody'
    );

  if (!rowsHost) {
    return null;
  }

  const wanted = normalize(
    transactionNumber
  );

  if (!wanted) {
    return null;
  }

  for (
    const tr of rowsHost.querySelectorAll(
      'tr'
    )
  ) {
    const cells =
      tr.querySelectorAll('td');

    const rowTransaction =
      normalize(cells[10]?.innerText);

    if (rowTransaction === wanted) {
      return tr;
    }
  }

  return null;
}

function populateFromRow(tr, refs) {
  if (!tr) {
    return;
  }

  const cells =
    tr.querySelectorAll('td');

  refs.transaction.current.value =
    normalize(cells[10]?.innerText);

  refs.resident.current.value =
    normalize(cells[1]?.innerText);

  refs.address.current.value =
    normalize(cells[2]?.innerText);

  refs.account.current.value =
    normalize(cells[0]?.innerText);

  refs.amount.current.value =
    normalize(cells[3]?.innerText);
}

function VoidAssmtPaymentUF({
  onVoidSuccess
}) {
  const transactionRef =
    useRef(null);

  const residentRef =
    useRef(null);

  const addressRef =
    useRef(null);

  const accountRef =
    useRef(null);

  const amountRef =
    useRef(null);

  const selectedRowRef =
    useRef(null);

  const selectedTransactionRef =
    useRef('');

  const refs = {
    transaction: transactionRef,
    resident: residentRef,
    address: addressRef,
    account: accountRef,
    amount: amountRef
  };

  useEffect(() => {
    const selectedRow =
      getSelectedRow();

    selectedRowRef.current =
      selectedRow;

    let selectedTransaction = '';

    if (selectedRow) {
      const cells =
        selectedRow.querySelectorAll(
          'td'
        );

      selectedTransaction =
        normalize(
          cells[10]?.innerText
        );
    }

    selectedTransactionRef.current =
      selectedTransaction;

    if (selectedRow) {
      populateFromRow(
        selectedRow,
        refs
      );
    }
  }, []);

  const handleTransactionKeyDown = (
    event
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    const matchingRow =
      findRowByTransaction(
        transactionRef.current
          ?.value.trim() || ''
      );

    if (matchingRow) {
      populateFromRow(
        matchingRow,
        refs
      );
    } else {
      window.alert(
        'Assessment payment transaction was not found.'
      );
    }
  };

  const handleVoidPayment = () => {
    const transactionNumber =
      transactionRef.current
        ?.value.trim() || '';

    const selectedRow =
      selectedRowRef.current;

    const selectedTransaction =
      selectedTransactionRef.current;

    let targetRow = null;

    if (
      selectedRow &&
      transactionNumber ===
        selectedTransaction
    ) {
      targetRow = selectedRow;
    } else {
      targetRow =
        findRowByTransaction(
          transactionNumber
        );
    }

    if (!targetRow) {
      window.alert(
        'Assessment payment transaction was not found.'
      );

      return;
    }

    executeVoid(
      targetRow,
      voidConfig
    ).then((success) => {
      if (success) {
        onVoidSuccess?.();
      }
    });
  };

  return (
    <div className="uf-voiddeposit">
      <div
        className="uf-window"
        role="dialog"
        aria-label="VOID ASSESSMENT PAYMENT"
      >
        <div className="uf-body">
          <h1 className="uf-header">
            VOID ASSESSMENT PAYMENTS:
          </h1>

          <p className="uf-sub">
            THIS ROUTINE WILL VOID A
            SINGLE ASSESSMENT PAYMENT
            THAT HAS BEEN POSTED
          </p>

          <div className="uf-top-row">
            <div className="uf-field uf-transaction-field">
              <div className="uf-label">
                TRANSACTION #
              </div>

              <input
                ref={transactionRef}
                id="vaTxn"
                className="uf-input"
                type="text"
                onKeyDown={
                  handleTransactionKeyDown
                }
              />
            </div>

            <div className="uf-button-column">
              <button
                id="vaVoidBtn"
                className="uf-button"
                type="button"
                onClick={
                  handleVoidPayment
                }
              >
                VOID ASSMT PAYMENT
              </button>
            </div>
          </div>

          <div className="uf-detail-row">
            <div className="uf-field uf-depositor-field">
              <div className="uf-detail-label">
                Resident Name
              </div>

              <input
                ref={residentRef}
                id="vaName"
                className="uf-input"
                type="text"
                readOnly
              />
            </div>

            <div className="uf-field uf-id-field">
              <div className="uf-detail-label">
                Owner Acct#
              </div>

              <input
                ref={accountRef}
                id="vaAcct"
                className="uf-input"
                type="text"
                readOnly
              />
            </div>

            <div className="uf-field uf-amount-field">
              <div className="uf-detail-label">
                Amount
              </div>

              <input
                ref={amountRef}
                id="vaAmount"
                className="uf-input"
                type="text"
                readOnly
              />
            </div>

            <div className="uf-field uf-notation-field">
              <div className="uf-detail-label">
                Residence
              </div>

              <input
                ref={addressRef}
                id="vaAddress"
                className="uf-input"
                type="text"
                readOnly
              />
            </div>
          </div>

          <div className="uf-message">
            Select an APR row or enter
            the Assessment Payment
            Transaction #.
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoidAssmtPaymentUF;
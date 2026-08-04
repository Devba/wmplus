


// =====================================================
// VOID DEPOSIT USER FORM
// React conversion of Legacy VOID DEPOSITS routine
// =====================================================

import { useEffect, useRef } from 'react';
import { executeVoid } from '../../../../engines/void';
import './VoidDepositUF.css';

const voidConfig = {
  page: 'DP',
  statusColumn: 8,
  confirmMessage: 'Are you sure you want to VOID this deposit?',
  getTransactionNo(tr) {
    const cells = tr ? tr.querySelectorAll('td') : [];
    return (cells[14]?.innerText || '').trim();
  },
  stampFields: [
    { column: 7, action: 'set', value: 'VOID' },
    { column: 8, action: 'set', value: 'VOID' }
  ]
};

function normalize(value) {
  return String(value || '').trim();
}

function getSelectedRow() {
  return (
    document.querySelector('#dpRows tr.is-selected') ||
    document.querySelector('#dpRows tr.selected')
  );
}

function getTopSectionTransaction() {
  return document.querySelector('.depreg-txn-input')?.value.trim() || '';
}

function findRowByTransaction(transactionNumber) {
  const rowsHost =
    document.getElementById('dpRows') ||
    document.querySelector('.depreg-table tbody');

  if (!rowsHost) return null;

  const wanted = normalize(transactionNumber);
  if (!wanted) return null;

  for (const tr of rowsHost.querySelectorAll('tr')) {
    const cells = tr.querySelectorAll('td');
    const rowTransaction = normalize(cells[14]?.innerText);

    if (rowTransaction === wanted) {
      return tr;
    }
  }

  return null;
}

function populateFromRow(tr, refs) {
  if (!tr) return;

  const cells = tr.querySelectorAll('td');
  const ownerAccount = normalize(cells[8]?.innerText);
  const vendorId = normalize(cells[9]?.innerText);

  refs.transaction.current.value = normalize(cells[14]?.innerText);
  refs.depositor.current.value = normalize(cells[1]?.innerText);
  refs.id.current.value = ownerAccount || vendorId;
  refs.amount.current.value = normalize(cells[2]?.innerText);
  refs.notation.current.value = normalize(cells[15]?.innerText);
}

function VoidDepositUF() {
  const transactionRef = useRef(null);
  const depositorRef = useRef(null);
  const idRef = useRef(null);
  const amountRef = useRef(null);
  const notationRef = useRef(null);

  const selectedRowRef = useRef(null);
  const selectedTransactionRef = useRef('');

  const refs = {
    transaction: transactionRef,
    depositor: depositorRef,
    id: idRef,
    amount: amountRef,
    notation: notationRef
  };

  useEffect(() => {
    const selectedRow = getSelectedRow();
    const topSectionTransaction = getTopSectionTransaction();

    selectedRowRef.current = selectedRow;

    let selectedTransaction = '';

    if (selectedRow) {
      const cells = selectedRow.querySelectorAll('td');
      selectedTransaction = normalize(cells[14]?.innerText);
    }

    selectedTransactionRef.current = selectedTransaction;

    let chosenTransaction = '';

    if (
      topSectionTransaction &&
      selectedTransaction &&
      topSectionTransaction !== selectedTransaction
    ) {
      const useEnteredTransaction = window.confirm(
        'Transaction # mismatch:\n\n' +
          'Entered Transaction #: ' +
          topSectionTransaction +
          '\n' +
          'Selected Row Transaction #: ' +
          selectedTransaction +
          '\n\n' +
          'OK = Use entered Transaction #\n' +
          'Cancel = Use selected row'
      );

      chosenTransaction = useEnteredTransaction
        ? topSectionTransaction
        : selectedTransaction;
    } else if (topSectionTransaction) {
      chosenTransaction = topSectionTransaction;
    } else if (selectedTransaction) {
      chosenTransaction = selectedTransaction;
    }

    if (!chosenTransaction) return;

    if (selectedRow && chosenTransaction === selectedTransaction) {
      populateFromRow(selectedRow, refs);
      return;
    }

    const matchingRow = findRowByTransaction(chosenTransaction);

    if (matchingRow) {
      populateFromRow(matchingRow, refs);
    } else if (transactionRef.current) {
      transactionRef.current.value = chosenTransaction;
    }
  }, []);

  const handleTransactionKeyDown = (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();

    const matchingRow = findRowByTransaction(
      transactionRef.current?.value.trim() || ''
    );

    if (matchingRow) {
      populateFromRow(matchingRow, refs);
    }
  };

  const handleVoidDeposit = () => {
    const transactionNumber =
      transactionRef.current?.value.trim() || '';

    const selectedRow = selectedRowRef.current;
    const selectedTransaction = selectedTransactionRef.current;

    let targetRow = null;

    if (selectedRow && transactionNumber === selectedTransaction) {
      targetRow = selectedRow;
    } else {
      targetRow = findRowByTransaction(transactionNumber);
    }

    if (!targetRow) {
      window.alert('Deposit transaction was not found.');
      return;
    }

    executeVoid(targetRow, voidConfig);
  };

  return (
    <div className="uf-voiddeposit">
      <div
        className="uf-window"
        role="dialog"
        aria-label="VOID DEPOSITS"
      >
        <div className="uf-body">
          <h1 className="uf-header">VOID DEPOSITS:</h1>

          <p className="uf-sub">
            THIS ROUTINE WILL VOID A SINGLE DEPOSIT THAT HAS BEEN POSTED
          </p>

          <div className="uf-top-row">
            <div className="uf-field uf-transaction-field">
              <div className="uf-label">TRANSACTION #</div>
              <input
                ref={transactionRef}
                id="vdTxn"
                className="uf-input"
                type="text"
                onKeyDown={handleTransactionKeyDown}
              />
            </div>

            <div className="uf-button-column">
              <button
                id="vdVoidBtn"
                className="uf-button"
                type="button"
                onClick={handleVoidDeposit}
              >
                VOID DEPOSIT
              </button>
            </div>
          </div>

          <div className="uf-detail-row">
            <div className="uf-field uf-depositor-field">
              <div className="uf-detail-label">Depositor Name</div>
              <input
                ref={depositorRef}
                id="vdDepositor"
                className="uf-input"
                type="text"
                readOnly
              />
            </div>

            <div className="uf-field uf-id-field">
              <div className="uf-detail-label">ID#</div>
              <input
                ref={idRef}
                id="vdId"
                className="uf-input"
                type="text"
                readOnly
              />
            </div>

            <div className="uf-field uf-amount-field">
              <div className="uf-detail-label">Amount</div>
              <input
                ref={amountRef}
                id="vdAmount"
                className="uf-input"
                type="text"
                readOnly
              />
            </div>

            <div className="uf-field uf-notation-field">
              <div className="uf-detail-label">Deposit Notation</div>
              <input
                ref={notationRef}
                id="vdNote"
                className="uf-input"
                type="text"
                readOnly
              />
            </div>
          </div>

          <div className="uf-message">
            Enter the Deposit Transaction # to begin.
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoidDepositUF;

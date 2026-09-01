


// =====================================================
// VOID CHECK USER FORM
// React conversion of Legacy VOID CHECKS ROUTINE
// =====================================================



import { useEffect, useRef } from 'react';
import { executeVoid } from '../../../../engines/void';
import './VoidCheckUF.css';

const voidConfig = {
  page: 'CR',
  statusColumn: 6,
  confirmMessage: 'Are you sure you want to VOID this check?',
  getTransactionNo(tr) {
    const tds = tr ? tr.querySelectorAll('td') : [];
    return (tds[15]?.innerText || '').trim();
  },
  stampFields: [
  { column: 5, action: 'set', value: 'VOID' },
  { column: 6, action: 'set', value: 'VOID' }
]
};

function getSelectedRow() {
  return (
    document.querySelector('#crRows tr.is-selected') ||
    document.querySelector('#crRows tr.selected')
  );
}

function getTsTxn() {
  return document.getElementById('crTxnSearch')?.value.trim() || '';
}

function findRowByTxn(txn) {
  const rowsHost =
    document.getElementById('crRows') ||
    document.querySelector('.checkreg-table tbody');

  if (!rowsHost) return null;

  const want = String(txn || '').trim();
  if (!want) return null;

  for (const tr of rowsHost.querySelectorAll('tr')) {
    const cell = tr.querySelector('td.col-txn');
    const rowTxn = (cell?.innerText || '').trim();

    if (rowTxn === want) return tr;
  }

  return null;
}

function populateForm(tr, refs) {
  if (!tr) return;

  const tds = tr.querySelectorAll('td');

  refs.checkNum.current.value = (tds[0]?.innerText || '').trim();
  refs.txn.current.value = (tds[15]?.innerText || '').trim();
  refs.payee.current.value = (tds[1]?.innerText || '').trim();
  refs.amount.current.value = (tds[2]?.innerText || '').trim();
  refs.gl.current.value = (tds[14]?.innerText || '').trim();
  refs.note.current.value = (tds[11]?.innerText || '').trim();
  refs.vendorId.current.value = (tds[7]?.innerText || '').trim();
}

function VoidCheckUF() {
  const checkNumRef = useRef(null);
  const txnRef = useRef(null);
  const payeeRef = useRef(null);
  const amountRef = useRef(null);
  const glRef = useRef(null);
  const noteRef = useRef(null);
  const vendorIdRef = useRef(null);

  const selectedRowRef = useRef(null);
  const selectedTxnRef = useRef('');

  const refs = {
    checkNum: checkNumRef,
    txn: txnRef,
    payee: payeeRef,
    amount: amountRef,
    gl: glRef,
    note: noteRef,
    vendorId: vendorIdRef
  };

  useEffect(() => {
    const selected = getSelectedRow();
    const tsTxn = getTsTxn();

    selectedRowRef.current = selected;

    let selectedTxn = '';

    if (selected) {
      const tds = selected.querySelectorAll('td');
      selectedTxn = (tds[15]?.innerText || '').trim();
    }

    selectedTxnRef.current = selectedTxn;

    let chosenTxn = '';

    if (tsTxn && selectedTxn && tsTxn !== selectedTxn) {
      const useEntered = window.confirm(
        'Transaction # mismatch:\n\n' +
          'Entered Transaction #: ' +
          tsTxn +
          '\n' +
          'Selected Row Transaction #: ' +
          selectedTxn +
          '\n\n' +
          'OK = Use entered Transaction #\n' +
          'Cancel = Use selected row'
      );

      chosenTxn = useEntered ? tsTxn : selectedTxn;
    } else if (tsTxn) {
      chosenTxn = tsTxn;
    } else if (selectedTxn) {
      chosenTxn = selectedTxn;
    }

    if (!chosenTxn) return;

    if (selected && chosenTxn === selectedTxn) {
      populateForm(selected, refs);
      return;
    }

    const tr = findRowByTxn(chosenTxn);

    if (tr) {
      populateForm(tr, refs);
    } else if (txnRef.current) {
      txnRef.current.value = chosenTxn;
    }
  }, []);

  const handleTransactionKeyDown = (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();

    const tr = findRowByTxn(txnRef.current?.value.trim() || '');

    if (tr) {
      populateForm(tr, refs);
    }
  };

  const handleVoidCheck = () => {
    const txn = txnRef.current?.value.trim() || '';
    const selected = selectedRowRef.current;
    const selectedTxn = selectedTxnRef.current;

    let tr = null;

    if (selected && txn === selectedTxn) {
      tr = selected;
    } else {
      tr = findRowByTxn(txn);
    }

    if (!tr) return;

    executeVoid(tr, voidConfig);
  };
  
  return (
    <div className="uf-voidchecks">
      <div
        className="uf-window"
        role="dialog"
        aria-label="VOID CHECKS ROUTINE"
      >
        <div className="uf-body">
          <h1 className="uf-header">VOID ISSUED CHECK ROUTINE:</h1>

          <p className="uf-sub">
            THIS ROUTINE WILL VOID A SINGLE CHECK THAT HAS BEEN ISSUED:
          </p>

          <p className="uf-instr">
            ENTER THE CHECK TRANSACTION # TO BEGIN:
          </p>

          <div className="uf-grid">
            <div className="uf-field uf-check-field">
              <div className="uf-label">CHECK #</div>
              <input
                ref={checkNumRef}
                className="uf-input"
                id="vcCheckNum"
                inputMode="numeric"
                maxLength={4}
                type="text"
              />
            </div>

            <div className="uf-field uf-txn-field">
              <div className="uf-label">CHECK TRANSACTION #</div>
              <input
                ref={txnRef}
                className="uf-input"
                id="vcTxn"
                maxLength={20}
                type="text"
                onKeyDown={handleTransactionKeyDown}
              />
            </div>

            <div className="uf-btncol">
              <button
                className="uf-btn"
                id="vcVoidBtn"
                type="button"
                onClick={handleVoidCheck}
              >
                VOID CHECK
              </button>
            </div>
          </div>

          <div className="uf-row2" aria-label="Read-only details">
            <div className="uf-field uf-payee-field">
              <div className="uf-label">Payee</div>
              <input
                ref={payeeRef}
                className="uf-input"
                id="vcPayee"
                readOnly
                type="text"
              />
            </div>

            <div className="uf-field uf-amount-field">
              <div className="uf-label">Amount</div>
              <input
                ref={amountRef}
                className="uf-input"
                id="vcAmt"
                readOnly
                type="text"
              />
            </div>

            <div className="uf-field uf-gl-field">
              <div className="uf-label">GL#</div>
              <input
                ref={glRef}
                className="uf-input"
                id="vcGL"
                readOnly
                type="text"
              />
            </div>

            <div className="uf-field uf-note-field">
              <div className="uf-label">Check Notation</div>
              <input
                ref={noteRef}
                className="uf-input"
                id="vcNote"
                readOnly
                type="text"
              />
            </div>

            <div className="uf-field uf-vendor-field">
              <div className="uf-label">Vendor / Resident ID#</div>
              <input
                ref={vendorIdRef}
                className="uf-input"
                id="vcVendorId"
                readOnly
                type="text"
              />
            </div>
          </div>

          <div className="uf-msg" id="vcMsg"></div>

          
        </div>
      </div>
    </div>
  );
}

export default VoidCheckUF;

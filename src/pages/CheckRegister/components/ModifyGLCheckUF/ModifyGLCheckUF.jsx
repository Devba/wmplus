


import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../../../../config/api';
import './ModifyGLCheckUF.css';
import { closeOverlay } from '../../../../engines/overlay/overlay-engine';

const temporaryCheckGLOptions = [
  {
    value: '5010',
    glNo: '5010',
    classification: 'Administrative Expense',
    label: '5010 - Administrative Expense'
  },
  {
    value: '5020',
    glNo: '5020',
    classification: 'Bank Charges',
    label: '5020 - Bank Charges'
  },
  {
    value: '5030',
    glNo: '5030',
    classification: 'Insurance Expense',
    label: '5030 - Insurance Expense'
  },
  {
    value: '5040',
    glNo: '5040',
    classification: 'Insurance Deductible Expense',
    label: '5040 - Insurance Deductible Expense'
  },
  {
    value: '5050',
    glNo: '5050',
    classification: 'Landscape Expense',
    label: '5050 - Landscape Expense'
  },
  {
    value: '5060',
    glNo: '5060',
    classification: 'Maintenance Expense',
    label: '5060 - Maintenance Expense'
  },
  {
    value: '5070',
    glNo: '5070',
    classification: 'Office Supplies',
    label: '5070 - Office Supplies'
  },
  {
    value: '5080',
    glNo: '5080',
    classification: 'Professional Fees',
    label: '5080 - Professional Fees'
  },
  {
    value: '5090',
    glNo: '5090',
    classification: 'Utilities Expense',
    label: '5090 - Utilities Expense'
  },
  {
    value: '5100',
    glNo: '5100',
    classification: 'Expense Refund',
    label: '5100 - Expense Refund'
  }
];



function getSelectedRow() {
  return (
    document.querySelector('#crRows tr.is-selected') ||
    document.querySelector('#crRows tr.selected')
  );
}

function getTopSectionTransactionNo() {
  return document.getElementById('crTxnSearch')?.value.trim() || '';
}

function findRowByTransactionNo(transactionNo) {
  const rowsHost =
    document.getElementById('crRows') ||
    document.querySelector('.checkreg-table tbody');

  if (!rowsHost) return null;

  const wantedTransactionNo = String(transactionNo || '').trim();

  if (!wantedTransactionNo) return null;

  for (const row of rowsHost.querySelectorAll('tr')) {
    const transactionCell = row.querySelector('td.col-txn');

    const rowTransactionNo =
      transactionCell?.innerText.trim() ||
      row.querySelectorAll('td')[15]?.innerText.trim() ||
      '';

    if (rowTransactionNo === wantedTransactionNo) {
      return row;
    }
  }

  return null;
}

function readRow(row) {
  if (!row) return null;

  const cells = row.querySelectorAll('td');

  return {
    checkName: (cells[1]?.innerText || '').trim(),
    amount: (cells[2]?.innerText || '').trim(),

    /*
      Check Register:
      Column 7  = GL Classification
      Column 8  = Resident/Vendor Account #
      Column 13 = Bank Account short field
      Column 15 = GL #
      Column 16 = Transaction #
      Column 18 = Bank Account name
    */
    currentGLClassification: (cells[6]?.innerText || '').trim(),
    residentVendorAccount: (cells[7]?.innerText || '').trim(),
    glNo: (cells[14]?.innerText || '').trim(),
    transactionNo: (cells[15]?.innerText || '').trim(),

    bankAccount:
      (cells[17]?.innerText || '').trim() ||
      (cells[12]?.innerText || '').trim()
  };
}

function normalizeGLOptions(payload) {
  const source =
  payload?.glAccounts ||
  payload?.options ||
  payload?.glOptions ||
  payload?.data ||
  payload;

  if (!Array.isArray(source)) return [];

  return source
    .map((item) => {
      if (typeof item === 'string') {
        return {
          value: item,
          label: item
        };
      }

      const glNo =
        item.glNo ??
        item.glNumber ??
        item.GLNo ??
        item.value ??
        '';

      const classification =
        item.classification ??
        item.glClassification ??
        item.glName ??
        item.GLClassification ??
        item.label ??
        '';

      const value = String(glNo || classification).trim();

      const label =
        glNo && classification
          ? `${glNo} - ${classification}`
          : String(classification || glNo).trim();

      if (!value || !label) return null;

      return {
        value,
        label,
        glNo: String(glNo || '').trim(),
        classification: String(classification || '').trim(),
        pc: String(item.pc || '').trim(),
        parentGl: String(item.parentGl || '').trim()
      };
    })
    .filter(Boolean);
}

function ModifyGLCheckUF() {
  const [message, setMessage] = useState(
    'Enter a Check Transaction # to locate the transaction.'
  );

  const [formData, setFormData] = useState({
    checkName: '',
    amount: '',
    currentGLClassification: '',
    residentVendorAccount: '',
    bankAccount: '',
    transactionNo: '',
    glNo: ''
  });

  const [glOptions, setGLOptions] = useState([]);
  const [selectedGL, setSelectedGL] = useState('');
  const [selectedGLParent, setSelectedGLParent] = useState('');
  const [showGLSelectionUF, setShowGLSelectionUF] = useState(false);
  const [selectedGLChild, setSelectedGLChild] = useState('');
  const [loadingGLOptions, setLoadingGLOptions] = useState(false);

  const parentGLOptions = glOptions.filter(
  (option) => option.pc === 'P'
  );

  const childGLOptions = glOptions.filter(
  (option) =>
    option.pc === 'C' &&
    option.parentGl === selectedGLParent
  );

  const locatedRowRef = useRef(null);
  const transactionInputRef = useRef(null);

  const populateFromRow = (row) => {
    const rowData = readRow(row);

    if (!rowData) {
      setMessage('Transaction not found.');
      return false;
    }

    locatedRowRef.current = row;
    setFormData(rowData);
    setSelectedGL('');
    setMessage('Transaction found. Row lock granted.');

    return true;
  };

  const locateTransaction = (transactionNo) => {
    const wantedTransactionNo = String(transactionNo || '').trim();

    if (!wantedTransactionNo) {
      locatedRowRef.current = null;

      setFormData({
        checkName: '',
        amount: '',
        currentGLClassification: '',
        residentVendorAccount: '',
        bankAccount: '',
        transactionNo: '',
        glNo: ''
      });

      setSelectedGL('');
      setMessage('Enter a Check Transaction # to locate the transaction.');

      return;
    }

    const row = findRowByTransactionNo(wantedTransactionNo);

    if (!row) {
      locatedRowRef.current = null;

      setFormData((current) => ({
        ...current,
        checkName: '',
        amount: '',
        currentGLClassification: '',
        residentVendorAccount: '',
        bankAccount: '',
        transactionNo: wantedTransactionNo,
        glNo: ''
      }));

      setSelectedGL('');
      setMessage('Transaction not found.');

      return;
    }

    populateFromRow(row);
  };

  useEffect(() => {
    const selectedRow = getSelectedRow();
    const topSectionTransactionNo = getTopSectionTransactionNo();

    let selectedTransactionNo = '';

    if (selectedRow) {
      selectedTransactionNo = readRow(selectedRow)?.transactionNo || '';
    }

    let transactionToUse = '';

    if (
      topSectionTransactionNo &&
      selectedTransactionNo &&
      topSectionTransactionNo !== selectedTransactionNo
    ) {
      const useEnteredTransaction = window.confirm(
        'Transaction # mismatch:\n\n' +
          `Entered Transaction #: ${topSectionTransactionNo}\n` +
          `Selected Row Transaction #: ${selectedTransactionNo}\n\n` +
          'OK = Use entered Transaction #\n' +
          'Cancel = Use selected row'
      );

      transactionToUse = useEnteredTransaction
        ? topSectionTransactionNo
        : selectedTransactionNo;
    } else {
      transactionToUse =
        topSectionTransactionNo || selectedTransactionNo;
    }

    if (selectedRow && transactionToUse === selectedTransactionNo) {
      populateFromRow(selectedRow);
    } else if (transactionToUse) {
      locateTransaction(transactionToUse);
    } else {
      transactionInputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadGLOptions = async () => {
      setLoadingGLOptions(true);

      try {
              const response = await fetch(
        `${API_BASE_URL}/gl-options?screen=CR`
      );
        if (!response.ok) {
          throw new Error(
            `GL option request failed with status ${response.status}`
          );
        }

        const payload = await response.json();
        const options = normalizeGLOptions(payload);

        if (!cancelled) {
        setGLOptions(
            options.length > 0
            ? options
            : temporaryCheckGLOptions
        );
        }




      } catch (error) {
        console.error('Unable to load Check Register GL options:', error);

        if (!cancelled) {
        setGLOptions(temporaryCheckGLOptions);
        }



      } finally {
        if (!cancelled) {
          setLoadingGLOptions(false);
        }
      }
    };

    loadGLOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTransactionChange = (event) => {
    const transactionNo = event.target.value;

    setFormData((current) => ({
      ...current,
      transactionNo
    }));
  };

  const handleTransactionKeyDown = (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    locateTransaction(formData.transactionNo);
  };

  const handleGLChange = (event) => {
    setSelectedGL(event.target.value);
  };

  const handleOpenGLSelection = () => {
  setSelectedGLParent('');
  setSelectedGLChild('');
  setShowGLSelectionUF(true);
  };

  const handleConfirmGLSelection = () => {
  if (!selectedGLChild) return;

  setSelectedGL(selectedGLChild);
  setShowGLSelectionUF(false);
  };


  const handleChangeGL = async () => {
    const row = locatedRowRef.current;

    if (!row || !formData.transactionNo || !selectedGL) return;

    const selectedOption = glOptions.find(
      (option) => option.value === selectedGL
    );

    const confirmChange = window.confirm(
      'Change this Check Register GL classification?\n\n' +
        `Transaction #: ${formData.transactionNo}\n` +
        `Current GL: ${formData.currentGLClassification}\n` +
        `New GL: ${selectedOption?.label || selectedGL}`
    );

    if (!confirmChange) return;

    try {
      setMessage('Changing GL classification...');

      const response = await fetch(
  `${API_BASE_URL}/modify-gl/submit`,
  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page: 'CR',
          transactionNo: formData.transactionNo,
          oldGLNo: formData.glNo,
          oldGLClassification: formData.currentGLClassification,
          newGLNo: selectedOption?.glNo || selectedGL,
          newGLClassification:
            selectedOption?.classification ||
            selectedOption?.label ||
            selectedGL
        })
      });

      if (!response.ok) {
        throw new Error(
          `Modify GL request failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (result?.success === false) {
        throw new Error(result.message || 'The GL classification was not changed.');
      }

      const newClassification =
        result?.newGLClassification ||
        result?.classification ||
        selectedOption?.classification ||
        selectedOption?.label ||
        selectedGL;

      const newGLNo =
        result?.newGLNo ||
        result?.glNo ||
        selectedOption?.glNo ||
        selectedGL;

      const cells = row.querySelectorAll('td');

      if (cells[6]) {
        cells[6].innerText = newClassification;
      }

      if (cells[14]) {
        cells[14].innerText = newGLNo;
      }

      setFormData((current) => ({
        ...current,
        currentGLClassification: newClassification,
        glNo: newGLNo
      }));

      setSelectedGL('');
      setMessage('GL classification changed successfully.');
      closeOverlay();
    } catch (error) {
      console.error('Unable to change Check Register GL:', error);

      setMessage(
        error.message || 'The GL classification could not be changed.'
      );
    }
  };

  const changeButtonDisabled =
    !locatedRowRef.current ||
    !selectedGL ||
    loadingGLOptions;

  return (
    <div className="modify-gl-check-uf">

     {showGLSelectionUF && (
  <div className="enter-check-gl-overlay">
    <div className="enter-check-gl-box">

      <div className="enter-check-gl-title">
        SELECT CHECK G/L ACCOUNT
      </div>

      <div className="enter-check-gl-columns">

        <div className="enter-check-gl-column">
          <div className="enter-check-gl-column-title">
            Parent / Anchor GL Categories
          </div>

          <div className="enter-check-gl-list">
            {parentGLOptions.map((gl) => (
              <button
                key={gl.glNo}
                type="button"
                className={
                  selectedGLParent === gl.glNo
                    ? 'enter-check-gl-option selected'
                    : 'enter-check-gl-option'
                }
                onClick={() => {
                  setSelectedGLParent(gl.glNo);
                  setSelectedGLChild('');
                }}
              >
                {gl.glNo} - {gl.classification}
              </button>
            ))}
          </div>
        </div>

        <div className="enter-check-gl-column">
          <div className="enter-check-gl-column-title">
            Child GL Accounts
          </div>

          <div className="enter-check-gl-list">
            {childGLOptions.map((gl) => (
              <button
                key={gl.glNo}
                type="button"
                className={
                  selectedGLChild === gl.value
                    ? 'enter-check-gl-option selected'
                    : 'enter-check-gl-option'
                }
                onClick={() =>
                  setSelectedGLChild(gl.value)
                }
              >
                {gl.glNo} - {gl.classification}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="enter-check-gl-actions">
        <button
          type="button"
          disabled={!selectedGLChild}
          onClick={handleConfirmGLSelection}
        >
          Select GL
        </button>

        <button
          type="button"
          onClick={() => {
            setShowGLSelectionUF(false);
            setSelectedGLParent('');
            setSelectedGLChild('');
          }}
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}

      <div className="modify-gl-check-message">
        {message}
      </div>

      <div className="modify-gl-check-display-row">
        <label className="modify-gl-check-field modify-gl-check-name-field">
          <span>Check Name</span>
          <input
            type="text"
            value={formData.checkName}
            readOnly
          />
        </label>

        <label className="modify-gl-check-field modify-gl-check-amount-field">
          <span>Amount</span>
          <input
            type="text"
            value={formData.amount}
            readOnly
          />
        </label>

        <label className="modify-gl-check-field modify-gl-check-current-gl-field">
          <span>Current GL Classification</span>
          <input
            type="text"
            value={formData.currentGLClassification}
            readOnly
          />
        </label>
      </div>

      <div className="modify-gl-check-entry-row">
        <label className="modify-gl-check-field modify-gl-check-transaction-field">
          <span>Enter Check Transaction #</span>
          <input
            ref={transactionInputRef}
            type="text"
            value={formData.transactionNo}
            onChange={handleTransactionChange}
            onKeyDown={handleTransactionKeyDown}
          />
        </label>

        <label className="modify-gl-check-field modify-gl-check-new-gl-field">
          <span>Select New GL# / Classification</span>

 <button
  type="button"
  onClick={handleOpenGLSelection}
  disabled={
    !locatedRowRef.current ||
    loadingGLOptions
  }
>
  {selectedGL
    ? glOptions.find((option) => option.value === selectedGL)?.label
    : '-- Select GL --'}
</button>
        </label>
      </div>

      <div className="modify-gl-check-account-row">
        <label className="modify-gl-check-field modify-gl-check-bank-field">
          <span>Bank Account</span>
          <input
            type="text"
            value={formData.bankAccount}
            readOnly
          />
        </label>

        <label className="modify-gl-check-field modify-gl-check-entity-field">
          <span>Resident / Vendor Acct#</span>
          <input
            type="text"
            value={formData.residentVendorAccount}
            readOnly
          />
        </label>

        <button
          type="button"
          className="modify-gl-check-submit"
          disabled={changeButtonDisabled}
          onClick={handleChangeGL}
        >
          CHANGE GL#
        </button>
      </div>
    </div>
  );
}

export default ModifyGLCheckUF;
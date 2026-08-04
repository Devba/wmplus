



import { useEffect, useRef, useState } from 'react';
import './ModifyGLDepositUF.css';

const temporaryDepositGLOptions = [
  {
    value: '4010',
    glNo: '4010',
    classification: 'Assessment Income',
    label: '4010 - Assessment Income'
  },
  {
    value: '4020',
    glNo: '4020',
    classification: 'Special Assessment Income',
    label: '4020 - Special Assessment Income'
  },
  {
    value: '4030',
    glNo: '4030',
    classification: 'Late Fee Income',
    label: '4030 - Late Fee Income'
  },
  {
    value: '4040',
    glNo: '4040',
    classification: 'Fine Income',
    label: '4040 - Fine Income'
  },
  {
    value: '4050',
    glNo: '4050',
    classification: 'Interest Income',
    label: '4050 - Interest Income'
  },
  {
    value: '4060',
    glNo: '4060',
    classification: 'Miscellaneous Income',
    label: '4060 - Miscellaneous Income'
  },
  {
    value: '4070',
    glNo: '4070',
    classification: 'Expense Credit Refund',
    label: '4070 - Expense Credit Refund'
  },
  {
    value: '4080',
    glNo: '4080',
    classification: 'Transfer Deposit',
    label: '4080 - Transfer Deposit'
  }
];

const temporaryRefundGLOptions = [
  {
    value: '5010',
    glNo: '5010',
    classification: 'Administrative Expense',
    label: '5010 - Administrative Expense'
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
  }
];

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

  const wantedTransaction = normalize(transactionNumber);

  if (!wantedTransaction) return null;

  for (const row of rowsHost.querySelectorAll('tr')) {
    const cells = row.querySelectorAll('td');
    const rowTransaction = normalize(cells[14]?.innerText);

    if (rowTransaction === wantedTransaction) {
      return row;
    }
  }

  return null;
}

function readRow(row) {
  if (!row) return null;

  const cells = row.querySelectorAll('td');

  const ownerAccount = normalize(cells[8]?.innerText);
  const vendorAccount = normalize(cells[9]?.innerText);

  return {
    depositorName: normalize(cells[1]?.innerText),
    amount: normalize(cells[2]?.innerText),
    bankAccount: normalize(cells[3]?.innerText),

    // DP Web Column 5
    currentGLClassification: normalize(cells[4]?.innerText),

    residentVendorAccount: ownerAccount || vendorAccount,

    // DP Web Column 13 — Expense GL#
    currentExpenseGLNo: normalize(cells[12]?.innerText),

    // DP Web Column 14 — Deposit GL#
    currentGLNo: normalize(cells[13]?.innerText),

    // DP Web Column 15 — Transaction #
    transactionNumber: normalize(cells[14]?.innerText)
  };
}

function normalizeGLOptions(payload) {
  const source =
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
          glNo: item,
          classification: item,
          label: item
        };
      }

      const glNo = normalize(
        item.glNo ??
          item.glNumber ??
          item.GLNo ??
          item.value
      );

      const classification = normalize(
        item.classification ??
          item.glClassification ??
          item.glName ??
          item.GLClassification ??
          item.label
      );

      const value = glNo || classification;

      const label =
        glNo && classification
          ? `${glNo} - ${classification}`
          : classification || glNo;

      if (!value || !label) return null;

      return {
        value,
        glNo,
        classification,
        label
      };
    })
    .filter(Boolean);
}

function ModifyGLDepositUF() {
  const [message, setMessage] = useState(
    'CHANGE DEPOSIT GL#:'
  );

  const [formData, setFormData] = useState({
    depositorName: '',
    amount: '',
    bankAccount: '',
    currentGLClassification: '',
    residentVendorAccount: '',
    currentExpenseGLNo: '',
    currentGLNo: '',
    transactionNumber: ''
  });

  const [glOptions, setGLOptions] = useState([]);
  const [refundGLOptions, setRefundGLOptions] = useState([]);

  const [selectedGL, setSelectedGL] = useState('');
  const [selectedRefundGL, setSelectedRefundGL] = useState('');

  const [loadingOptions, setLoadingOptions] = useState(false);

  const locatedRowRef = useRef(null);
  const transactionInputRef = useRef(null);

  const currentGLIsExpenseCreditRefund =
    formData.currentGLClassification
      .toLowerCase()
      .includes('expense credit refund');

  const selectedMainOption = glOptions.find(
    (option) => option.value === selectedGL
  );

  const selectedNewGLIsExpenseCreditRefund =
    selectedMainOption?.classification
      ?.toLowerCase()
      .includes('expense credit refund') || false;

  const refundSelectionRequired =
    currentGLIsExpenseCreditRefund ||
    selectedNewGLIsExpenseCreditRefund;

  const populateFromRow = (row) => {
    const rowData = readRow(row);

    if (!rowData) {
      locatedRowRef.current = null;
      setMessage('Deposit transaction was not found.');
      return false;
    }

    locatedRowRef.current = row;
    setFormData(rowData);
    setSelectedGL('');
    setSelectedRefundGL('');
    setMessage('Transaction found. Row lock granted.');

    return true;
  };

  const clearLocatedTransaction = (transactionNumber = '') => {
    locatedRowRef.current = null;

    setFormData({
      depositorName: '',
      amount: '',
      bankAccount: '',
      currentGLClassification: '',
      residentVendorAccount: '',
      currentExpenseGLNo: '',
      currentGLNo: '',
      transactionNumber
    });

    setSelectedGL('');
    setSelectedRefundGL('');
  };

  const locateTransaction = (transactionNumber) => {
    const wantedTransaction = normalize(transactionNumber);

    if (!wantedTransaction) {
      clearLocatedTransaction();
      setMessage('Enter a Deposit Transaction # to locate the transaction.');
      return;
    }

    const row = findRowByTransaction(wantedTransaction);

    if (!row) {
      clearLocatedTransaction(wantedTransaction);
      setMessage('Deposit transaction was not found.');
      return;
    }

    populateFromRow(row);
  };

  useEffect(() => {
    const selectedRow = getSelectedRow();
    const topSectionTransaction = getTopSectionTransaction();

    let selectedTransaction = '';

    if (selectedRow) {
      selectedTransaction =
        readRow(selectedRow)?.transactionNumber || '';
    }

    let transactionToUse = '';

    if (
      topSectionTransaction &&
      selectedTransaction &&
      topSectionTransaction !== selectedTransaction
    ) {
      const useEnteredTransaction = window.confirm(
        'Transaction # mismatch:\n\n' +
          `Entered Transaction #: ${topSectionTransaction}\n` +
          `Selected Row Transaction #: ${selectedTransaction}\n\n` +
          'OK = Use entered Transaction #\n' +
          'Cancel = Use selected row'
      );

      transactionToUse = useEnteredTransaction
        ? topSectionTransaction
        : selectedTransaction;
    } else {
      transactionToUse =
        topSectionTransaction || selectedTransaction;
    }

    if (
      selectedRow &&
      transactionToUse === selectedTransaction
    ) {
      populateFromRow(selectedRow);
    } else if (transactionToUse) {
      locateTransaction(transactionToUse);
    } else {
      transactionInputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      setLoadingOptions(true);

      try {
        const [mainResponse, refundResponse] =
          await Promise.all([
            fetch('/api/gl-options?page=DP'),
            fetch('/api/gl-options?page=DP_REFUND')
          ]);

        let mainOptions = [];
        let refundOptions = [];

        if (mainResponse.ok) {
          const mainPayload = await mainResponse.json();
          mainOptions = normalizeGLOptions(mainPayload);
        }

        if (refundResponse.ok) {
          const refundPayload = await refundResponse.json();
          refundOptions = normalizeGLOptions(refundPayload);
        }

        if (!cancelled) {
          setGLOptions(
            mainOptions.length > 0
              ? mainOptions
              : temporaryDepositGLOptions
          );

          setRefundGLOptions(
            refundOptions.length > 0
              ? refundOptions
              : temporaryRefundGLOptions
          );
        }
      } catch (error) {
        console.error(
          'Unable to load Deposit Register GL options:',
          error
        );

        if (!cancelled) {
          setGLOptions(temporaryDepositGLOptions);
          setRefundGLOptions(temporaryRefundGLOptions);
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTransactionChange = (event) => {
    setFormData((current) => ({
      ...current,
      transactionNumber: event.target.value
    }));
  };

  const handleTransactionKeyDown = (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();
    locateTransaction(formData.transactionNumber);
  };

  const handleMainGLChange = (event) => {
    const value = event.target.value;

    setSelectedGL(value);

    const option = glOptions.find(
      (item) => item.value === value
    );

    const isRefund =
      option?.classification
        ?.toLowerCase()
        .includes('expense credit refund') || false;

    if (!isRefund && !currentGLIsExpenseCreditRefund) {
      setSelectedRefundGL('');
    }
  };

  const handleChangeGL = async () => {
    const row = locatedRowRef.current;

    if (
      !row ||
      !formData.transactionNumber ||
      !selectedGL
    ) {
      return;
    }

    if (refundSelectionRequired && !selectedRefundGL) {
      setMessage(
        'Select the new Expense Credit Refund GL# before continuing.'
      );
      return;
    }

    const newGLOption = glOptions.find(
      (option) => option.value === selectedGL
    );

    const newRefundGLOption = refundGLOptions.find(
      (option) => option.value === selectedRefundGL
    );

    const confirmationText =
      'Change this Deposit Register GL classification?\n\n' +
      `Transaction #: ${formData.transactionNumber}\n` +
      `Current GL: ${formData.currentGLClassification}\n` +
      `New GL: ${newGLOption?.label || selectedGL}` +
      (
        refundSelectionRequired
          ? `\nNew Expense Credit Refund GL: ${
              newRefundGLOption?.label || selectedRefundGL
            }`
          : ''
      );

    const confirmed = window.confirm(confirmationText);

    if (!confirmed) return;

    try {
      setMessage('Changing Deposit Register GL classification...');

      const response = await fetch('/api/modify-gl/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page: 'DP',
          transactionNo: formData.transactionNumber,

          oldGLNo: formData.currentGLNo,
          oldGLClassification:
            formData.currentGLClassification,

          newGLNo:
            newGLOption?.glNo ||
            newGLOption?.value ||
            selectedGL,

          newGLClassification:
            newGLOption?.classification ||
            newGLOption?.label ||
            selectedGL,

          oldExpenseRefundGLNo:
            formData.currentExpenseGLNo,

          newExpenseRefundGLNo:
            refundSelectionRequired
              ? (
                  newRefundGLOption?.glNo ||
                  newRefundGLOption?.value ||
                  selectedRefundGL
                )
              : ''
        })
      });

      if (!response.ok) {
        throw new Error(
          `Modify GL request failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (result?.success === false) {
        throw new Error(
          result.message ||
            'The Deposit Register GL classification was not changed.'
        );
      }

      setMessage(
        'Deposit Register GL classification changed successfully.'
      );

      setSelectedGL('');
      setSelectedRefundGL('');
    } catch (error) {
      console.error(
        'Unable to change Deposit Register GL:',
        error
      );

      setMessage(
        error.message ||
          'The Deposit Register GL classification could not be changed.'
      );
    }
  };

  const changeButtonDisabled =
    !locatedRowRef.current ||
    !selectedGL ||
    loadingOptions ||
    (
      refundSelectionRequired &&
      !selectedRefundGL
    );

  return (
    <div className="modify-gl-deposit-uf">
      <div className="modify-gl-deposit-heading">
        {message}
      </div>

      <div className="modify-gl-deposit-instruction">
        THIS ROUTINE WILL CHANGE THE GL# OF THE SELECTED DEPOSIT BELOW:
      </div>

      <div className="modify-gl-deposit-details-row">
        <label className="modify-gl-deposit-field deposit-name-field">
          <span>Depositor Name</span>
          <input
            type="text"
            value={formData.depositorName}
            readOnly
          />
        </label>

        <label className="modify-gl-deposit-field deposit-amount-field">
          <span>Amount</span>
          <input
            type="text"
            value={formData.amount}
            readOnly
          />
        </label>

        <label className="modify-gl-deposit-field deposit-current-gl-field">
          <span>Current GL Classification</span>
          <input
            type="text"
            value={formData.currentGLClassification}
            readOnly
          />
        </label>

        <label className="modify-gl-deposit-field deposit-bank-field">
          <span>Bank Account</span>
          <input
            type="text"
            value={formData.bankAccount}
            readOnly
          />
        </label>

        <label className="modify-gl-deposit-field deposit-account-field">
          <span>
            Resident/Vendor
            <br />
            Acct#
          </span>
          <input
            type="text"
            value={formData.residentVendorAccount}
            readOnly
          />
        </label>
      </div>

      <div className="modify-gl-deposit-action-row">
        <label className="modify-gl-deposit-field deposit-transaction-field">
          <span>Enter Deposit Transaction #</span>
          <input
            ref={transactionInputRef}
            type="text"
            value={formData.transactionNumber}
            onChange={handleTransactionChange}
            onKeyDown={handleTransactionKeyDown}
          />
        </label>

        <div className="modify-gl-deposit-main-selection">
          <label className="modify-gl-deposit-field deposit-new-gl-field">
            <span>Select New GL Classification:</span>

            <select
              value={selectedGL}
              onChange={handleMainGLChange}
              disabled={
                !locatedRowRef.current ||
                loadingOptions
              }
            >
              <option value="">
                {loadingOptions
                  ? '-- Loading GL Options --'
                  : '-- Select GL --'}
              </option>

              {glOptions.map((option) => (
                <option
                  key={`${option.value}-${option.label}`}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="modify-gl-deposit-note">
            Note: If Old GL Classification = &quot;Expense Credit
            Refund&quot; THEN either select a New GL Classification OR
            reselect Expense Credit Refund &amp; move on to New Expense
            Credit Refund GL# box &amp; select new Expense Credit Refund
            GL# Classification
          </div>
        </div>

        <div className="modify-gl-deposit-refund-section">
          <label className="modify-gl-deposit-field deposit-refund-gl-field">
            <span>New Expense Credit Refund GL#</span>

            <select
              value={selectedRefundGL}
              onChange={(event) =>
                setSelectedRefundGL(event.target.value)
              }
              disabled={
                !locatedRowRef.current ||
                loadingOptions ||
                !refundSelectionRequired
              }
            >
              <option value="">
                {loadingOptions
                  ? '-- Loading GL Options --'
                  : '-- Select GL --'}
              </option>

              {refundGLOptions.map((option) => (
                <option
                  key={`${option.value}-${option.label}`}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="modify-gl-deposit-submit"
            disabled={changeButtonDisabled}
            onClick={handleChangeGL}
          >
            CHANGE GL#
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModifyGLDepositUF;
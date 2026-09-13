import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import { API_BASE_URL } from '../../../../config/api';

function BankRow({
  onBankChange,
  balanceRefreshKey,
  selectedCheckRow,
  onCheckCleared
}) {
  const [bankBalance, setBankBalance] = useState(0);
  const [selectedBankId, setSelectedBankId] = useState(101);
  const [banks, setBanks] = useState([]);

  const [statusValue, setStatusValue] = useState('');
  const [statusDirty, setStatusDirty] = useState(false);

  useEffect(() => {
    async function loadBanks() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/settings/banking`
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const data = await response.json();

        const activeBanks = Array.isArray(data?.banks)
          ? data.banks.filter(
              (bank) =>
                String(
                  bank.active || 'Y'
                ).toUpperCase() === 'Y'
            )
          : [];

        setBanks(activeBanks);
      } catch (error) {
        console.error(
          'Error loading CR bank list:',
          error
        );
      }
    }

    loadBanks();
  }, []);

  useEffect(() => {
    async function loadBankBalance() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/cash-flow?bankId=${selectedBankId}&fiscalYear=${new Date().getFullYear()}`
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const data = await response.json();

        setBankBalance(
          Number(data?.ledger?.currentBalance) || 0
        );
      } catch (error) {
        console.error(
          'Error loading CR bank balance:',
          error
        );
      }
    }

    loadBankBalance();
  }, [selectedBankId, balanceRefreshKey]);

  useEffect(() => {
    const status = selectedCheckRow?.status || '';

    if (status === 'Pending') {
      setStatusValue('PENDING');
    } else if (status === 'Cleared') {
      setStatusValue('CLEARED');
    } else if (status === 'Voided') {
      setStatusValue('VOIDED');
    } else {
      setStatusValue(status.toUpperCase());
    }

    setStatusDirty(false);
  }, [selectedCheckRow]);

  const isValidDate = (value) => {
    const match = value.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/
    );

    if (!match) {
      return false;
    }

    const month = Number(match[1]);
    const day = Number(match[2]);

    let year = Number(match[3]);

    if (year < 100) {
      year += 2000;
    }

    const date = new Date(
      year,
      month - 1,
      day
    );

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  const normalizeDateForServer = (value) => {
    const parts = value.split('/');

    const month = Number(parts[0]);
    const day = Number(parts[1]);

    let year = Number(parts[2]);

    if (year < 100) {
      year += 2000;
    }

    return (
      `${year}-` +
      `${String(month).padStart(2, '0')}-` +
      `${String(day).padStart(2, '0')}`
    );
  };

  const formatStoredDate = (value) => {
    if (!value) {
      return 'CLEARED';
    }

    const text = String(value).slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return 'CLEARED';
    }

    const [year, month, day] = text.split('-');

    return (
      `${Number(month)}/` +
      `${Number(day)}/` +
      `${year.slice(-2)}`
    );
  };

  const handleStatusSave = async () => {
    if (
      selectedCheckRow?.status !== 'Pending' &&
      selectedCheckRow?.status !== 'Cleared'
    ) {
      return;
    }

    if (!isValidDate(statusValue)) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text:
          'Enter a valid date in mm/dd/yyyy format.',
        confirmButtonText: 'OK'
      });

      if (selectedCheckRow?.status === 'Pending') {
        setStatusValue('PENDING');
      } else {
        setStatusValue(
          formatStoredDate(
            selectedCheckRow?.dateCleared
          )
        );
      }

      setStatusDirty(false);
      return;
    }

    const clearedDateForServer =
      normalizeDateForServer(statusValue);

    let changeIssuedDate = false;

    const enteredDateParts =
      statusValue.split('/');

    let enteredYear =
      Number(enteredDateParts[2]);

    if (enteredYear < 100) {
      enteredYear += 2000;
    }

    const enteredDate = new Date(
      enteredYear,
      Number(enteredDateParts[0]) - 1,
      Number(enteredDateParts[1])
    );

    const issuedDateValue =
      selectedCheckRow?.dateIssued || '';

    if (issuedDateValue) {
      const issuedDate =
        new Date(issuedDateValue);

      if (
        !Number.isNaN(issuedDate.getTime()) &&
        enteredDate < issuedDate
      ) {
        const result = await Swal.fire({
          icon: 'warning',
          title: 'Date Before Issued Date',
          text:
            'The cleared date entered is before the check issued date. Do you want to change the issued date to the entered date?',
          showCancelButton: true,
          confirmButtonText: 'YES',
          cancelButtonText: 'CANCEL'
        });

        if (!result.isConfirmed) {
          if (
            selectedCheckRow?.status ===
            'Pending'
          ) {
            setStatusValue('PENDING');
          } else {
            setStatusValue(
              formatStoredDate(
                selectedCheckRow?.dateCleared
              )
            );
          }

          setStatusDirty(false);
          return;
        }

        changeIssuedDate = true;
      }
    }

    const saveEndpoint =
      selectedCheckRow?.status === 'Cleared'
        ? '/check-register/adjust-cleared-date'
        : '/check-register/clear';

    const response = await fetch(
      `${API_BASE_URL}${saveEndpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionNumber:
            selectedCheckRow?.transactionNo,
          clearedDate:
            clearedDateForServer,
          changeIssuedDate
        })
      }
    );

    const saveResult =
      await response.json();

    if (!response.ok) {
      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text:
          saveResult?.error ||
          'Unable to clear this check.'
      });

      if (
        selectedCheckRow?.status === 'Pending'
      ) {
        setStatusValue('PENDING');
      } else {
        setStatusValue(
          formatStoredDate(
            selectedCheckRow?.dateCleared
          )
        );
      }

      setStatusDirty(false);
      return;
    }

    setStatusDirty(false);
    setStatusValue('CLEARED');

    if (onCheckCleared) {
      onCheckCleared(saveResult);
    }

    await Swal.fire({
      icon: 'success',
      title: 'Saved',
      text: 'Check cleared successfully.',
      confirmButtonText: 'OK'
    });
  };

  return (
    <div className="cr-bank-row">
      <span className="cr-bank-label">
        Bank Balances:
      </span>

      <label className="cr-bank-acct-label">
        Bank Acct:
      </label>

      <select
        className="cr-bank-select"
        id="crBankAcct"
        value={selectedBankId}
        onChange={(event) => {
          const bankId =
            Number(event.target.value);

          setSelectedBankId(bankId);
          onBankChange?.(bankId);
        }}
      >
        {banks.map((bank) => (
          <option
            key={bank.id}
            value={Number(bank.bankId)}
          >
            {`${bank.bankType} ${bank.bankName} - ${bank.bankId}`}
          </option>
        ))}
      </select>

      <label className="cr-balance-label">
        Balance:
      </label>

      <input
        className="cr-balance-input"
        id="crBankBalance"
        value={bankBalance.toLocaleString(
          'en-US',
          {
            style: 'currency',
            currency: 'USD'
          }
        )}
        readOnly
      />

      <div className="cr-status-box-wrap">
        <span className="cr-status-box-label">
          STATUS:
        </span>

        <input
          className={`cr-status-box ${
            selectedCheckRow?.status ===
            'Pending'
              ? 'pending'
              : ''
          }`}
          type="text"
          value={statusValue}
          readOnly={
            selectedCheckRow?.status !==
              'Pending' &&
            selectedCheckRow?.status !==
              'Cleared'
          }
          onFocus={() => {
            if (
              (selectedCheckRow?.status ===
                'Pending' &&
                statusValue === 'PENDING') ||
              (selectedCheckRow?.status ===
                'Cleared' &&
                statusValue === 'CLEARED')
            ) {
              setStatusValue('');
              setStatusDirty(true);
            }
          }}
          onChange={(event) => {
            if (
              selectedCheckRow?.status ===
                'Pending' ||
              selectedCheckRow?.status ===
                'Cleared'
            ) {
              setStatusValue(
                event.target.value
              );

              setStatusDirty(true);
            }
          }}
        />

        <button
          type="button"
          className={`cr-status-save-btn ${
            statusDirty ? 'dirty' : ''
          }`}
          disabled={
            selectedCheckRow?.status !==
              'Pending' &&
            selectedCheckRow?.status !==
              'Cleared'
          }
          onClick={handleStatusSave}
        >
          SAVE
        </button>
      </div>
    </div>
  );
}

export default BankRow;
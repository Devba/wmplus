


import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import { API_BASE_URL } from '../../../../config/api';
import { openOverlay } from '../../../../engines';

import FilterUF from '../../../../components/FilterUF/FilterUF';
import EnterAssmtPaymentUF from './EnterAssmtPaymentUF/EnterAssmtPaymentUF';
import VoidAssmtPaymentUF from '../VoidAssmtPaymentUF/VoidAssmtPaymentUF';

function ButtonRow({
  onSelectPage,
  residents = [],
  selectedPaymentRow,
  selectedPaymentRows,
  onApplyResidentFilter,
  onResetResidentFilter,
  onAddPayment,
  onVoidSuccess,
  onPaymentCleared
}) {
  const [statusValue, setStatusValue] = useState('');
  const [statusDirty, setStatusDirty] = useState(false);

  const selectedRowCount =
  Array.isArray(selectedPaymentRows)
    ? selectedPaymentRows.length
    : 0;

const isMultiRowSelection =
  selectedRowCount > 1;

  const selectedTransactionNumbers =
  Array.isArray(selectedPaymentRows)
    ? selectedPaymentRows
        .map((row) => row?.transaction)
        .filter(Boolean)
    : [];

  const rawStatus =
    String(selectedPaymentRow?.status || '').trim();

  const isVoided =
    rawStatus === 'Voided' ||
    rawStatus === 'VOID';

  const isCleared =
    isMultiRowSelection ||
    rawStatus === 'Cleared' ||
    rawStatus === 'POSTED';

  useEffect(() => {
  if (isMultiRowSelection) {
    setStatusValue('CLEARED');
    } else if (!selectedPaymentRow) {
      setStatusValue('');
    } else if (isVoided) {
      setStatusValue('VOIDED');
    } else if (isCleared) {
      setStatusValue('CLEARED');
    } else {
      setStatusValue(
        rawStatus
          ? rawStatus.toUpperCase()
          : ''
      );
    }

    setStatusDirty(false);
  }, [
  selectedPaymentRow,
  isMultiRowSelection,
  isVoided,
  isCleared,
  rawStatus
]);

  const isValidDate = (value) => {
    const match = String(value).match(
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
    const parts = String(value).split('/');

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

  const handleStatusSave = async () => {
    if (!isCleared) {
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

      setStatusValue('CLEARED');
      setStatusDirty(false);
      return;
    }

    const clearedDateForServer =
      normalizeDateForServer(statusValue);

    try {
      const saveUrl =
        isMultiRowSelection
          ? `${API_BASE_URL}/apr/adjust-cleared-date-batch`
          : `${API_BASE_URL}/apr/adjust-cleared-date`;





      const response = await fetch(
        saveUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
  isMultiRowSelection
    ? {
        transactionNumbers:
          selectedTransactionNumbers,
        clearedDate:
          clearedDateForServer
      }
    : {
        transactionNumber:
          selectedPaymentRow?.transaction,
        clearedDate:
          clearedDateForServer
      }
)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        await Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text:
            result?.error ||
            'Unable to change the APR cleared date.',
          confirmButtonText: 'OK'
        });

        setStatusValue('CLEARED');
        setStatusDirty(false);
        return;
      }

      setStatusValue('CLEARED');
      setStatusDirty(false);

      if (onPaymentCleared) {
        onPaymentCleared(result);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Saved',
        text:
          'APR cleared date updated successfully.',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error(
        'APR cleared-date save error:',
        error
      );

      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text:
          'Unable to change the APR cleared date.',
        confirmButtonText: 'OK'
      });

      setStatusValue('CLEARED');
      setStatusDirty(false);
    }
  };

  const handleOpenResidentFilter = () => {
    openOverlay({
      title: '',
      component: (
        <FilterUF
          page="apr"
          pageLabel="ASSESSMENT PAYMENT REGISTER"
          showResidents
          showVendors={false}
          residents={residents}
          onApplyFilter={
            onApplyResidentFilter
          }
        />
      ),
      width: '1260px',
      maxWidth: '96vw'
    });
  };

  const handleOpenEnterPayment = () => {
    openOverlay({
      title:
        'RESIDENT ASSESSMENT PAYMENT',
      component: (
        <EnterAssmtPaymentUF
          residents={residents}
          onAddPayment={
            onAddPayment
          }
        />
      ),
      width: '1200px',
      maxWidth: '96vw'
    });
  };

  const handleOpenVoidPayment = () => {
    openOverlay({
      title: 'VOID ASSESSMENT PAYMENT',
      component: (
        <VoidAssmtPaymentUF
          onVoidSuccess={onVoidSuccess}
        />
      ),
      width: '820px',
      maxWidth: '96vw'
    });
  };

  return (
    <div className="apr-button-row">
      <button
        type="button"
        className="apr-btn-filter"
        onClick={handleOpenResidentFilter}
      >
        RESIDENT FILTER
      </button>

      <button
        type="button"
        className="apr-btn-reset"
        onClick={onResetResidentFilter}
      >
        RESET FILTER
      </button>

      <button
        type="button"
        className="apr-btn-back"
        onClick={() =>
          onSelectPage(
            'master-navigation-panel'
          )
        }
      >
        BACK TO NAV PANEL
      </button>

      <button
        type="button"
        className="apr-btn-enter"
        onClick={handleOpenEnterPayment}
      >
        ENTER ASS&apos;MT PAYMENTS
      </button>

      <button
        type="button"
        className="apr-btn-void"
        onClick={handleOpenVoidPayment}
      >
        VOID ASSMT PAYMT
      </button>

      <button
        type="button"
        className="apr-btn-ach"
      >
        ENTER ACH PAYMENTS
      </button>

      <div className="apr-status-box-wrap">
        <span className="apr-status-box-label">
          STATUS:
        </span>

        <input
          className="apr-status-box"
          type="text"
          value={statusValue}
          readOnly={!isCleared}
          onFocus={() => {
            if (
              isCleared &&
              statusValue === 'CLEARED'
            ) {
              setStatusValue('');
              setStatusDirty(true);
            }
          }}
          onChange={(event) => {
            if (isCleared) {
              setStatusValue(
                event.target.value
              );
              setStatusDirty(true);
            }
          }}
        />

        <button
          type="button"
          className={`apr-status-save-btn ${
            statusDirty ? 'dirty' : ''
          }`}
          disabled={!isCleared}
          onClick={handleStatusSave}
        >
          SAVE
        </button>
      </div>
    </div>
  );
}

export default ButtonRow;



import { useEffect, useState } from 'react';
import { openOverlay } from '../../../../engines';
import EnterDepositUF from '../EnterDepositUF/EnterDepositUF';
import MonthlySummaryUF from '../MonthlySummaryUF/MonthlySummaryUF';
import VoidDepositUF from '../VoidDepositUF/VoidDepositUF.jsx';
import ModifyGLDepositUF from '../ModifyGLDepositUF/ModifyGLDepositUF.jsx';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../../../config/api';

function ButtonRow({
  onSelectPage,
  onAddDeposit,
  depositRows,
  onDepositCleared,
  selectedDepositRow
}) {

const [statusValue, setStatusValue] = useState(''); 
const [statusDirty, setStatusDirty] = useState(false);

const isValidDate = (value) => {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);

  let year = Number(match[3]);

  if (year < 100) {
    year += 2000;
  }

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const handleStatusSave = async () => {
  if (selectedDepositRow?.status !== 'Pending') {
    return;
  }

  if (!isValidDate(statusValue)) {
    await Swal.fire({
      icon: 'error',
      title: 'Invalid Date',
      text: 'Enter a valid date in mm/dd/yyyy format.',
      confirmButtonText: 'OK'
    });

      setStatusValue('');
    return;
  }

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

  const clearedDateForServer = normalizeDateForServer(statusValue);
  let changeDepositDate = false;


  const enteredDateParts = statusValue.split('/');

let enteredYear = Number(enteredDateParts[2]);

if (enteredYear < 100) {
  enteredYear += 2000;
}

const enteredDate = new Date(
  enteredYear,
  Number(enteredDateParts[0]) - 1,
  Number(enteredDateParts[1])
);

const depositDateValue =
  selectedDepositRow?.depositDate ||
  selectedDepositRow?.date ||
  '';

if (depositDateValue) {
  const depositDate = new Date(depositDateValue);

  if (
    !Number.isNaN(depositDate.getTime()) &&
    enteredDate < depositDate
  ) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Date Before Issued Date',
      text:
        'The date entered is before the issued date. Do you want to change the issued date to the entered date or do you want to cancel / change the entered date?',
      showCancelButton: true,
      confirmButtonText: 'YES',
      cancelButtonText: 'CANCEL'
    });

    if (!result.isConfirmed) {
      setStatusValue('');
      return;
    }

    changeDepositDate = true;



  }
}


    const response = await fetch(
  `${API_BASE_URL}/deposit-register/clear`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      transactionNumber:
        selectedDepositRow?.transactionNumber ||
        selectedDepositRow?.transaction,
      clearedDate: clearedDateForServer,
      changeDepositDate
    })
  }
);

const saveResult = await response.json();

if (!response.ok) {
  await Swal.fire({
    icon: 'error',
    title: 'Save Failed',
    text: saveResult?.error || 'Unable to clear this deposit.'
  });

  return;
}

setStatusDirty(false);
setStatusValue('CLEARED');

if (onDepositCleared) {
  onDepositCleared(saveResult);
}

await Swal.fire({
  icon: 'success',
  title: 'Saved',
  text: 'Deposit cleared successfully.',
  confirmButtonText: 'OK'
});




};


useEffect(() => {
  const status = selectedDepositRow?.status || '';

  if (status === 'Pending') {
    setStatusValue('PENDING');
  } else if (status === 'Cleared') {
    setStatusValue('CLEARED');
  } else if (status === 'Voided') {
    setStatusValue('VOIDED');
  } else {
    setStatusValue(status.toUpperCase());
  }
}, [selectedDepositRow]);


const handleEnterDeposits = () => {
  openOverlay({
    title: 'DEPOSIT REGISTER ENTRY',
    component: (
      <EnterDepositUF onAddDeposit={onAddDeposit} />
    ),
    width: '1320px',
    maxWidth: '98vw'
  });
};



  const handleMonthlySummary = () => {
    openOverlay({
      title: 'DEPOSIT SUMMARY REPORT',
      component: (
        <MonthlySummaryUF
          onSelectPage={onSelectPage}
          depositRows={depositRows}
        />
      ),
      width: '360px',
      maxWidth: '360px'
    });
  };

  const handleVoidDeposits = () => {
    openOverlay({
      title: 'VOID DEPOSITS',
      component: <VoidDepositUF />,
      width: '900px',
      maxWidth: '900px'
    });
  };

  const handleModifyGL = () => {
    openOverlay({
      title: 'Modify Deposit Register GL#',
      component: <ModifyGLDepositUF />,
      width: '1220px',
      maxWidth: '1220px'
    });
  };

  return (
    <div className="depreg-button-row">
      <button
        type="button"
        className="depreg-btn-back"
        onClick={() => onSelectPage('master-navigation-panel')}
      >
        BACK TO NAV PANEL
      </button>

      <button
        type="button"
        className="depreg-btn-enter"
        onClick={handleEnterDeposits}
      >
        ENTER DEPOSITS
      </button>

      <button
        type="button"
        className="depreg-btn-void"
        onClick={handleVoidDeposits}
      >
        VOID DEPOSITS
      </button>

      <button
        type="button"
        className="depreg-btn-modify"
        onClick={handleModifyGL}
      >
        MODIFY GL#
      </button>

      <button
        type="button"
        className="depreg-btn-summary"
        onClick={handleMonthlySummary}
      >
        MONTHLY SUMMARY
      </button>

      <button className="depreg-btn-receivables">
        RECEIVABLES SUMMARY
      </button>
      
      <div className="depreg-status-box-wrap">
        <span className="depreg-status-box-label">
          STATUS:
        </span>

        <input
            className={`depreg-status-box ${
              selectedDepositRow?.status === 'Pending' ? 'pending' : ''
            }`}
            type="text"
            value={statusValue}
            readOnly={selectedDepositRow?.status !== 'Pending'}
            onFocus={() => {
              if (
                selectedDepositRow?.status === 'Pending' &&
                statusValue === 'PENDING'
              ) {
                setStatusValue('');
                setStatusDirty(true);
              }
            }}
            onChange={(event) => {
              if (selectedDepositRow?.status === 'Pending') {
                setStatusValue(event.target.value);
              }
            }}
          />

              <button
          type="button"
          className={`depreg-status-save-btn ${
            statusDirty ? 'dirty' : ''
          }`}
          disabled={selectedDepositRow?.status !== 'Pending'}
          onClick={handleStatusSave}
        >
          SAVE
        </button>


      </div>


    </div>
  );
}

export default ButtonRow;
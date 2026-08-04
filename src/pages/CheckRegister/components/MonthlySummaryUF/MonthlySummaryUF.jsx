




import { useMemo, useState } from 'react';

import { closeOverlay } from '../../../../engines';
import './MonthlySummaryUF.css';

function MonthlySummaryUF({
  onSelectPage,
  checkRows = []
}) {
  const [selectedMonth, setSelectedMonth] =
    useState('');

  const months = useMemo(
    () => [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    []
  );

  const currentMonth =
    new Date().getMonth();

  const handleCreateReport = () => {
    const selectedMonthNumber =
      Number(selectedMonth);

    if (!selectedMonthNumber) {
      return;
    }

    const matches = checkRows.filter((row) => {
  const clearedDateText =
    String(row.dateCleared || '').trim();

  if (!clearedDateText) {
    return false;
  }

  const clearedDate = new Date(clearedDateText);

  if (Number.isNaN(clearedDate.getTime())) {
    return false;
  }

  return (
    clearedDate.getMonth() + 1 ===
    selectedMonthNumber
  );
});

    if (matches.length === 0) {
      window.alert(
        'No checks found for selected month.'
      );
      return;
    }

    window.crMonthlySummaryData = {
      month: selectedMonthNumber,
      rows: matches
    };

    window.alert(
      'Process Completed Successfully'
    );

    closeOverlay();

    onSelectPage(
      'check-register-monthly-summary'
    );
  };

  return (
    <div className="cr-ms-body">
      <div className="cr-ms-title">
        Select Month For Report
      </div>

      <div className="cr-ms-field">
        <select
          id="crMsMonth"
          value={selectedMonth}
          onChange={(event) =>
            setSelectedMonth(
              event.target.value
            )
          }
        >
          <option value="">
            Select Month
          </option>

          {months
            .slice(
              0,
              currentMonth + 1
            )
            .map(
              (month, index) => (
                <option
                  key={month}
                  value={index + 1}
                >
                  {month}
                </option>
              )
            )}
        </select>
      </div>

      <div className="cr-ms-action">
        <button
          id="crMsCreateBtn"
          type="button"
          disabled={!selectedMonth}
          onClick={
            handleCreateReport
          }
        >
          Create Report
        </button>
      </div>
    </div>
  );
}

export default MonthlySummaryUF;
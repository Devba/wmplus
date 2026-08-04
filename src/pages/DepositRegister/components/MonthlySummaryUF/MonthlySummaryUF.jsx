




import { closeOverlay } from '../../../../engines';
import './MonthlySummaryUF.css';
import { useMemo, useState } from 'react';


function MonthlySummaryUF({ onSelectPage }) {
  const [selectedMonth, setSelectedMonth] = useState('');

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

  const currentMonth = new Date().getMonth();

  const handledpeateReport = () => {
  if (!selectedMonth) {
    return;
  }

  closeOverlay();
  onSelectPage('deposit-register-monthly-summary');
};

  
  return (
    <div className="dp-ms-body">
      <div className="dp-ms-title">
        Select Month For Report
      </div>

      <div className="dp-ms-field">
        <select
          id="dpMsMonth"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
        >
          <option value="">Select Month</option>

          {months.slice(0, currentMonth + 1).map((month, index) => (
            <option
              key={month}
              value={index + 1}
            >
              {month}
            </option>
          ))}
        </select>
      </div>

      <div className="dp-ms-action">
        <button
          id="dpMsdpeateBtn"
          type="button"
          disabled={!selectedMonth}
          onClick={handledpeateReport}
        >
          Create Report
        </button>
      </div>
    </div>
  );
}

export default MonthlySummaryUF;
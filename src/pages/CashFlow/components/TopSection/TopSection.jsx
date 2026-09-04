



import React from 'react';
import './TopSection.css';

function TopSection({
  selectedBankId,
  setSelectedBankId,
  selectedFiscalYear,
  setSelectedFiscalYear
}) {
  return (
    <div className="cf-topsection">

      <div className="cf-title-row">
            <div className="cf-title-text">
                CASH FLOW
            </div>

            <div className="cf-title-status">

        <div className="cf-control-group">
            <label className="cf-control-label">Last Updated:</label>

            <input
                className="cf-last-updated-display"
                type="text"
                value="--"
                readOnly
            />
        </div>

        <button
            type="button"
            className="cf-refresh-button"
            >
            Refresh
        </button>



            <div className="cf-control-group">
        <label className="cf-control-label">Outstanding Checks:</label>

        <input
            className="cf-balance-display"
            type="text"
            value="$0.00"
            readOnly
        />
        </div>

        <div className="cf-control-group">
        <label className="cf-control-label">Projected Balance:</label>

        <input
            className="cf-balance-display"
            type="text"
            value="$0.00"
            readOnly
        />
        </div>


          </div>
       </div>
      <div className="cf-controls-row">

  <div className="cf-control-group">
    <label className="cf-control-label">Bank:</label>

    <select
        className="cf-bank-select"
        value={selectedBankId}
        onChange={(e) => setSelectedBankId(e.target.value)}
        >
      <option value="" disabled>
        Select Bank
      </option>

      <option value="101">
        Bank of America - Operating - Bank ID 101
      </option>

      <option value="201">
        Bank of America - Capital - Bank ID 201
            </option>
            </select>
        </div>

        <div className="cf-control-group">
        <label className="cf-control-label">Fiscal Year:</label>

        <select
            className="cf-fiscal-year-select"
            value={selectedFiscalYear}
            onChange={(e) => setSelectedFiscalYear(e.target.value)}
            >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
        </select>
        </div>

        <div className="cf-control-group">
        <label className="cf-control-label">Beginning FY Balance:</label>

        <input
            className="cf-balance-display"
            type="text"
            value="$0.00"
            readOnly
        />
        </div>

        <div className="cf-control-group">
        <label className="cf-control-label">Current Balance:</label>

        <input
            className="cf-balance-display"
            type="text"
            value="$0.00"
            readOnly
        />
        </div>




        









        </div>

    </div>
  );
}

export default TopSection;
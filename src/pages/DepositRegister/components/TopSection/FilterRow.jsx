

import { useMemo } from 'react';

import { openOverlay } from '../../../../engines';
import FilterUF from '../../../../components/FilterUF/FilterUF';

function FilterRow({
  depositRows = [],
  onApplyVendorResidentFilter,
  onResetVendorResidentFilter
}) {
  const {
    residentLookupRows,
    vendorLookupRows
  } = useMemo(() => {
    const residentsByAccount = new Map();
    const vendorsByAccount = new Map();

    depositRows.forEach((row) => {
      const explicitResidentAccount = String(
        row.ownerAccount ||
        row.depositorId ||
        ''
      ).trim();

      const explicitVendorAccount = String(
        row.vendorId || ''
      ).trim();

      const temporaryAccount = String(
        row.vendorAcct || ''
      ).trim();

      const residentAccount =
        explicitResidentAccount ||
        (
          temporaryAccount.length > 3
            ? temporaryAccount
            : ''
        );

      const vendorAccount =
        explicitVendorAccount ||
        (
          temporaryAccount.length === 3
            ? temporaryAccount
            : ''
        );

      const depositorName = String(
        row.depositorName ||
        row.residentName ||
        ''
      ).trim();

      const vendorName = String(
        row.vendorName ||
        row.payeeName ||
        ''
      ).trim();

      if (
        residentAccount &&
        !residentsByAccount.has(residentAccount)
      ) {
        residentsByAccount.set(
          residentAccount,
          {
            type: 'resident',
            acctNo: residentAccount,
            displayName:
              depositorName ||
              `Resident ${residentAccount}`,
            residence:
              row.residentAddress ||
              row.residence ||
              ''
          }
        );
      }

      if (
        vendorAccount &&
        !vendorsByAccount.has(vendorAccount)
      ) {
        vendorsByAccount.set(
          vendorAccount,
          {
            type: 'vendor',
            vendorId: vendorAccount,
            vendorName:
              vendorName ||
              `Vendor ${vendorAccount}`,
            vendorAddress:
              row.vendorAddress ||
              ''
          }
        );
      }
    });

    return {
      residentLookupRows: Array.from(
        residentsByAccount.values()
      ),

      vendorLookupRows: Array.from(
        vendorsByAccount.values()
      )
    };
  }, [depositRows]);

  const handleOpenVendorResidentFilter = () => {
    openOverlay({
      title: '',
      component: (
        <FilterUF
          page="dp"
          pageLabel="DEPOSIT REGISTER"
          showResidents
          showVendors
          residents={residentLookupRows}
          vendors={vendorLookupRows}
          onApplyFilter={
            onApplyVendorResidentFilter
          }
        />
      ),
      width: '1260px',
      maxWidth: '96vw'
    });
  };

  return (
    <div className="depreg-filter-row">
      <div className="depreg-filter-group">
        <span className="depreg-filter-label">
          Period:
        </span>

        <select
          className="depreg-period-select"
          defaultValue="All Years"
        >
          <option>All Years</option>
          <option>90 Days</option>
          <option>180 Days</option>
          <option>Current Year</option>
          <option>Previous Year</option>
        </select>
      </div>

      <input
        className="depreg-txn-input"
        type="text"
        placeholder="Deposit Transaction#"
      />

      <div className="depreg-filter-group">
        <span className="depreg-filter-label">
          Status:
        </span>

        <select
          className="depreg-status-select"
          defaultValue="All"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Cleared</option>
          <option>Voided</option>
        </select>
      </div>

      <div className="depreg-filter-group">
        <span className="depreg-filter-label">
          Wild Card:
        </span>

        <input
          className="depreg-wild-input"
          type="text"
          placeholder="Search row text"
        />
      </div>

      <button
        type="button"
        className="depreg-go-btn"
      >
        GO
      </button>

      <button
        type="button"
        className="depreg-reset-filter-btn"
      >
        RESET FILTER
      </button>

      <div className="depreg-filter-spacer" />

      <button
        type="button"
        className="depreg-vendor-filter-btn"
        onClick={handleOpenVendorResidentFilter}
      >
        VENDOR / RESIDENT FILTER
      </button>

      <button
        type="button"
        className="depreg-reset-vendor-btn"
        onClick={onResetVendorResidentFilter}
      >
        RESET FILTER
      </button>
    </div>
  );
}

export default FilterRow;
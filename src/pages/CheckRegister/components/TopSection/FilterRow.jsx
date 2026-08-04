import { useMemo } from 'react';

import { openOverlay } from '../../../../engines';
import FilterUF from '../../../../components/FilterUF/FilterUF';

function FilterRow({
  checkRows = [],
  onApplyVendorResidentFilter,
  onResetVendorResidentFilter
}) {
  const {
    residentLookupRows,
    vendorLookupRows
  } = useMemo(() => {
    const residentsByAccount = new Map();
    const vendorsByAccount = new Map();

    checkRows.forEach((row) => {
      const accountNumber = String(
        row.vendorOrResidentAcct || ''
      ).trim();

      if (!accountNumber) {
        return;
      }

      const payeeName = String(
        row.payeeName || ''
      ).trim();

      /*
       * Temporary Legacy-compatible rule:
       *
       * Three-character account values are vendor IDs.
       * Longer account values are resident accounts.
       *
       * The server will later identify the record type
       * explicitly and return the lookup chunks.
       */
      const isVendor =
        accountNumber.length === 3;

      if (isVendor) {
        if (
          !vendorsByAccount.has(accountNumber)
        ) {
          vendorsByAccount.set(
            accountNumber,
            {
              type: 'vendor',
              vendorId: accountNumber,
              vendorName: payeeName,

              /*
               * The current CR sample rows do not contain
               * a vendor address. The server response will
               * supply it later.
               */
              vendorAddress:
                row.vendorAddress ||
                row.address ||
                ''
            }
          );
        }

        return;
      }

      if (
        !residentsByAccount.has(accountNumber)
      ) {
        residentsByAccount.set(
          accountNumber,
          {
            type: 'resident',
            acctNo: accountNumber,

            /*
             * FilterUF accepts displayName directly, so
             * CR does not need to split the payee name.
             */
            displayName: payeeName,

            /*
             * The current CR sample rows do not contain
             * resident addresses. The server-returned
             * lookup records will supply them later.
             */
            residence:
              row.residentAddress ||
              row.residence ||
              row.address ||
              ''
          }
        );
      }
    });

    return {
      residentLookupRows:
        Array.from(
          residentsByAccount.values()
        ),

      vendorLookupRows:
        Array.from(
          vendorsByAccount.values()
        )
    };
  }, [checkRows]);

  const handleOpenVendorResidentFilter =
    () => {
      openOverlay({
        title: '',
        component: (
          <FilterUF
            page="cr"
            pageLabel="CHECK REGISTER"
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
    <div className="cr-filter-row">
      <label className="cr-filter-label">
        Period:
      </label>

      <select className="cr-period-select">
        <option>All Years</option>
        <option>Current Year</option>
        <option>Previous Year</option>
      </select>

      <input
        className="cr-txn-input"
        placeholder="Check/Transaction #"
      />

      <label className="cr-filter-label">
        Status:
      </label>

      <select className="cr-status-select">
        <option>All</option>
        <option>Open</option>
        <option>Cleared</option>
        <option>Voided</option>
      </select>

      <label className="cr-filter-label cr-wild-label">
        Wild Card:
      </label>

      <input
        className="cr-wild-input"
        placeholder="Search row text"
      />

      <button
        type="button"
        className="cr-go-btn"
      >
        GO
      </button>

      <button
        type="button"
        className="cr-reset-filter-btn"
      >
        RESET FILTER
      </button>

      <button
        type="button"
        className="cr-vendor-filter-btn"
        onClick={
          handleOpenVendorResidentFilter
        }
      >
        VENDOR / RESIDENT FILTER
      </button>

      <button
        type="button"
        className="cr-reset-vendor-btn"
        onClick={
          onResetVendorResidentFilter
        }
      >
        RESET FILTER
      </button>
    </div>
  );
}

export default FilterRow;
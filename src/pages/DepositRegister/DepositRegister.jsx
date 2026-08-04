

import { useMemo, useState } from 'react';

import './DepositRegister.css';

import TopSection from './components/TopSection/TopSection';
import BodyBox from './components/BodyBox/BodyBox';

import depositRegisterSampleData from './data/depositRegisterSampleData';

function DepositRegister({ onSelectPage }) {
  const [depositRows, setDepositRows] = useState(
    depositRegisterSampleData
  );

  const [registerFilter, setRegisterFilter] =
    useState(null);

  const displayedDepositRows = useMemo(() => {
    if (!registerFilter) {
      return depositRows;
    }

    return depositRows.filter((row) => {
      if (registerFilter.filterType === 'resident') {
        const residentAccount = String(
          row.ownerAccount ||
          row.depositorId ||
          (
            String(row.vendorAcct || '').length > 3
              ? row.vendorAcct
              : ''
          )
        ).trim();

        return (
          residentAccount ===
          registerFilter.accountNumber
        );
      }

      if (registerFilter.filterType === 'vendor') {
        const vendorAccount = String(
          row.vendorId ||
          (
            String(row.vendorAcct || '').length === 3
              ? row.vendorAcct
              : ''
          )
        ).trim();

        return (
          vendorAccount ===
          registerFilter.accountNumber
        );
      }

      return true;
    });
  }, [depositRows, registerFilter]);

  const handleAddDeposit = (newDeposit) => {
    setDepositRows((currentRows) => [
      ...currentRows,
      newDeposit
    ]);
  };

  const handleApplyVendorResidentFilter = (
    request
  ) => {
    const filterType = String(
      request?.filterType || ''
    ).trim();

    const accountNumber = String(
      request?.accountNumber || ''
    ).trim();

    if (
      !accountNumber ||
      !['resident', 'vendor'].includes(filterType)
    ) {
      window.alert(
        'No valid resident or vendor was selected.'
      );
      return;
    }

    setRegisterFilter({
      filterType,
      accountNumber
    });
  };

  const handleResetVendorResidentFilter = () => {
    setRegisterFilter(null);
  };

  return (
    <div className="depreg-page">
      <div className="depreg-shell">
        <div className="depreg-fixed">
          <TopSection
            onSelectPage={onSelectPage}
            onAddDeposit={handleAddDeposit}
            depositRows={depositRows}
            onApplyVendorResidentFilter={
              handleApplyVendorResidentFilter
            }
            onResetVendorResidentFilter={
              handleResetVendorResidentFilter
            }
          />
        </div>

        <BodyBox
          depositRows={displayedDepositRows}
        />
      </div>
    </div>
  );
}

export default DepositRegister;
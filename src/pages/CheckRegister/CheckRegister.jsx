// =====================================================
// 2026-07-09
// CHECK REGISTER
// PAGE STATE OWNER
// =====================================================

import { useMemo, useState } from 'react';

import './CheckRegister.css';

import BodyBox from './components/BodyBox/BodyBox';
import TopSection from './components/TopSection/TopSection';

import checkRegisterSampleData from './data/checkRegisterSampleData';

function CheckRegister({ onSelectPage }) {
  const [checkRows, setCheckRows] = useState(
    checkRegisterSampleData
  );

  const [
    vendorResidentAccountFilter,
    setVendorResidentAccountFilter
  ] = useState('');

  const displayedCheckRows = useMemo(() => {
    if (!vendorResidentAccountFilter) {
      return checkRows;
    }

    return checkRows.filter((row) => {
      const rowAccount = String(
        row.vendorOrResidentAcct || ''
      ).trim();

      return (
        rowAccount ===
        String(vendorResidentAccountFilter)
      );
    });
  }, [
    checkRows,
    vendorResidentAccountFilter
  ]);

  const handleAddCheck = (newCheck) => {
    setCheckRows((currentRows) => [
      ...currentRows,
      newCheck
    ]);
  };

  const handleApplyVendorResidentFilter = (
    request
  ) => {
    const accountNumber = String(
      request?.accountNumber || ''
    ).trim();

    if (!accountNumber) {
      window.alert(
        'No resident or vendor account was selected.'
      );
      return;
    }

    setVendorResidentAccountFilter(
      accountNumber
    );
  };

  const handleResetVendorResidentFilter = () => {
    setVendorResidentAccountFilter('');
  };

  return (
    <div className="checkreg-page">
      <div className="checkreg-shell">
        <div className="checkreg-fixed">
          <TopSection
            onSelectPage={onSelectPage}
            onAddCheck={handleAddCheck}
            checkRows={checkRows}
            onApplyVendorResidentFilter={
              handleApplyVendorResidentFilter
            }
            onResetVendorResidentFilter={
              handleResetVendorResidentFilter
            }
          />
        </div>

        <BodyBox
          checkRows={displayedCheckRows}
        />
      </div>
    </div>
  );
}

export default CheckRegister;
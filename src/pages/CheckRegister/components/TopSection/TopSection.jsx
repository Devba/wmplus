import BankRow from './BankRow';
import FilterRow from './FilterRow';
import ButtonRow from './ButtonRow';

function TopSection({
  onSelectPage,
  onAddCheck,
  onPrintChecks,
  checkRows,
  selectedCheckRow,
  onCheckCleared,
  onBankChange,
  balanceRefreshKey,
  onApplyVendorResidentFilter,
  onResetVendorResidentFilter
}) {
  return (
    <div className="checkreg-topsection">
      <BankRow
        onBankChange={onBankChange}
        balanceRefreshKey={balanceRefreshKey}
        selectedCheckRow={selectedCheckRow}
        onCheckCleared={onCheckCleared}
      />

      <FilterRow
        checkRows={checkRows}
        onApplyVendorResidentFilter={
          onApplyVendorResidentFilter
        }
        onResetVendorResidentFilter={
          onResetVendorResidentFilter
        }
      />

      <ButtonRow
        onSelectPage={onSelectPage}
        onAddCheck={onAddCheck}
        onPrintChecks={onPrintChecks}
        // onPrintChecks={() => window.alert('TOPSECTION RECEIVED PRINT')}
        checkRows={checkRows}
      />
    </div>
  );
}

export default TopSection;
import BankRow from './BankRow';
import FilterRow from './FilterRow';
import ButtonRow from './ButtonRow';

function TopSection({
  onSelectPage,
  onAddCheck,
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
        checkRows={checkRows}
      />
    </div>
  );
}

export default TopSection;
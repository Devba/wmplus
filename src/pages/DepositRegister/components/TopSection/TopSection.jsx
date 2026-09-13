
import BankRow from './BankRow';
import FilterRow from './FilterRow';
import ButtonRow from './ButtonRow';

function TopSection({
  onSelectPage,
  onAddDeposit,
  depositRows,
  selectedDepositRow,
  onApplyVendorResidentFilter,
  onResetVendorResidentFilter,
  onDepositCleared,
  onBankChange,
  balanceRefreshKey,
}) {
  return (
    <div className="depreg-topsection">
      <BankRow
        onBankChange={onBankChange}
        balanceRefreshKey={balanceRefreshKey}
      />

      <FilterRow
        depositRows={depositRows}
        selectedDepositRow={selectedDepositRow}
        onApplyVendorResidentFilter={
          onApplyVendorResidentFilter
        }
        onResetVendorResidentFilter={
          onResetVendorResidentFilter
        }
      />

      <ButtonRow
        onSelectPage={onSelectPage}
        onAddDeposit={onAddDeposit}
        depositRows={depositRows}
        selectedDepositRow={selectedDepositRow}
        onDepositCleared={onDepositCleared}
      />
    </div>
  );
}

export default TopSection;
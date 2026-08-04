
import BankRow from './BankRow';
import FilterRow from './FilterRow';
import ButtonRow from './ButtonRow';

function TopSection({
  onSelectPage,
  onAddDeposit,
  depositRows,
  onApplyVendorResidentFilter,
  onResetVendorResidentFilter
}) {
  return (
    <div className="depreg-topsection">
      <BankRow />

      <FilterRow
        depositRows={depositRows}
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
      />
    </div>
  );
}

export default TopSection;
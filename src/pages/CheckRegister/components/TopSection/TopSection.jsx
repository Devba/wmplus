


import BankRow from './BankRow';
import FilterRow from './FilterRow';
import ButtonRow from './ButtonRow';

function TopSection({
  onSelectPage,
  onAddCheck,
  checkRows,
  onApplyVendorResidentFilter,
  onResetVendorResidentFilter
}) {
  return (
    <div className="checkreg-topsection">
      <BankRow />

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



import TitleRow from './TitleRow';
import ButtonRow from './ButtonRow';
import FilterRow from './FilterRow';

function TopSection({
  onSelectPage,
  residents,
  selectedResident,
  residentNameFilter,
  residentAddressFilter,
  onResidentNameChange,
  onResidentAddressChange,
  onApplyResidentFilter,
  onResetFilter,
  onAddResident,
  onEditResident
}) {
  return (
    <div className="md-topsection">
      <TitleRow />

      <ButtonRow
        onSelectPage={onSelectPage}
        residents={residents}
        selectedResident={selectedResident}
        onApplyResidentFilter={
          onApplyResidentFilter
        }
        onResetFilter={onResetFilter}
        onAddResident={onAddResident}
        onEditResident={onEditResident}
      />

      <FilterRow
        residents={residents}
        residentNameFilter={residentNameFilter}
        residentAddressFilter={
          residentAddressFilter
        }
        onResidentNameChange={
          onResidentNameChange
        }
        onResidentAddressChange={
          onResidentAddressChange
        }
      />
    </div>
  );
}

export default TopSection;
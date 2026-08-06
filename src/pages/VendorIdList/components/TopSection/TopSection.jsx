


import TitleRow from "./TitleRow";
import ButtonRow from "./ButtonRow";

function TopSection({
  onSelectPage,
  vendorRows,
  selectedVendor,
  onApplyVendorFilter,
  onResetVendorFilter,
  onAddVendorClick,
  onEditVendorClick,
  onDeleteVendorClick
}) {
  return (
    <div className="vid-topsection">
      <TitleRow />

      <ButtonRow
        onSelectPage={onSelectPage}
        vendorRows={vendorRows}
        selectedVendor={selectedVendor}
        onApplyVendorFilter={
          onApplyVendorFilter
        }
        onResetVendorFilter={
          onResetVendorFilter
        }
        onAddVendorClick={onAddVendorClick}
        onEditVendorClick={onEditVendorClick}
        onDeleteVendorClick={onDeleteVendorClick}
      />
    </div>
  );
}

export default TopSection;
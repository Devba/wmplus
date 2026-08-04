


import TitleRow from "./TitleRow";
import ButtonRow from "./ButtonRow";

function TopSection({
  onSelectPage,
  vendorRows,
  onApplyVendorFilter,
  onResetVendorFilter
}) {
  return (
    <div className="vid-topsection">
      <TitleRow />

      <ButtonRow
        onSelectPage={onSelectPage}
        vendorRows={vendorRows}
        onApplyVendorFilter={
          onApplyVendorFilter
        }
        onResetVendorFilter={
          onResetVendorFilter
        }
      />
    </div>
  );
}

export default TopSection;
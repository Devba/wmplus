


import VendorIdListGrid from "./VendorIdListGrid";

function BodyBox({
  vendorRows,
  selectedVendor,
  onSelectVendor,
  onDoubleClickVendor
}) {
  return (
    <div className="vid-bodybox">
      <VendorIdListGrid
        vendorRows={vendorRows}
        selectedVendor={selectedVendor}
        onSelectVendor={onSelectVendor}
        onDoubleClickVendor={onDoubleClickVendor}
      />
    </div>
  );
}

export default BodyBox;
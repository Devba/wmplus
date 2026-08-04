


import VendorIdListGrid from "./VendorIdListGrid";

function BodyBox({
  vendorRows
}) {
  return (
    <div className="vid-bodybox">
      <VendorIdListGrid
        vendorRows={vendorRows}
      />
    </div>
  );
}

export default BodyBox;
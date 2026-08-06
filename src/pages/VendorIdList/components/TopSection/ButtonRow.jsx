


import { openOverlay } from "../../../../engines";

import FilterUF from "../../../../components/FilterUF/FilterUF";

function ButtonRow({
  onSelectPage,
  vendorRows = [],
  selectedVendor = null,
  onApplyVendorFilter,
  onResetVendorFilter,
  onAddVendorClick,
  onEditVendorClick,
  onDeleteVendorClick
}) {
  const handleOpenVendorFilter = () => {
    openOverlay({
      title: "",
      component: (
        <FilterUF
          page="vendor-id-list"
          pageLabel="VENDOR ID LIST"
          showResidents={false}
          showVendors
          residents={[]}
          vendors={vendorRows}
          onApplyFilter={
            onApplyVendorFilter
          }
        />
      ),
      width: "940px",
      maxWidth: "96vw"
    });
  };

  return (
    <div className="vid-button-row">
      <button
        type="button"
        className="vid-btn vid-btn-green"
        onClick={onAddVendorClick}
      >
        ADD VENDOR
      </button>

      <button
        type="button"
        className="vid-btn vid-btn-blue"
        onClick={onEditVendorClick}
      >
        EDIT VENDOR
      </button>

      <button
        type="button"
        className="vid-btn vid-btn-red"
        onClick={onDeleteVendorClick}
      >
        DELETE VENDOR
      </button>

      <button
        type="button"
        className="vid-btn"
      >
        SAVE VENDOR ID LIST
      </button>

      <button
        type="button"
        className="vid-btn"
      >
        IMPORT VENDOR ID LIST
      </button>

      <button
        type="button"
        className="vid-btn"
        onClick={handleOpenVendorFilter}
      >
        VENDOR FILTER
      </button>

      <button
        type="button"
        className="vid-btn"
        onClick={onResetVendorFilter}
      >
        RESET FILTER
      </button>

      <button
        type="button"
        className="vid-btn vid-btn-yellow"
        onClick={() =>
          onSelectPage(
            "master-navigation-panel"
          )
        }
      >
        BACK TO NAV PANEL
      </button>

      <button
        type="button"
        className="vid-btn vid-btn-yellow"
        onClick={() =>
          onSelectPage("check-register")
        }
      >
        BACK TO CHECK REGISTER
      </button>
    </div>
  );
}

export default ButtonRow;
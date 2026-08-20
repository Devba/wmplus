


import { useMemo, useState, useEffect } from "react";
import "./VendorIdList.css";
import TopSection from "./components/TopSection/TopSection";
import BodyBox from "./components/BodyBox/BodyBox";
import { openOverlay } from "../../engines";
import AddVendorUF from "./components/AddVendorUF/AddVendorUF";
import {
  fetchVendors,
  createVendor,
  updateVendor,
  deleteVendor
} from "../../services/vendorService.js";

function VendorIdList({ onSelectPage }) {
  const [vendorRows, setVendorRows] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorIdFilter, setVendorIdFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load vendors from API on mount
  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchVendors();
        if (active) {
          setVendorRows(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Error loading vendors");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const displayedVendorRows = useMemo(() => {
    if (!vendorIdFilter) {
      return vendorRows;
    }

    return vendorRows.filter(
      (vendor) =>
        String(vendor.vendorId || "").trim() ===
        String(vendorIdFilter).trim()
    );
  }, [vendorRows, vendorIdFilter]);

  const handleApplyVendorFilter = (request) => {
    const vendorId = String(request?.accountNumber || "").trim();

    if (!vendorId) {
      window.alert("No vendor was selected.");
      return;
    }

    setVendorIdFilter(vendorId);
  };

  const handleResetVendorFilter = () => {
    setVendorIdFilter("");
  };

  const handleAddVendor = async (newVendor) => {
  try {
    const result = await createVendor(newVendor);

    const createdVendor = {
      ...newVendor,
      vendorId: result.vendor_id,
      id: result.vendor_id
    };

    setVendorRows((current) => [...current, createdVendor]);
    setSelectedVendor(createdVendor);
    } catch (err) {
      window.alert("Error creating vendor: " + err.message);
    }
  };

  const handleEditVendor = async (originalVendor, updatedVendor) => {
    try {
      await updateVendor(originalVendor.vendorId, updatedVendor);
      setVendorRows((current) =>
        current.map((v) => (v.vendorId === originalVendor.vendorId ? updatedVendor : v))
      );
      setSelectedVendor(updatedVendor);
    } catch (err) {
      window.alert("Error updating vendor: " + err.message);
    }
  };

  const handleAddVendorClick = () => {
    openOverlay({
      title: "VENDOR ID LIST",
      component: (
        <AddVendorUF
          mode="add"
          vendor={null}
          onEnterData={handleAddVendor}
        />
      ),
      width: "1200px",
      maxWidth: "96vw"
    });
  };

  const handleEditVendorClick = (vendorToEdit = selectedVendor) => {
    const targetVendor = vendorToEdit || selectedVendor;
    if (!targetVendor) {
      window.alert("Please select a vendor row before using Edit Vendor.");
      return;
    }

    openOverlay({
      title: "VENDOR ID LIST",
      component: (
        <AddVendorUF
          mode="edit"
          vendor={targetVendor}
          onEnterData={(updated) => handleEditVendor(targetVendor, updated)}
        />
      ),
      width: "1200px",
      maxWidth: "96vw"
    });
  };

  const handleDeleteVendorClick = async () => {
    if (!selectedVendor) {
      window.alert("Please select a vendor row before using Delete Vendor.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete this vendor?\n\n` +
      `Vendor ID: ${selectedVendor.vendorId}\n` +
      `Vendor Name: ${selectedVendor.vendorName}`
    );

    if (!confirmed) return;

    try {
      await deleteVendor(selectedVendor.vendorId);
      setVendorRows((current) =>
        current.filter((v) => v.vendorId !== selectedVendor.vendorId)
      );
      setSelectedVendor(null);
    } catch (err) {
      window.alert("Error deleting vendor: " + err.message);
    }
  };

  // Listen to custom DOM events from top ribbon
  useEffect(() => {
    const handleRibbonAdd = () => handleAddVendorClick();
    const handleRibbonEdit = () => handleEditVendorClick();
    const handleRibbonDelete = () => handleDeleteVendorClick();

    document.addEventListener("ribbon-add-vendor", handleRibbonAdd);
    document.addEventListener("ribbon-edit-vendor", handleRibbonEdit);
    document.addEventListener("ribbon-delete-vendor", handleRibbonDelete);

    return () => {
      document.removeEventListener("ribbon-add-vendor", handleRibbonAdd);
      document.removeEventListener("ribbon-edit-vendor", handleRibbonEdit);
      document.removeEventListener("ribbon-delete-vendor", handleRibbonDelete);
    };
  }, [selectedVendor, vendorRows]);

  return (
    <div className="vid-page">
      {loading && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.9)', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', zIndex: 1000, color: '#333', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          Loading Vendor Data...
        </div>
      )}
      {error && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#ffebee', border: '1px solid #c62828', color: '#c62828', padding: '20px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          Error: {error}
        </div>
      )}
      <div className="vid-shell">
        <div className="vid-fixed">
          <TopSection
            onSelectPage={onSelectPage}
            vendorRows={vendorRows}
            selectedVendor={selectedVendor}
            onApplyVendorFilter={handleApplyVendorFilter}
            onResetVendorFilter={handleResetVendorFilter}
            onAddVendorClick={handleAddVendorClick}
            onEditVendorClick={() => handleEditVendorClick()}
            onDeleteVendorClick={handleDeleteVendorClick}
          />
        </div>

        <BodyBox
          vendorRows={displayedVendorRows}
          selectedVendor={selectedVendor}
          onSelectVendor={setSelectedVendor}
          onDoubleClickVendor={handleEditVendorClick}
        />
      </div>
    </div>
  );
}

export default VendorIdList;
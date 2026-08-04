


import { useMemo, useState } from "react";

import "./VendorIdList.css";

import TopSection from "./components/TopSection/TopSection";
import BodyBox from "./components/BodyBox/BodyBox";

import vendorIdListSampleData from "./data/vendorIdListSampleData.js";

function VendorIdList({ onSelectPage }) {
  const [vendorRows] = useState(
    vendorIdListSampleData
  );

  const [
    vendorIdFilter,
    setVendorIdFilter
  ] = useState("");

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

  const handleApplyVendorFilter = (
    request
  ) => {
    const vendorId = String(
      request?.accountNumber || ""
    ).trim();

    if (!vendorId) {
      window.alert(
        "No vendor was selected."
      );
      return;
    }

    setVendorIdFilter(vendorId);
  };

  const handleResetVendorFilter = () => {
    setVendorIdFilter("");
  };

  return (
    <div className="vid-page">
      <div className="vid-shell">
        <div className="vid-fixed">
          <TopSection
            onSelectPage={onSelectPage}
            vendorRows={vendorRows}
            onApplyVendorFilter={
              handleApplyVendorFilter
            }
            onResetVendorFilter={
              handleResetVendorFilter
            }
          />
        </div>

        <BodyBox
          vendorRows={displayedVendorRows}
        />
      </div>
    </div>
  );
}

export default VendorIdList;
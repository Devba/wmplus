
import { useEffect, useRef, useState } from 'react';
import HeaderRow from "./HeaderRow";

function VendorIdListGrid({
  vendorRows = [],
  selectedVendor = null,
  onSelectVendor = () => {},
  onDoubleClickVendor = () => {}
}) {
  const scrollRef = useRef(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const check = () => {
      const canScroll = el.scrollWidth > el.clientWidth;
      setHasScroll(canScroll);
      
      if (canScroll) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        const percent = maxScroll > 0 ? (el.scrollLeft / maxScroll) * 100 : 0;
        setScrollPercent(percent);
      } else {
        setScrollPercent(0);
      }
    };

    el.addEventListener('scroll', check);
    check();

    return () => el.removeEventListener('scroll', check);
  }, []);

  return (
    <div className={`vid-table-container ${hasScroll ? 'has-scroll' : ''}`}>
      <div className="vid-table-scroll" ref={scrollRef}>
        <div className="vid-table-wrap">
          <table className="vid-table">
            <colgroup>
              <col className="vc1" />
              <col className="vc2" />
              <col className="vc3" />
              <col className="vc4" />
              <col className="vc5" />
              <col className="vc6" />
              <col className="vc7" />
              <col className="vc8" />
              <col className="vc9" />
              <col className="vc10" />
              <col className="vc11" />
              <col className="vc12" />
              <col className="vc13" />
              <col className="vc14" />
              <col className="vc15" />
              <col className="vc16" />
              <col className="vc17" />
              <col className="vc18" />
              <col className="vc19" />
              <col className="vc20" />
            </colgroup>

            <HeaderRow />

            <tbody id="vendorIdRows">
              {vendorRows.map(
                (vendor, index) => (
                  <tr
                    key={`${vendor.vendorId}-${index}`}
                    className={selectedVendor?.vendorId === vendor.vendorId ? 'is-selected' : ''}
                    onClick={() => onSelectVendor(vendor)}
                    onDoubleClick={() => onDoubleClickVendor(vendor)}
                  >
                    <td>
                      {vendor.vendorName}
                    </td>

                    <td>
                      {vendor.vendorId}
                    </td>

                    <td>
                      {vendor.coAddress || ""}
                    </td>

                    <td>
                      {vendor.streetAddress || ""}
                    </td>

                    <td>{vendor.city}</td>
                    <td>{vendor.state}</td>
                    <td>{vendor.zip}</td>

                    <td>
                      {vendor.contactName || ""}
                    </td>

                    <td>
                      {vendor.tel || ""}
                    </td>

                    <td>
                      {vendor.electronicCheckYN || ""}
                    </td>

                    <td>
                      {vendor.electronicCheckAmount || ""}
                    </td>

                    <td>
                      {vendor.startMonth || ""}
                    </td>

                    <td>
                      {vendor.startDay || ""}
                    </td>

                    <td>
                      {vendor.bankAccount || ""}
                    </td>

                    <td>
                      {vendor.glAccount || ""}
                    </td>

                    <td>
                      {vendor.glNumber || ""}
                    </td>

                    <td>
                      {vendor.currentTransactionNumber || ""}
                    </td>

                    <td>
                      {vendor.checkNotation || ""}
                    </td>

                    <td>
                      {vendor.notes || ""}
                    </td>

                    <td>
                      {vendor.vendorStatus || "Active"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div
        className="scroll-progress"
        style={{ width: `${scrollPercent}%` }}
      />
      <div className="scroll-hint">← Desliza para ver más →</div>
    </div>
  );
}

export default VendorIdListGrid;
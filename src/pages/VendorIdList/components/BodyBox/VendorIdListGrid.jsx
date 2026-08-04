



import HeaderRow from "./HeaderRow";

function VendorIdListGrid({
  vendorRows = []
}) {
  return (
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
  );
}

export default VendorIdListGrid;
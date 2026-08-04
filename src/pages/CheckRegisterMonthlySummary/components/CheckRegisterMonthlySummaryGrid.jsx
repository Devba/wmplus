


function CheckRegisterMonthlySummaryGrid() {
  const reportData =
    window.crMonthlySummaryData?.rows ?? [];

  return (
    <div className="checkreg-grid-band">
      <div
        className="checkreg-table-scroll"
        aria-label="Check Register Monthly Summary Scroller"
      >
        <table
          className="checkreg-table crms-table"
          role="table"
        >
          <colgroup>
            <col className="c-check" />
            <col className="c-name" />
            <col className="c-amt" />
            <col className="c-issued" />
            <col className="c-cleared" />
            <col className="c-month" />
            <col className="c-gl" />
            <col className="c-vendoracct" />
            <col className="c-invno" />
            <col className="c-invdate" />
            <col className="c-invamt" />
            <col className="c-note" />
            <col className="c-gl2" />
            <col className="c-txn" />
          </colgroup>

          <thead>
            <tr>
              <th className="col-check">
                CHECK#
              </th>

              <th className="col-name">
                GENERAL LEDGER ACCOUNT NAME
              </th>

              <th className="col-amt">
                AMOUNT
              </th>

              <th className="col-date">
                DATE CHK
                <br />
                ISSUED
              </th>

              <th className="col-date2">
                DATE CHK
                <br />
                CLEARED
              </th>

              <th className="col-month">
                MO. CHK
                <br />
                CLEARED
              </th>

              <th className="col-gl">
                GENERAL LEDGER ACCOUNT
              </th>

              <th className="col-acct">
                VENDOR ID# or
                <br />
                Resident ACCT#
              </th>

              <th className="col-inv">
                VENDOR INVOICE #
              </th>

              <th className="col-invdt">
                VENDOR INVOICE
                <br />
                DATE
              </th>

              <th className="col-invamt">
                VENDOR
                <br />
                INVOICE $$$
              </th>

              <th className="col-note">
                CHECK NOTATION
              </th>

              <th className="col-gl2">
                GL #
              </th>

              <th className="col-txn">
                CHECK TRANSACTION #
              </th>
            </tr>
          </thead>

          <tbody>
            {reportData.map((row) => (
              <tr key={row.transactionNo}>
                <td className="col-check">
                  {row.checkNo}
                </td>

                <td className="col-name">
                  {row.payeeName}
                </td>

                <td className="col-amt">
                  {row.amount}
                </td>

                <td className="col-date">
                  {row.dateIssued}
                </td>

                <td className="col-date2">
                  {row.dateCleared}
                </td>

                <td className="col-month">
                  {row.monthCleared}
                </td>

                <td className="col-gl">
                  {row.glAccount}
                </td>

                <td className="col-acct">
                  {row.vendorOrResidentAcct}
                </td>

                <td className="col-inv">
                  {row.vendorInvoiceNo}
                </td>

                <td className="col-invdt">
                  {row.vendorInvoiceDate}
                </td>

                <td className="col-invamt">
                  {row.vendorInvoiceAmount}
                </td>

                <td className="col-note">
                  {row.checkNotation}
                </td>

                <td className="col-gl2">
                  {row.glNo}
                </td>

                <td className="col-txn">
                  {row.transactionNo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CheckRegisterMonthlySummaryGrid;
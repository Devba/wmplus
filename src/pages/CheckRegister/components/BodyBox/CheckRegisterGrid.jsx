

import { useState } from 'react';
import HeaderRow from './HeaderRow';

function CheckRegisterGrid({ checkRows }) {
  const [selectedTransactionNo, setSelectedTransactionNo] =
    useState(null);

  return (
    <div className="checkreg-grid-band">
      <div
        className="checkreg-table-scroll"
        aria-label="Check Register Scroller"
      >
        <table className="checkreg-table" role="table">
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
            <col className="c-bank" />
            <col className="c-allowed" />
            <col className="c-gl2" />
            <col className="c-txn" />
            <col className="c-esc" />
            <col className="c-banknm" />
          </colgroup>

          <HeaderRow />

          <tbody id="crRows">
            {checkRows.map((row) => (
              <tr
                key={row.transactionNo}
                className={
                  selectedTransactionNo === row.transactionNo
                    ? 'is-selected'
                    : ''
                }
                onClick={() =>
                  setSelectedTransactionNo(row.transactionNo)
                }
              >
                <td className="col-check">{row.checkNo}</td>
                <td className="col-name">{row.payeeName}</td>
                <td className="col-amt">{row.amount}</td>
                <td className="col-date">{row.dateIssued}</td>
                <td className="col-date2">{row.dateCleared}</td>
                <td className="col-month">{row.monthCleared}</td>
                <td className="col-gl">{row.glAccount}</td>
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
                <td className="col-bank">{row.bankAcct}</td>
                <td className="col-allowed">
                  {row.checkAllowed}
                </td>
                <td className="col-gl2">{row.glNo}</td>
                <td className="col-txn">
                  {row.transactionNo}
                </td>
                <td className="col-esc">{row.escrowFlag}</td>
                <td className="col-banknm">
                  {row.bankAccount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CheckRegisterGrid;
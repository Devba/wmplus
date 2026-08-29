


import { useState } from 'react';

import HeaderRow from './HeaderRow';

function AssmtPaymtRegisterGrid({
  paymentRows = [],
  onSelectPaymentRow,
  selectedPaymentRow
}) {
  const [
    selectedTransaction,
    setSelectedTransaction
  ] = useState(null);

  return (
    <div className="apr-table-wrap">
      <table className="apr-table">
        <colgroup>
          <col className="c1" />
          <col className="c2" />
          <col className="c3" />
          <col className="c4" />
          <col className="c5" />
          <col className="c6" />
          <col className="c7" />
          <col className="c8" />
          <col className="c9" />
          <col className="c10" />
          <col className="c11" />
          <col className="c12" />
          <col className="c13" />
          <col className="c14" />
          <col className="c15" />
          <col className="c16" />
          <col className="c17" />
          <col className="c18" />
          <col className="c19" />
          <col className="c20" />
          <col className="c21" />
        </colgroup>

        <HeaderRow />

        <tbody id="aprRows">
          {paymentRows.map(
            (row, index) => (
              <tr
                key={`${row.transaction}-${index}`}
                className={
                  selectedPaymentRow === row
                    ? 'is-selected'
                    : ''
                }
                onClick={() => {
                setSelectedTransaction(row.transaction);
                onSelectPaymentRow?.(row);
              }}
              >
                <td>{row.ownerAcct}</td>
                <td>{row.ownerName}</td>
                <td>{row.address}</td>
                <td>{row.amount}</td>
                <td>{row.dateDeposited}</td>
                <td>{row.dateCleared}</td>
                <td>{row.monthCleared}</td>
                <td>{row.annualPayment}</td>
                <td>{row.specialPayment}</td>
                <td>{row.credit}</td>
                <td>{row.transaction}</td>
                <td>{row.yeCreditUsed}</td>
                <td>{row.yeAnnual}</td>
                <td>{row.yeSpecial}</td>
                <td>{row.paidPrior}</td>
                <td>{row.excessCredit}</td>
                <td>{row.annualRate}</td>
                <td>{row.specialRate}</td>
                <td>{row.depositInvoice}</td>
                <td>{row.electronic}</td>
                <td>{row.uploaded}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AssmtPaymtRegisterGrid;
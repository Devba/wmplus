

import { useState } from 'react';
import HeaderRow from './HeaderRow';

function DepositRegisterGrid({ depositRows }) {
  const [selectedRowIndex, setSelectedRowIndex] =
  useState(null);

  return (
    <div className="depreg-table-wrap">
      <table className="depreg-table">
        <HeaderRow />

        <tbody id="dpRows">
          {depositRows.map((row, index) => (
            <tr
              key={`${row.transactionNumber || row.transaction}-${index}`}
              className={
                selectedRowIndex === index
                  ? 'is-selected'
                  : ''
              }
              onClick={() =>
                setSelectedRowIndex(index)
              }
            >
              <td>{row.checkNumber || index + 1001}</td>
              <td>{row.depositorName || 'Depositor Name'}</td>
              <td>{row.amount || row.depositAmount}</td>
              <td>{row.bankAccount || 'Operating'}</td>
              <td>{row.glAccount}</td>
              <td>{row.depositDate || row.date}</td>
              <td>{row.dateCleared || ''}</td>
              <td>{row.monthCleared || ''}</td>
              <td>{row.ownerAccount || ''}</td>
              <td>{row.vendorId || ''}</td>
              <td>{row.invoiceNumber || ''}</td>
              <td>{row.expenseRefundGLCategory || ''}</td>
              <td>{row.expenseRefundGLNumber || ''}</td>
              <td>{row.glNumber || '1000'}</td>
              <td>{row.transactionNumber || row.transaction}</td>
              <td>{row.notation || ''}</td>
              <td>{row.arbFineAssigned || '$0.00'}</td>
              <td>{row.fineAssigned || '$0.00'}</td>
              <td>{row.paymentUploaded || 'YES'}</td>
              <td>{row.depositOverflow || '$0.00'}</td>
              <td>{row.escrowFlag || 'N'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DepositRegisterGrid;
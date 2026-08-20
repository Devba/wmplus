import { useEffect, useMemo, useState } from 'react';
import './DepositRegister.css';

import TopSection from './components/TopSection/TopSection';
import BodyBox from './components/BodyBox/BodyBox';

import { API_BASE_URL } from '../../config/api';

function DepositRegister({ onSelectPage }) {
  const [depositRows, setDepositRows] = useState([]);

  useEffect(() => {
    async function loadDepositRegister() {
      try {
        const response = await fetch(`${API_BASE_URL}/deposit-register`);

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const rows = await response.json();

        const mappedRows = rows.map((row) => ({
          checkNumber: '',
          depositorName: row.payer_name || row.depositor_account_name || '',
          amount: row.amount,
          depositAmount: row.amount,
          bankAccount: row.bank_account_display || row.bank_account || '',
          glAccount: row.gl_name || '',
          depositDate: row.date_deposited || '',
          date: row.date_deposited || '',
          dateCleared:
            row.status === 'Voided' ? 'VOID' : row.date_cleared || '',
          monthCleared:
            row.status === 'Voided' ? 'VOID' : row.month_cleared || '',
          ownerAccount: row.resident_id
          ? String(row.resident_id).replace(/\D/g, '').padStart(6, '0')
          : '',
          depositorId: row.resident_id || row.vendor_id || '',
          vendorAcct: row.vendor_id
          ? String(row.vendor_id).replace(/\D/g, '').padStart(4, '0')
          : '',
          vendorId: row.vendor_id || '',
          invoiceNumber: '',
          glNumber: row.gl_number || '',
          glNo: row.gl_number || '',
          transactionNumber: row.deposit_txn_num || '',
          transaction: row.deposit_txn_num || '',
          expenseRefundGLCategory: row.expense_refund_gl_category || '',
          expenseRefundGLNumber: row.expense_refund_gl_number || '',
          notation: row.note || '',
          status: row.status || '',
          arbFineAssigned: '$0.00',
          fineAssigned: '$0.00',
          paymentUploaded: 'YES',
          depositOverflow: '$0.00',
          escrowFlag: 'N'
        }));

        setDepositRows(mappedRows);
      } catch (error) {
        console.error('Error loading Deposit Register:', error);
      }
    }

    loadDepositRegister();
  }, []);

  const [registerFilter, setRegisterFilter] = useState(null);

  const displayedDepositRows = useMemo(() => {
    if (!registerFilter) {
      return depositRows;
    }

    return depositRows.filter((row) => {
      if (registerFilter.filterType === 'resident') {
        const residentAccount = String(
          row.ownerAccount || row.depositorId || ''
        ).trim();

        return residentAccount === registerFilter.accountNumber;
      }

      if (registerFilter.filterType === 'vendor') {
        const vendorAccount = String(row.vendorId || '').trim();
        return vendorAccount === registerFilter.accountNumber;
      }

      return true;
    });
  }, [depositRows, registerFilter]);

  const handleAddDeposit = (newDeposit) => {
    setDepositRows((currentRows) => [...currentRows, newDeposit]);
  };

  const handleApplyVendorResidentFilter = (request) => {
    const filterType = String(request?.filterType || '').trim();
    const accountNumber = String(request?.accountNumber || '').trim();

    if (
      !accountNumber ||
      !['resident', 'vendor'].includes(filterType)
    ) {
      window.alert('No valid resident or vendor was selected.');
      return;
    }

    setRegisterFilter({
      filterType,
      accountNumber
    });
  };

  const handleResetVendorResidentFilter = () => {
    setRegisterFilter(null);
  };

  return (
    <div className="depreg-page">
      <div className="depreg-shell">
        <div className="depreg-fixed">
          <TopSection
            onSelectPage={onSelectPage}
            onAddDeposit={handleAddDeposit}
            depositRows={depositRows}
            onApplyVendorResidentFilter={
              handleApplyVendorResidentFilter
            }
            onResetVendorResidentFilter={
              handleResetVendorResidentFilter
            }
          />
        </div>

        <BodyBox depositRows={displayedDepositRows} />
      </div>
    </div>
  );
}

export default DepositRegister;

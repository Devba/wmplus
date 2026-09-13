// =====================================================
// 2026-07-09
// CHECK REGISTER
// PAGE STATE OWNER
// =====================================================

import { useEffect, useMemo, useState } from 'react';

import './CheckRegister.css';

import { API_BASE_URL } from '../../config/api';

import BodyBox from './components/BodyBox/BodyBox';
import TopSection from './components/TopSection/TopSection';

import checkRegisterSampleData from './data/checkRegisterSampleData';

function CheckRegister({ onSelectPage }) {
  const [checkRows, setCheckRows] = useState([]);

  const [selectedCheckRow, setSelectedCheckRow] =
    useState(null);

  const [selectedBankId, setSelectedBankId] =
    useState(101);

  const [balanceRefreshKey, setBalanceRefreshKey] =
    useState(0);

  useEffect(() => {
    async function loadCheckRegister() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/check-register`
        );

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const rows = await response.json();

        const mappedRows = rows.map((row) => ({
          checkNo: row.check_number,
          payeeName: row.payee_name,
          amount: row.amount,

          dateIssued: row.date_issued,

          dateCleared:
            row.status === 'Voided'
              ? 'VOID'
              : row.date_cleared,

          monthCleared:
            row.status === 'Voided'
              ? 'VOID'
              : row.month_cleared,

          glAccount: row.gl_name,

          vendorOrResidentAcct: String(
            row.payee_id || ''
          )
            .toUpperCase()
            .startsWith('RES-')
            ? String(row.payee_id)
                .replace(/\D/g, '')
                .padStart(6, '0')
            : String(row.payee_id || '')
                .replace(/\D/g, '')
                .padStart(4, '0'),

          vendorInvoiceNo: row.invoice_num,
          vendorInvoiceDate: row.invoice_date,
          vendorInvoiceAmount: row.invoice_amount,

          checkNotation: row.note,

          bankAcct: row.bank_account,
          bankId: Number(row.bank_id) || 0,

          checkAllowed: row.check_allowed,
          status: row.status,

          glNo: row.gl_number,
          transactionNo: row.check_txn_num,

          escrowFlag: row.escrow_flag,
          bankAccount: row.bank_account_display
        }));

        setCheckRows(mappedRows);
      } catch (error) {
        console.error(
          'Error loading Check Register:',
          error
        );
      }
    }

    loadCheckRegister();
  }, []);

  const [
    vendorResidentAccountFilter,
    setVendorResidentAccountFilter
  ] = useState('');

  const displayedCheckRows = useMemo(() => {
    return checkRows.filter((row) => {
      if (
        Number(row.bankId) !==
        Number(selectedBankId)
      ) {
        return false;
      }

      if (!vendorResidentAccountFilter) {
        return true;
      }

      const rowAccount = String(
        row.vendorOrResidentAcct || ''
      ).trim();

      return (
        rowAccount ===
        String(vendorResidentAccountFilter)
      );
    });
  }, [
    checkRows,
    selectedBankId,
    vendorResidentAccountFilter
  ]);

  const handleAddCheck = (newCheck) => {
    setCheckRows((currentRows) => [
      ...currentRows,
      newCheck
    ]);
  };

  const handleCheckCleared = (savedCheck) => {
    setCheckRows((currentRows) =>
      currentRows.map((row) =>
        row.transactionNo ===
        savedCheck.transactionNumber
          ? {
              ...row,
              dateIssued:
                savedCheck.issuedDate ||
                row.dateIssued,
              dateCleared:
                savedCheck.clearedDate,
              monthCleared:
                savedCheck.monthCleared,
              status:
                savedCheck.status ||
                'Cleared'
            }
          : row
      )
    );

    setSelectedCheckRow((currentRow) =>
      currentRow?.transactionNo ===
      savedCheck.transactionNumber
        ? {
            ...currentRow,
            dateIssued:
              savedCheck.issuedDate ||
              currentRow.dateIssued,
            dateCleared:
              savedCheck.clearedDate,
            monthCleared:
              savedCheck.monthCleared,
            status:
              savedCheck.status ||
              'Cleared'
          }
        : currentRow
    );

    setBalanceRefreshKey((key) => key + 1);
  };

  const handleApplyVendorResidentFilter = (
    request
  ) => {
    const accountNumber = String(
      request?.accountNumber || ''
    ).trim();

    if (!accountNumber) {
      window.alert(
        'No resident or vendor account was selected.'
      );
      return;
    }

    setVendorResidentAccountFilter(
      accountNumber
    );
  };

  const handleResetVendorResidentFilter = () => {
    setVendorResidentAccountFilter('');
  };

  return (
    <div className="checkreg-page">
      <div className="checkreg-shell">
        <div className="checkreg-fixed">
          <TopSection
            onSelectPage={onSelectPage}
            onAddCheck={handleAddCheck}
            checkRows={checkRows}
            selectedCheckRow={selectedCheckRow}
            onCheckCleared={handleCheckCleared}
            onBankChange={setSelectedBankId}
            balanceRefreshKey={balanceRefreshKey}
            onApplyVendorResidentFilter={
              handleApplyVendorResidentFilter
            }
            onResetVendorResidentFilter={
              handleResetVendorResidentFilter
            }
          />
        </div>

        <BodyBox
          checkRows={displayedCheckRows}
          onSelectCheckRow={setSelectedCheckRow}
        />
      </div>
    </div>
  );
}

export default CheckRegister;
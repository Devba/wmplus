
import { useMemo, useState } from 'react';

import './AssmtPaymtRegister.css';

import TopSection from './components/TopSection/TopSection';
import BodyBox from './components/BodyBox/BodyBox';



function AssmtPaymtRegister({ onSelectPage }) {
  const [
  paymentRows,
  setPaymentRows
] = useState([]);

  const [
    residentAccountFilter,
    setResidentAccountFilter
  ] = useState('');

  const displayedPaymentRows = useMemo(() => {
    if (!residentAccountFilter) {
      return paymentRows;
    }

    return paymentRows.filter((row) => {
      return (
        String(row.ownerAcct || '').trim() ===
        String(residentAccountFilter).trim()
      );
    });
  }, [
    paymentRows,
    residentAccountFilter
  ]);

  const residentLookupRows = useMemo(() => {
    const residentsByAccount = new Map();

    paymentRows.forEach((row) => {
      const accountNumber = String(
        row.ownerAcct || ''
      ).trim();

      if (
        !accountNumber ||
        residentsByAccount.has(accountNumber)
      ) {
        return;
      }

      residentsByAccount.set(
        accountNumber,
        {
          type: 'resident',
          acctNo: accountNumber,
          displayName: String(
            row.ownerName || ''
          ).trim(),
          residence: String(
            row.address || ''
          ).trim()
        }
      );
    });

    return Array.from(
      residentsByAccount.values()
    );
  }, [paymentRows]);

  const handleApplyResidentFilter = (
    request
  ) => {
    const accountNumber = String(
      request?.accountNumber || ''
    ).trim();

    if (!accountNumber) {
      window.alert(
        'No resident account was selected.'
      );
      return;
    }

    setResidentAccountFilter(
      accountNumber
    );
  };

  const handleResetResidentFilter = () => {
    setResidentAccountFilter('');
  };

   const handleAddPayment = (
  newPayment
    ) => {
      setPaymentRows((rows) => [
        ...rows,
        newPayment
      ]);

      setResidentAccountFilter('');
    };




  return (
    <div className="apr-page">
      <div className="apr-shell">
        <div className="apr-fixed">
          <TopSection
          onSelectPage={onSelectPage}
          residents={residentLookupRows}
          onApplyResidentFilter={
            handleApplyResidentFilter
          }
          onResetResidentFilter={
            handleResetResidentFilter
          }
          onAddPayment={
            handleAddPayment
          }
        />
        </div>

        <BodyBox
          paymentRows={
            displayedPaymentRows
          }
        />
      </div>
    </div>
  );
}

export default AssmtPaymtRegister;
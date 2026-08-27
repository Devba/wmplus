
import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../../config/api';

import './AssmtPaymtRegister.css';

import TopSection from './components/TopSection/TopSection';
import BodyBox from './components/BodyBox/BodyBox';



function AssmtPaymtRegister({ onSelectPage }) {
  const [
  paymentRows,
  setPaymentRows
] = useState([]);

useEffect(() => {
  let componentIsActive = true;

  async function loadAprTransactions() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/apr/list`
      );

      const result = await response.json();

      if (!componentIsActive) {
        return;
      }

      setPaymentRows(
        Array.isArray(result?.transactions)
          ? result.transactions
          : []
      );
    } catch (error) {
      console.error(
        'APR transaction load error:',
        error
      );
    }
  }

  loadAprTransactions();

  return () => {
    componentIsActive = false;
  };
}, []);


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


  const [residentRows, setResidentRows] = useState([]);

  useEffect(() => {
  let componentIsActive = true;

async function loadResidents() {
  try {
     const response = await fetch(
    `${API_BASE_URL}/residents?limit=1000&offset=0&sort=name`
     );

    const result = await response.json();

    if (!componentIsActive) {
  return;
}

setResidentRows(
  Array.isArray(result?.residents)
    ? result.residents.map((resident) => ({
        type: 'resident',
        acctNo: resident.account_id || '',
        firstName: resident.first_name || '',
        lastName: resident.last_name || '',
        displayName: [
          resident.first_name,
          resident.last_name
        ]
          .filter(Boolean)
          .join(' '),
        residence: resident.residence_address || ''
      }))
    : []
);

    console.log('APR residents:', result);
  } catch (error) {
    console.error(
      'APR resident load error:',
      error
    );
  }
}

  loadResidents();

  return () => {
    componentIsActive = false;
  };
  }, []);

const residentLookupRows = useMemo(
  () => residentRows,
  [residentRows]
);

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
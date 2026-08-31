
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

const [selectedPaymentRow, setSelectedPaymentRow] = useState(null);

const [aprReloadKey, setAprReloadKey] = useState(0);

const [pendingTransactionNumber, setPendingTransactionNumber] = useState('');

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

const mappedPaymentRows =
  Array.isArray(result?.transactions)
    ? result.transactions.map((row) => {
        const annualPaid =
          Number(row.TotalAnnualAssessmentPaidYTD || 0);

        const specialPaid =
          Number(row.TotalSpecialAssessmentPaidYTD || 0);

        const creditsReceived =
          Number(row.TotalCreditsReceived || 0);

        const totalPaid =
          annualPaid +
          specialPaid +
          creditsReceived;

        const ownerName =
          row.DisplayName ||
          [
            row.FirstName,
            row.MiddleName,
            row.LastName
          ]
            .filter(Boolean)
            .join(' ');

        return {
          ownerAcct:
            row.ResidentAccountID || '',

          ownerName:
            ownerName || '',

          address:
            row.ResidenceAddress || '',

          amount:
            Number(row.TotalAmount || 0).toFixed(2),

          dateDeposited:
            row.PaymentDate
              ? String(row.PaymentDate).slice(0, 10)
              : '',

          dateCleared:
            '',

          monthCleared:
            '',

          annualPayment:
            Number(
              row.AnnualDuesPayment || 0
            ).toFixed(2),

          specialPayment:
            Number(
              row.SpecialAssessmentPayment || 0
            ).toFixed(2),

          credit:
            Number(
              row.CreditAmount || 0
            ).toFixed(2),

          totalPaidYTD:
            totalPaid.toFixed(2),

          totalAnnual:
            annualPaid.toFixed(2),

          totalSpecial:
            specialPaid.toFixed(2),

          totalCredits:
            creditsReceived.toFixed(2),

          transaction:
            row.TransactionNumber || '',

          yeCreditUsed:
            '',

          yeAnnual:
            '',

          yeSpecial:
            '',

          paidPrior:
            '',

          excessCredit:
            Number(
              row.CreditAfterAssessmentPaymentsFinePaymentsRefunds || 0
            ).toFixed(2),

          annualRate:
            row.AnnualRateType || '',

          specialRate:
            row.SpecialRateType || '',

          depositInvoice:
            '',

          electronic:
            row.ElectronicPaymentID || '',

          uploaded:
            'No'
        };
      })
    : [];

setPaymentRows(mappedPaymentRows);

if (pendingTransactionNumber) {
  const matchingRow = mappedPaymentRows.find(
    (row) =>
      row.transaction === pendingTransactionNumber
  );

  if (matchingRow) {
    setSelectedPaymentRow(matchingRow);
    setPendingTransactionNumber('');
  }
}

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
}, [aprReloadKey]);


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
  newPayment,
  newTransactionNumber
  ) => {
      

      setSelectedPaymentRow(newPayment);

      setPendingTransactionNumber(newTransactionNumber || '');

      setAprReloadKey((key) => key + 1);

      setResidentAccountFilter('');
    };

    const handleVoidSuccess = () => {
  setSelectedPaymentRow(null);
  setPendingTransactionNumber('');
  setAprReloadKey((key) => key + 1);
    };

   const allResidentTotals = paymentRows.reduce(
  (totals, row) => {
    totals.annual += Number(row.annualPayment || 0);
    totals.special += Number(row.specialPayment || 0);
    totals.credits += Number(row.credit || 0);
    return totals;
  },
  {
    annual: 0,
    special: 0,
    credits: 0
  }
);

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
          onVoidSuccess={
            handleVoidSuccess
          }

          selectedPaymentRow={selectedPaymentRow}
          allResidentTotals={allResidentTotals}
        />
        </div>

        <BodyBox
          paymentRows={
            displayedPaymentRows
          }
          onSelectPaymentRow={setSelectedPaymentRow}
          selectedPaymentRow={selectedPaymentRow}
        />
      </div>
    </div>
  );
}

export default AssmtPaymtRegister;
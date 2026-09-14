


import TitleRow from './TitleRow';
import ButtonRow from './ButtonRow';
import TotalsRow from './TotalsRow';

function TopSection({
  onSelectPage,
  residents,
  onApplyResidentFilter,
  onResetResidentFilter,
  onAddPayment,
  onVoidSuccess,
  onPaymentCleared,
  selectedPaymentRow,
  selectedPaymentRows,
  allResidentTotals
}) {
  return (
    <div className="apr-topsection">
      <TitleRow />

      <ButtonRow
        onSelectPage={onSelectPage}
        residents={residents}
        selectedPaymentRow={selectedPaymentRow}
        selectedPaymentRows={selectedPaymentRows}
        onApplyResidentFilter={
        onApplyResidentFilter
        }
        onResetResidentFilter={
          onResetResidentFilter
        }
        onAddPayment={
          onAddPayment
        }
        onVoidSuccess={
          onVoidSuccess
        }
        onPaymentCleared={
          onPaymentCleared
        }
      />

      <TotalsRow
        selectedPaymentRow={selectedPaymentRow}
        allResidentTotals={allResidentTotals}
      />
    </div>
  );
}

export default TopSection;
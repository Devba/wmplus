

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
  selectedPaymentRow,
  allResidentTotals
}) {
  return (
    <div className="apr-topsection">
      <TitleRow />

      <ButtonRow
        onSelectPage={onSelectPage}
        residents={residents}
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
      />

      <TotalsRow 
      selectedPaymentRow={selectedPaymentRow}
       allResidentTotals={allResidentTotals}
      />
    </div>
  );
}

export default TopSection;
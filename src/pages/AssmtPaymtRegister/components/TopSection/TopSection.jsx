

import TitleRow from './TitleRow';
import ButtonRow from './ButtonRow';
import TotalsRow from './TotalsRow';

function TopSection({
  onSelectPage,
  residents,
  onApplyResidentFilter,
  onResetResidentFilter,
  onAddPayment
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
      />

      <TotalsRow />
    </div>
  );
}

export default TopSection;
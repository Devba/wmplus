


import AssmtPaymtRegisterGrid from './AssmtPaymtRegisterGrid';

function BodyBox({
  paymentRows,
  onSelectPaymentRow,
  onSelectPaymentRows,
  selectedPaymentRow
}) {


  return (
    <div className="apr-bodybox">
    <AssmtPaymtRegisterGrid
  paymentRows={paymentRows}
  onSelectPaymentRow={onSelectPaymentRow}
  onSelectPaymentRows={onSelectPaymentRows}
  selectedPaymentRow={selectedPaymentRow}
/>
    </div>
  );
}

export default BodyBox;
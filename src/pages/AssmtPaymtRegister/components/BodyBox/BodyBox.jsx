


import AssmtPaymtRegisterGrid from './AssmtPaymtRegisterGrid';

function BodyBox({
  paymentRows,
  onSelectPaymentRow,
  selectedPaymentRow
}) {


  return (
    <div className="apr-bodybox">
    <AssmtPaymtRegisterGrid
  paymentRows={paymentRows}
  onSelectPaymentRow={onSelectPaymentRow}
  selectedPaymentRow={selectedPaymentRow}
/>
    </div>
  );
}

export default BodyBox;
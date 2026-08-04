


import AssmtPaymtRegisterGrid from './AssmtPaymtRegisterGrid';

function BodyBox({
  paymentRows
}) {
  return (
    <div className="apr-bodybox">
      <AssmtPaymtRegisterGrid
        paymentRows={paymentRows}
      />
    </div>
  );
}

export default BodyBox;
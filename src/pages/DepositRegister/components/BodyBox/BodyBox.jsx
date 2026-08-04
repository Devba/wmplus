
import DepositRegisterGrid from './DepositRegisterGrid';

function BodyBox({ depositRows }) {
  return (
    <div className="depreg-bodybox">
      <DepositRegisterGrid depositRows={depositRows} />
    </div>
  );
}

export default BodyBox;


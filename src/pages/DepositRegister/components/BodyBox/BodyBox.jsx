
import DepositRegisterGrid from './DepositRegisterGrid';

function BodyBox({ depositRows, onSelectDepositRow }) {
  return (
    <div className="depreg-bodybox">
      <DepositRegisterGrid
        depositRows={depositRows}
        onSelectDepositRow={onSelectDepositRow}
      />
    </div>
  );
}

export default BodyBox;


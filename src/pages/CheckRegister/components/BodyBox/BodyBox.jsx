import CheckRegisterGrid from './CheckRegisterGrid';

function BodyBox({ checkRows }) {
  return (
    <div className="checkreg-bodybox">
      <CheckRegisterGrid checkRows={checkRows} />
    </div>
  );
}

export default BodyBox;
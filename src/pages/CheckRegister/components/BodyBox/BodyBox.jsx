import CheckRegisterGrid from './CheckRegisterGrid';

function BodyBox({
  checkRows,
  onSelectCheckRow
}) {
  return (
    <div className="checkreg-bodybox">
      <CheckRegisterGrid
        checkRows={checkRows}
        onSelectCheckRow={onSelectCheckRow}
      />
    </div>
  );
}

export default BodyBox;
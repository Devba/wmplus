


import MainDirectoryGrid from './MainDirectoryGrid';

function BodyBox({
  residents,
  selectedResident,
  onSelectResident,
  onDoubleClickResident
}) {
  return (
    <div className="md-bodybox">
      <MainDirectoryGrid
        residents={residents}
        selectedResident={selectedResident}
        onSelectResident={onSelectResident}
        onDoubleClickResident={onDoubleClickResident}
      />
    </div>
  );
}

export default BodyBox;



import MainDirectoryGrid from './MainDirectoryGrid';

function BodyBox({
  residents,
  selectedResident,
  onSelectResident
}) {
  return (
    <div className="md-bodybox">
      <MainDirectoryGrid
        residents={residents}
        selectedResident={selectedResident}
        onSelectResident={onSelectResident}
      />
    </div>
  );
}

export default BodyBox;
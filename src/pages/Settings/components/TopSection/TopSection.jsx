


import TitleRow from './TitleRow';
import ButtonRow from './ButtonRow';

function TopSection({
  activeSettingsPanel,
  onSettingsButtonClick
}) {
  return (
    <div className="settings-topsection">
      <TitleRow />

      <ButtonRow
        activeSettingsPanel={activeSettingsPanel}
        onSettingsButtonClick={onSettingsButtonClick}
      />
    </div>
  );
}

export default TopSection;
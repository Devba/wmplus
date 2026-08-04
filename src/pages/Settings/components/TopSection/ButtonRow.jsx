


function ButtonRow({
  activeSettingsPanel,
  onSettingsButtonClick
}) {
  return (
    <div className="settings-button-row">

      <button
        type="button"
        className={
          activeSettingsPanel === 'hoa-profile'
            ? 'settings-btn active'
            : 'settings-btn'
        }
        onClick={() =>
          onSettingsButtonClick('hoa-profile')
        }
      >
        HOA Profile
      </button>

      <button
        type="button"
        className={
          activeSettingsPanel === 'banking'
            ? 'settings-btn active'
            : 'settings-btn'
        }
        onClick={() =>
          onSettingsButtonClick('banking')
        }
      >
        Banking / Fiscal Year Setup
      </button>

      <button
        type="button"
        className={
          activeSettingsPanel === 'general-system'
            ? 'settings-btn active'
            : 'settings-btn'
        }
        onClick={() =>
          onSettingsButtonClick('general-system')
        }
      >
        General System Programming
      </button>

      <button
        type="button"
        className={
          activeSettingsPanel === 'dues-programming'
            ? 'settings-btn active'
            : 'settings-btn'
        }
        onClick={() =>
          onSettingsButtonClick('dues-programming')
        }
      >
        Annual / Special Dues Programming
      </button>

      <button
        type="button"
        className={
          activeSettingsPanel === 'fines-late-fees'
            ? 'settings-btn active'
            : 'settings-btn'
        }
        onClick={() =>
          onSettingsButtonClick('fines-late-fees')
        }
      >
        Fines / Late Fees
      </button>

      <button
        type="button"
        className={
          activeSettingsPanel === 'gl-mapping'
            ? 'settings-btn active'
            : 'settings-btn'
        }
        onClick={() =>
          onSettingsButtonClick('gl-mapping')
        }
      >
        GL# Mapping
      </button>

    </div>
  );
}

export default ButtonRow;
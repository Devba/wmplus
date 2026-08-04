



import './UnsavedChangesPrompt.css';

function UnsavedChangesPrompt({
  isOpen,
  isSaving,
  isLoading,
  errorMessage,
  onYes,
  onNo,
  onCancel
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="settings-prompt-overlay">
      <div
        className="settings-prompt-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settingsUnsavedPromptTitle"
      >
        <div
          id="settingsUnsavedPromptTitle"
          className="settings-prompt-title"
        >
          UNSAVED CHANGES
        </div>

        <div className="settings-prompt-message">
          You have unsaved changes.
          <br />
          <br />
          Do you want to save them before continuing?
        </div>

        <div className="settings-prompt-actions">
          <button
            type="button"
            onClick={onYes}
            disabled={isSaving}
          >
            Yes
          </button>

          <button
            type="button"
            onClick={onNo}
            disabled={isSaving || isLoading}
          >
            No
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>

        {errorMessage && (
          <div className="settings-prompt-error">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default UnsavedChangesPrompt;




import './UnsavedChangesPrompt.css';

function UnsavedChangesPrompt({
  isOpen,
  isSaving,
  isLoading,
  errorMessage,
  onYes,
  onNo,
  onCancel,
  yesLabel = 'Yes',
  noLabel = 'No',
  cancelLabel = 'Cancel'
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
    className="settings-prompt-save"
    onClick={onYes}
    disabled={isSaving}
  >
    {yesLabel}
  </button>

  <button
    type="button"
    className="settings-prompt-delete"
    onClick={onNo}
    disabled={isSaving || isLoading}
  >
    {noLabel}
  </button>

  <button
    type="button"
    className="settings-prompt-cancel"
    onClick={onCancel}
    disabled={isSaving}
  >
    {cancelLabel}
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
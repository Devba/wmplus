



import './CreateParentFromReserveUF.css';

function CreateParentFromReserveUF({
  isOpen,
  parentName,
  startingGl,
  endingGl,
  startingOptions = [],
  endingOptions = [],
  onParentNameChange,
  onStartingGlChange,
  onEndingGlChange,
  onSave,
  onCancel
}) {
  if (!isOpen) {
    return null;
  }

const parentNameIsValid =
  parentName.trim().length > 0;

const startNumber =
  Number(startingGl);

const endNumber =
  Number(endingGl);

const rangeIsValid =
  Number.isFinite(startNumber) &&
  Number.isFinite(endNumber) &&
  endNumber > startNumber;

const canCreate =
  parentNameIsValid &&
  rangeIsValid;



  return (
    <div className="create-parent-overlay">
      <div
        className="create-parent-box"
        role="dialog"
        aria-modal="true"
      >
        <div className="create-parent-title">
          CREATE PARENT FROM GL# RANGE
        </div>

        <div className="create-parent-form">

          <label htmlFor="createParentName">
            GL# Parent Name
          </label>

          <input
            id="createParentName"
            type="text"
            maxLength={40}
            value={parentName}
            onChange={(event) => {
                const cleanedValue =
                event.target.value.replace(/[^A-Za-z0-9 @#&/()'.-]/g, '');

                onParentNameChange({
                target: {
                    value: cleanedValue
                }
                });
            }}
            />

          <label htmlFor="createParentStart">
            Parent Starting GL#
          </label>

          <select
            id="createParentStart"
            value={startingGl}
            onChange={onStartingGlChange}
          >
            {startingOptions.map((gl) => (
              <option
                key={gl}
                value={gl}
              >
                {gl}
              </option>
            ))}
          </select>

          <label htmlFor="createParentEnd">
            Parent Assignable GL# End Range
          </label>

          <select
            id="createParentEnd"
            value={endingGl}
            onChange={onEndingGlChange}
          >
            {endingOptions.map((gl) => (
              <option
                key={gl}
                value={gl}
              >
                {gl}
              </option>
            ))}
          </select>

        </div>

        <div className="create-parent-actions">
          <button
            type="button"
            onClick={onSave}
            disabled={!canCreate}
            >
            Create Parent
          </button>

          <button
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}






export default CreateParentFromReserveUF;
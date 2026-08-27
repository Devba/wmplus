import { useEffect, useMemo, useRef, useState } from 'react';

import './FinesLateFees.css';

import {
  loadFinesLateFees,
  saveFinesLateFees
} from '../../services/finesLateFeesService';

import {
  loadDuesProgramming
} from '../../services/duesProgrammingService';

import UnsavedChangesPrompt
  from '../UnsavedChangesPrompt/UnsavedChangesPrompt';

const TIMED_DEFAULTS = [
  ['1', 'CONST OVERDUE COMPLETION VIOLATION LETTER', '4811', '', 'Y'],
  ['2', 'GARBAGE / RECYLING CONTAINER', '9305', '', 'Y'],
  ['3', 'YARD DEBRIS', '9305', '', 'Y'],
  ['4', 'VEHICLE PARKED OVERNIGHT ON ROAD', '9305', '', 'Y'],
  ['5', 'CURB DEBRIS PLACED ON WRONG DAY', '9305', '', 'Y'],
  ['6', 'NUISANCE PETS', '9305', '', 'Y'],
  ['7', 'FAILURE TO PICK UP PET WASTE', '9305', '', 'Y'],
  ['8', 'STREET / SIDE WALK PARKING BLOCKING TRAFFIC', '9305', '', 'Y'],
  ['9', 'DOG BARKING', '9305', '', 'Y'],
  ['10', 'HOME STRUCTURE APPEARNCE', '9305', '', 'Y'],
  ['11', 'LAWN / SHRUB / LANDSCAPE APPEARANCE', '9305', '', 'Y'],
  ['12', 'FENCING / STOREAGE UNITS / MAINTENANCE', '9305', '', 'Y'],
  ['13', 'EXCESSIVE HOUSING OVERCROWDING', '9305', '', 'Y'],
  ['14', 'UNLICENSED VEHICLE STORAGE', '9305', '', 'Y'],
  ['15', 'UNAUTHORIZED SIGNAGE', '9305', '', 'Y'],
  ['16', 'ANTENNA', '9305', '', 'Y'],
  ['17', 'HOME OFFICE BUSINESS', '9305', '', 'Y']
];

const IMMEDIATE_DEFAULTS = [
  ['1', 'RV, TRAILER, BOAT PARKED OVERNIGHT', '9305', '50.00', 'Y'],
  ['2', 'COMMERCIAL VEHICLE PARKED OVERNIGHT', '9305', '125.00', 'Y'],
  ['3', 'UNAUTHORIZED TREE CUTTING', '9305', '250.00', 'Y'],
  ['4', 'COMMERCIAL DEBRIS ON CURB', '9305', '115.00', 'Y'],
  ['5', 'UNAUTHORIZED HOME ALTERATIONS', '9305', '250.00', 'Y'],
  ['6', 'VEHICLE SPEEDING', '9305', '150.00', 'Y'],
  ['7', 'EXCESSIVE NOISE', '9305', '100.00', 'Y'],
  ['8', 'ROWDY BEHAVIOR', '9305', '200.00', 'Y'],
  ['9', 'WEAPONS / WEAPONS DISCHARGE', '9305', '500.00', 'Y'],
  ['10', 'VANDALISM / PROPERTY DESTRUCTION', '9305', '1500.00', 'Y'],
  ['11', 'RENTAL VIOLATION', '9305', '1000.00', 'Y'],
  ['12', 'ARB / Construction Fine', '4811', '100.00', 'Y'],
  ['13', 'VARIOUS', '9305', '100.00', 'Y']
];

const DEFAULT_LETTER_RULES = {
  arrearsRules: {
    letter1Amount: '',
    letter1PercentYN: 'N',
    letter1Percent: '',
    letter1GL: '72',
    letter2Amount: '',
    letter2PercentYN: 'N',
    letter2Percent: '',
    letter2GL: '73',
    finalAmount: '',
    finalGL: '74'
  },
  annualDuesLateFees: {
    letter1Amount: '',
    letter1PercentYN: 'N',
    letter1Percent: '',
    letter1GL: '62',
    letter2Amount: '',
    letter2PercentYN: 'N',
    letter2Percent: '',
    letter2GL: '63',
    finalAmount: '',
    finalGL: '64'
  },
  specialAssessmentLateFees: {
    letter1Amount: '',
    letter1PercentYN: 'N',
    letter1Percent: '',
    letter1GL: '52',
    letter2Amount: '',
    letter2PercentYN: 'N',
    letter2Percent: '',
    letter2GL: '53',
    finalAmount: '',
    finalGL: '54'
  }
};

const DEFAULT_DATA = {
  violationFineRules: {
    restartDays: '',
    fineAmount: ''
  },
  fineTypesList: {
    timed: TIMED_DEFAULTS,
    immediate: IMMEDIATE_DEFAULTS
  },
  ...DEFAULT_LETTER_RULES,
  timingSchedule: {
    warning1Days: '30',
    warning2Days: '60',
    collection1Days: '90',
    collection2Days: '120',
    finalDays: '150'
  }
};

function digitsOnly(value) {
  return value.replace(/\D/g, '');
}

function decimalOnly(value) {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  const whole = parts.shift() || '';
  const decimals = parts.join('');

  return whole + (parts.length > 0 ? `.${decimals}` : '');
}

function cloneRows(rows) {
  return rows.map((row) => [...row]);
}

function normalizeRows(savedRows, defaults) {
  if (!Array.isArray(savedRows) || savedRows.length === 0) {
    return cloneRows(defaults);
  }

  return savedRows.map((row) => [
    row?.[0] || '',
    row?.[1] || '',
    row?.[2] || '',
    row?.[3] || '',
    row?.[4] || 'Y'
  ]);
}

function FinesLateFees({
  requestedSettingsPanel,
  onSettingsNavigationApproved,
  onSettingsNavigationCancelled,
  registerNavigationGuard
}) {
  const [activeSection, setActiveSection] =
    useState('violation-fine-rules');

  const [fineTypeView, setFineTypeView] =
    useState('timed');

  const [selectedFineRow, setSelectedFineRow] =
    useState(-1);

  const [finesData, setFinesData] =
    useState(DEFAULT_DATA);

  const savedFinesRef = useRef(DEFAULT_DATA);

  const [duesDueDates, setDuesDueDates] = useState({
    annualDueDate: '',
    specialDueDate: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] =
    useState(false);

  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const [showUnsavedPrompt, setShowUnsavedPrompt] =
    useState(false);

  const [pendingDestinationType, setPendingDestinationType] =
    useState('');

  const [pendingDestination, setPendingDestination] =
    useState('');

  async function refreshDuesDueDates() {
    const savedDuesData = await loadDuesProgramming();

    setDuesDueDates({
      annualDueDate:
        savedDuesData?.annualDues?.dueDate ||
        savedDuesData?.['Annual Dues']?.annualDueDate ||
        savedDuesData?.['Annual Dues']?.dueDate ||
        '',
      specialDueDate:
        savedDuesData?.specialAssessment?.dueDate ||
        savedDuesData?.['Special Assessment']?.specialDueDate ||
        savedDuesData?.['Special Assessment']?.dueDate ||
        ''
    });
  }

  useEffect(() => {
    let componentIsActive = true;

    async function loadSavedData() {
      try {
        const savedData = await loadFinesLateFees();
        const savedDuesData = await loadDuesProgramming();

        if (!componentIsActive) {
          return;
        }

        setDuesDueDates({
          annualDueDate:
            savedDuesData?.annualDues?.dueDate ||
            savedDuesData?.['Annual Dues']?.annualDueDate ||
            savedDuesData?.['Annual Dues']?.dueDate ||
            '',
          specialDueDate:
            savedDuesData?.specialAssessment?.dueDate ||
            savedDuesData?.['Special Assessment']?.specialDueDate ||
            savedDuesData?.['Special Assessment']?.dueDate ||
            ''
        });

        if (!savedData) {
          return;
        }

        const loadedFinesData = {
          violationFineRules: {
            ...DEFAULT_DATA.violationFineRules,
            ...(savedData.violationFineRules || {})
          },
          fineTypesList: {
            timed: normalizeRows(
              savedData.fineTypesList?.timed,
              TIMED_DEFAULTS
            ),
            immediate: normalizeRows(
              savedData.fineTypesList?.immediate,
              IMMEDIATE_DEFAULTS
            )
          },
          arrearsRules: {
            ...DEFAULT_LETTER_RULES.arrearsRules,
            ...(savedData.arrearsRules || {})
          },
          annualDuesLateFees: {
            ...DEFAULT_LETTER_RULES.annualDuesLateFees,
            ...(savedData.annualDuesLateFees || {})
          },
          specialAssessmentLateFees: {
            ...DEFAULT_LETTER_RULES.specialAssessmentLateFees,
            ...(savedData.specialAssessmentLateFees || {})
          },
          timingSchedule: {
            ...DEFAULT_DATA.timingSchedule,
            ...(savedData.timingSchedule || {})
          }
        };

        savedFinesRef.current = loadedFinesData;
        setFinesData(loadedFinesData);

        if (savedData.activeSection) {
          setActiveSection(savedData.activeSection);
        }

        if (savedData.fineTypeView) {
          setFineTypeView(savedData.fineTypeView);
        }
      } catch (error) {
        console.error(error);

        if (componentIsActive) {
          setSaveError(
            'The saved Fines / Late Fees settings could not be loaded.'
          );
        }
      } finally {
        if (componentIsActive) {
          setIsLoading(false);
        }
      }
    }

    loadSavedData();

    return () => {
      componentIsActive = false;
    };
  }, []);

  useEffect(() => {
    if (activeSection !== 'timing-schedule') {
      return;
    }

    refreshDuesDueDates().catch((error) => {
      console.error(error);

      setSaveError(
        'The Annual Dues and Special Assessment dates could not be loaded.'
      );
    });
  }, [activeSection]);

  useEffect(() => {
    if (!requestedSettingsPanel) {
      return;
    }

    if (hasUnsavedChanges) {
      setPendingDestinationType('settings-panel');
      setPendingDestination(requestedSettingsPanel);
      setShowUnsavedPrompt(true);
      return;
    }

    onSettingsNavigationApproved(requestedSettingsPanel);
  }, [
    requestedSettingsPanel,
    hasUnsavedChanges,
    onSettingsNavigationApproved
  ]);

  useEffect(() => {
    const isDirty =
      JSON.stringify(finesData) !==
      JSON.stringify(savedFinesRef.current);

    setHasUnsavedChanges(isDirty);
  }, [finesData]);

  useEffect(() => {
    if (!registerNavigationGuard) {
      return;
    }

    registerNavigationGuard({
      isDirty: () => hasUnsavedChanges,
      save: saveCurrentSettings
    });

    return () => {
      registerNavigationGuard(null);
    };
  }, [
    registerNavigationGuard,
    hasUnsavedChanges
  ]);

  function markChanged() {
    setHasUnsavedChanges(true);
    setSaveMessage('');
    setSaveError('');
  }

  function updateObject(sectionName, fieldName, value) {
    setFinesData((currentData) => ({
      ...currentData,
      [sectionName]: {
        ...currentData[sectionName],
        [fieldName]: value
      }
    }));

    markChanged();
  }

  function changeViolationRule(event) {
    const { name, value } = event.target;

    const nextValue =
      name === 'restartDays'
        ? digitsOnly(value)
        : decimalOnly(value);

    updateObject(
      'violationFineRules',
      name,
      nextValue
    );
  }

  function changeFineTypeRow(
    rowIndex,
    columnIndex,
    value
  ) {
    let nextValue = value;

    if ([0, 2].includes(columnIndex)) {
      nextValue = digitsOnly(value);
    }

    if (columnIndex === 3) {
      nextValue = decimalOnly(value);
    }

    setFinesData((currentData) => {
      const nextRows = cloneRows(
        currentData.fineTypesList[fineTypeView]
      );

      nextRows[rowIndex][columnIndex] = nextValue;

      return {
        ...currentData,
        fineTypesList: {
          ...currentData.fineTypesList,
          [fineTypeView]: nextRows
        }
      };
    });

    markChanged();
  }

  function addFineTypeRow() {
    setFinesData((currentData) => ({
      ...currentData,
      fineTypesList: {
        ...currentData.fineTypesList,
        [fineTypeView]: [
          ...currentData.fineTypesList[fineTypeView],
          ['', '', '', '', 'Y']
        ]
      }
    }));

    setSelectedFineRow(
      finesData.fineTypesList[fineTypeView].length
    );

    markChanged();
  }

  function deleteFineTypeRow() {
    if (selectedFineRow < 0) {
      window.alert('Select a row to delete.');
      return;
    }

    const confirmed = window.confirm(
      'Delete selected fine type row?'
    );

    if (!confirmed) {
      return;
    }

    setFinesData((currentData) => ({
      ...currentData,
      fineTypesList: {
        ...currentData.fineTypesList,
        [fineTypeView]:
          currentData.fineTypesList[fineTypeView]
            .filter((_, index) =>
              index !== selectedFineRow
            )
      }
    }));

    setSelectedFineRow(-1);
    markChanged();
  }

  function switchFineTypeView(viewName) {
    setFineTypeView(viewName);
    setSelectedFineRow(-1);
  }

  function letterRulesKey() {
    if (activeSection === 'arrears-rules') {
      return 'arrearsRules';
    }

    if (activeSection === 'annual-dues-late-fees') {
      return 'annualDuesLateFees';
    }

    return 'specialAssessmentLateFees';
  }

  function changeLetterRule(event) {
    const { name, value } = event.target;

    let nextValue = value;

    if (
      name.includes('Amount') ||
      name.includes('Percent')
    ) {
      nextValue = decimalOnly(value);
    }

    updateObject(
      letterRulesKey(),
      name,
      nextValue
    );
  }

  function changeTimingRule(event) {
    const { name, value } = event.target;

    updateObject(
      'timingSchedule',
      name,
      digitsOnly(value)
    );
  }

  function buildCompleteData() {
    return {
      ...finesData,
      activeSection,
      fineTypeView
    };
  }

  async function saveCurrentSettings() {
    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      await saveFinesLateFees(buildCompleteData());

      savedFinesRef.current = finesData;
      setHasUnsavedChanges(false);
      setSaveMessage('Changes saved.');

      return true;
    } catch (error) {
      console.error(error);

      setSaveError(
        error.message ||
        'Unable to save Fines / Late Fees settings.'
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function restoreLastSavedData() {
    const savedData = await loadFinesLateFees();

    if (!savedData) {
      setFinesData(DEFAULT_DATA);
      setActiveSection('violation-fine-rules');
      setFineTypeView('timed');
      return;
    }

    const restoredFinesData = {
      violationFineRules: {
        ...DEFAULT_DATA.violationFineRules,
        ...(savedData.violationFineRules || {})
      },
      fineTypesList: {
        timed: normalizeRows(
          savedData.fineTypesList?.timed,
          TIMED_DEFAULTS
        ),
        immediate: normalizeRows(
          savedData.fineTypesList?.immediate,
          IMMEDIATE_DEFAULTS
        )
      },
      arrearsRules: {
        ...DEFAULT_LETTER_RULES.arrearsRules,
        ...(savedData.arrearsRules || {})
      },
      annualDuesLateFees: {
        ...DEFAULT_LETTER_RULES.annualDuesLateFees,
        ...(savedData.annualDuesLateFees || {})
      },
      specialAssessmentLateFees: {
        ...DEFAULT_LETTER_RULES.specialAssessmentLateFees,
        ...(savedData.specialAssessmentLateFees || {})
      },
      timingSchedule: {
        ...DEFAULT_DATA.timingSchedule,
        ...(savedData.timingSchedule || {})
      }
    };

    savedFinesRef.current = restoredFinesData;
    setFinesData(restoredFinesData);

    setActiveSection(
      savedData.activeSection ||
      'violation-fine-rules'
    );

    setFineTypeView(
      savedData.fineTypeView || 'timed'
    );
  }

  function requestSection(sectionName) {
    if (sectionName === activeSection) {
      return;
    }

    if (hasUnsavedChanges) {
      setPendingDestinationType('section');
      setPendingDestination(sectionName);
      setShowUnsavedPrompt(true);
      return;
    }

    setActiveSection(sectionName);
    setSelectedFineRow(-1);
    setSaveMessage('');
    setSaveError('');
  }

  function completePendingNavigation() {
    if (pendingDestinationType === 'settings-panel') {
      onSettingsNavigationApproved(
        pendingDestination
      );
    } else {
      setActiveSection(pendingDestination);
      setSelectedFineRow(-1);
    }

    setPendingDestinationType('');
    setPendingDestination('');
    setShowUnsavedPrompt(false);
  }

  async function handlePromptYes() {
    const saveSucceeded =
      await saveCurrentSettings();

    if (!saveSucceeded) {
      return;
    }

    completePendingNavigation();
  }

  async function handlePromptNo() {
    setIsLoading(true);
    setSaveMessage('');
    setSaveError('');

    try {
      await restoreLastSavedData();
      setHasUnsavedChanges(false);
      completePendingNavigation();
    } catch (error) {
      console.error(error);

      setSaveError(
        'The last saved Fines / Late Fees settings could not be restored.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handlePromptCancel() {
    const wasSettingsNavigation =
      pendingDestinationType === 'settings-panel';

    setPendingDestinationType('');
    setPendingDestination('');
    setShowUnsavedPrompt(false);

    if (wasSettingsNavigation) {
      onSettingsNavigationCancelled();
    }
  }

  function renderSaveControls() {
    return (
      <div className="fines-details-actions">
        <button
          type="button"
          className={
            saveMessage
              ? 'fines-save-button fines-save-button-saved'
              : 'fines-save-button'
          }
          onClick={saveCurrentSettings}
          disabled={isLoading || isSaving}
        >
          {isSaving
            ? 'Saving...'
            : saveMessage
              ? 'Changes Saved'
              : 'Save Changes'}
        </button>

        {hasUnsavedChanges && (
          <span className="fines-unsaved-message">
            Save Changes
          </span>
        )}

        {saveError && (
          <span className="fines-error-message">
            {saveError}
          </span>
        )}
      </div>
    );
  }

  function renderViolationFineRules() {
    const data = finesData.violationFineRules;

    return (
      <>
        <div className="fines-details-title">
          TIMED VIOLATION FINE RULES
        </div>

        <div className="fines-form-grid">
          <label htmlFor="restartDays">
            Time Interval Between Start &amp; Restart
            (Days)
          </label>

          <input
            id="restartDays"
            name="restartDays"
            type="text"
            inputMode="numeric"
            value={data.restartDays}
            onChange={changeViolationRule}
          />

          <label htmlFor="fineAmount">
            Fine Amount
          </label>

          <input
            id="fineAmount"
            name="fineAmount"
            type="text"
            inputMode="decimal"
            value={data.fineAmount}
            onChange={changeViolationRule}
          />
        </div>

        {renderSaveControls()}
      </>
    );
  }

  function renderFineTypesList() {
    const rows = finesData.fineTypesList[fineTypeView];
    const isImmediate = fineTypeView === 'immediate';

    return (
      <>
        <div className="fines-details-title">
          FINE TYPES LIST
        </div>

        <div className="fines-instructions">
          Select either Timed Violation Categories or
          Immediate Violation Categories. Only one list is
          shown at a time.
        </div>

        <div className="fines-top-action-row">
          <div className="fines-sub-selector">
            <button
              type="button"
              className={
                !isImmediate
                  ? 'fines-sub-btn active'
                  : 'fines-sub-btn'
              }
              onClick={() =>
                switchFineTypeView('timed')
              }
            >
              Timed Violation Categories
            </button>

            <button
              type="button"
              className={
                isImmediate
                  ? 'fines-sub-btn active'
                  : 'fines-sub-btn'
              }
              onClick={() =>
                switchFineTypeView('immediate')
              }
            >
              Immediate Violation Categories
            </button>
          </div>

          <div className="fines-action-buttons">
            <button
              type="button"
              onClick={addFineTypeRow}
            >
              Add Row
            </button>

            <button
              type="button"
              onClick={deleteFineTypeRow}
            >
              Delete Row
            </button>

            {renderSaveControls()}
          </div>
        </div>

        <div className="fines-table-scroll">
          <table className="fines-rate-table">
            <thead>
              <tr>
                <th className="fines-letter-code-column">
                  Letter Code
                </th>
                <th>Violation Type</th>
                <th className="fines-gl-column">
                  GL# Assigned
                </th>

                {isImmediate && (
                  <th className="fines-amount-column">
                    $ Amount
                  </th>
                )}

                <th className="fines-active-column">
                  Active
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={`${fineTypeView}-${rowIndex}`}
                  className={
                    selectedFineRow === rowIndex
                      ? 'selected'
                      : ''
                  }
                  onClick={() =>
                    setSelectedFineRow(rowIndex)
                  }
                >
                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row[0]}
                      onChange={(event) =>
                        changeFineTypeRow(
                          rowIndex,
                          0,
                          event.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      value={row[1]}
                      onChange={(event) =>
                        changeFineTypeRow(
                          rowIndex,
                          1,
                          event.target.value
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row[2]}
                      onChange={(event) =>
                        changeFineTypeRow(
                          rowIndex,
                          2,
                          event.target.value
                        )
                      }
                    />
                  </td>

                  {isImmediate && (
                    <td>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row[3]}
                        onChange={(event) =>
                          changeFineTypeRow(
                            rowIndex,
                            3,
                            event.target.value
                          )
                        }
                      />
                    </td>
                  )}

                  <td>
                    <select
                      value={row[4]}
                      onChange={(event) =>
                        changeFineTypeRow(
                          rowIndex,
                          4,
                          event.target.value
                        )
                      }
                    >
                      <option value="Y">Y</option>
                      <option value="N">N</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  function renderLetterRules() {
    const key = letterRulesKey();
    const data = finesData[key];

    const titles = {
      arrearsRules: 'ARREARS RULES',
      annualDuesLateFees:
        'ANNUAL DUES LATE FEES',
      specialAssessmentLateFees:
        'SPECIAL ASSESSMENT LATE FEES'
    };

    return (
      <>
        <div className="fines-details-title">
          {titles[key]}
        </div>

        <div className="fines-table-scroll">
          <table className="fines-letter-rules-table">
            <thead>
              <tr>
                <th>Letter / Fee Type</th>
                <th>Fee Amount</th>
                <th>Late Fee + %?</th>
                <th>% Rate</th>
                <th>Letter GL#</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Collection Letter #1</td>
                <td>
                  <input
                    name="letter1Amount"
                    type="text"
                    inputMode="decimal"
                    value={data.letter1Amount}
                    onChange={changeLetterRule}
                  />
                </td>
                <td>
                  <select
                    name="letter1PercentYN"
                    value={data.letter1PercentYN}
                    onChange={changeLetterRule}
                  >
                    <option value="N">N</option>
                    <option value="Y">Y</option>
                  </select>
                </td>
                <td>
                  <input
                    name="letter1Percent"
                    type="text"
                    inputMode="decimal"
                    value={data.letter1Percent}
                    onChange={changeLetterRule}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={data.letter1GL}
                    readOnly
                  />
                </td>
              </tr>

              <tr>
                <td>Collection Letter #2</td>
                <td>
                  <input
                    name="letter2Amount"
                    type="text"
                    inputMode="decimal"
                    value={data.letter2Amount}
                    onChange={changeLetterRule}
                  />
                </td>
                <td>
                  <select
                    name="letter2PercentYN"
                    value={data.letter2PercentYN}
                    onChange={changeLetterRule}
                  >
                    <option value="N">N</option>
                    <option value="Y">Y</option>
                  </select>
                </td>
                <td>
                  <input
                    name="letter2Percent"
                    type="text"
                    inputMode="decimal"
                    value={data.letter2Percent}
                    onChange={changeLetterRule}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={data.letter2GL}
                    readOnly
                  />
                </td>
              </tr>

              <tr>
                <td>Final Letter - Legal Expenses</td>
                <td>
                  <input
                    name="finalAmount"
                    type="text"
                    inputMode="decimal"
                    value={data.finalAmount}
                    onChange={changeLetterRule}
                  />
                </td>
                <td></td>
                <td></td>
                <td>
                  <input
                    type="text"
                    value={data.finalGL}
                    readOnly
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {renderSaveControls()}
      </>
    );
  }

  function renderTimingSchedule() {
    const data = finesData.timingSchedule;

    const rows = [
      [
        'warning1Days',
        'DAYS <= DD, WARNING LETTER #1'
      ],
      [
        'warning2Days',
        'DAYS <= DD, WARNING LETTER #2'
      ],
      [
        'collection1Days',
        'DAYS <= DD, COLLECTION LETTER #1'
      ],
      [
        'collection2Days',
        'DAYS <= DD, COLLECTION LETTER #2'
      ],
      [
        'finalDays',
        'DAYS >= DD, FINAL LETTER / LEGAL'
      ]
    ];

    return (
      <>
        <div className="fines-details-title">
          DUES FINE / LATE FEE TIMING SCHEDULE
        </div>

        <div className="fines-table-scroll">
          <table className="fines-timing-table">
            <thead>
              <tr>
                <th>Timing Rule</th>
                <th>Days</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Annual Dues Due Date (DD)</td>
                <td>
                  <input
                    type="text"
                    value={duesDueDates.annualDueDate}
                    readOnly
                  />
                </td>
              </tr>

              <tr>
                <td>Special Assessment Due Date (DD)</td>
                <td>
                  <input
                    type="text"
                    value={duesDueDates.specialDueDate}
                    readOnly
                  />
                </td>
              </tr>

              {rows.map(([fieldName, label]) => (
                <tr key={fieldName}>
                  <td>{label}</td>
                  <td>
                    <input
                      name={fieldName}
                      type="text"
                      inputMode="numeric"
                      value={data[fieldName]}
                      onChange={changeTimingRule}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderSaveControls()}
      </>
    );
  }

  function renderRightPanel() {
    if (activeSection === 'fine-types-list') {
      return renderFineTypesList();
    }

    if (
      [
        'arrears-rules',
        'annual-dues-late-fees',
        'special-assessment-late-fees'
      ].includes(activeSection)
    ) {
      return renderLetterRules();
    }

    if (activeSection === 'timing-schedule') {
      return renderTimingSchedule();
    }

    return renderViolationFineRules();
  }

  const rows = useMemo(() => [
    [
      'violation-fine-rules',
      'Violation Fine Rules',
      'Timed violation fine rules'
    ],
    [
      'fine-types-list',
      'Fine Types List',
      'Timed and immediate violation categories'
    ],
    [
      'arrears-rules',
      'Arrears Rules',
      'Fine / late fee arrears collection rules'
    ],
    [
      'annual-dues-late-fees',
      'Annual Dues Late Fees',
      'Annual dues collection letter rules'
    ],
    [
      'special-assessment-late-fees',
      'Special Assessment Late Fees',
      'Special assessment collection letter rules'
    ],
    [
      'timing-schedule',
      'Dues Fine / Late Fee Timing Schedule',
      'Fine / late fee timing schedule'
    ]
  ], []);

  return (
    <div className="settings-fines-wrap">
      <div className="settings-fines-left">
        <div className="fines-header-row">
          <div className="fines-title">
            FINES / LATE FEES
          </div>
        </div>

        <div className="fines-grid">
          <div className="fines-grid-head">
            <div>Programming Type</div>
            <div>Description</div>
          </div>

          {rows.map(([key, title, description]) => (
            <div
              key={key}
              className={
                activeSection === key
                  ? 'fines-grid-row selected'
                  : 'fines-grid-row'
              }
              onClick={() => requestSection(key)}
            >
              <div>{title}</div>
              <div>{description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-fines-right">
        {renderRightPanel()}
      </div>

      <UnsavedChangesPrompt
        isOpen={showUnsavedPrompt}
        isSaving={isSaving}
        isLoading={isLoading}
        errorMessage={saveError}
        onYes={handlePromptYes}
        onNo={handlePromptNo}
        onCancel={handlePromptCancel}
      />
    </div>
  );
}

export default FinesLateFees;

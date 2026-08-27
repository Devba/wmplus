import { useEffect, useMemo, useRef, useState } from 'react';

import './DuesProgramming.css';

import {
  loadDuesProgramming,
  saveDuesProgramming
} from '../../services/duesProgrammingService';

import UnsavedChangesPrompt
  from '../UnsavedChangesPrompt/UnsavedChangesPrompt';

const RATE_TYPES = [
  'Type A',
  'Type B',
  'Type C',
  'Type D',
  'Type E',
  'Type F',
  'Type G',
  'Type H',
  'Type I',
  'Type J'
];

function createEmptyRates() {
  return RATE_TYPES.reduce((result, rateType) => {
    result[rateType] = {
      currentRate: '',
      nextRate: ''
    };

    return result;
  }, {});
}

const DEFAULT_SECTION_DATA = {
  paymentFrequency: 'Annually',
  dueDate: '',
  rates: createEmptyRates()
};

const DEFAULT_DATA = {
  annualDues: {
    ...DEFAULT_SECTION_DATA,
    rates: createEmptyRates()
  },
  specialAssessment: {
    ...DEFAULT_SECTION_DATA,
    rates: createEmptyRates()
  }
};

function decimalOnly(value) {
  let cleanedValue = value.replace(/[^0-9.]/g, '');

  const decimalParts = cleanedValue.split('.');
  const wholeNumber = decimalParts.shift() || '';
  const decimalNumber = decimalParts.join('');

  return (
    wholeNumber +
    (decimalParts.length > 0
      ? `.${decimalNumber}`
      : '')
  );
}

function formatDateEntry(value) {
  const digits = value
    .replace(/\D/g, '')
    .slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return (
    `${digits.slice(0, 2)}/` +
    `${digits.slice(2, 4)}/` +
    `${digits.slice(4)}`
  );
}

function isValidDate(value) {
  if (value === '') {
    return true;
  }

  const match =
    /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}


function isCurrentYearDate(value) {
  if (!isValidDate(value)) {
    return false;
  }

  const year = Number(value.slice(6, 10));
  const currentYear = new Date().getFullYear();

  return year === currentYear;
}


function moneyToNumber(value) {
  const numberValue = Number.parseFloat(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : 0;
}

function formatMoney(value) {
  if (!value) {
    return '$';
  }

  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function calculatePayment(rateText, divisor) {
  const rate = moneyToNumber(rateText);

  if (!rate) {
    return '$';
  }

  return formatMoney(rate / divisor);
}

function normalizeSection(savedSection) {
  const savedRates = savedSection?.rates || {};

  const normalizedRates = RATE_TYPES.reduce(
    (result, rateType) => {
      result[rateType] = {
        currentRate:
          savedRates[rateType]?.currentRate || '',
        nextRate:
          savedRates[rateType]?.nextRate || ''
      };

      return result;
    },
    {}
  );

  return {
    paymentFrequency:
      savedSection?.paymentFrequency || 'Annually',
    dueDate: savedSection?.dueDate || '',
    rates: normalizedRates
  };
}

function DuesProgramming({
  requestedSettingsPanel,
  onSettingsNavigationApproved,
  onSettingsNavigationCancelled,
  registerNavigationGuard
}) {
  const [activeSection, setActiveSection] =
    useState('annual-dues');

  const [duesData, setDuesData] =
    useState(DEFAULT_DATA);

  const savedDuesRef = useRef(DEFAULT_DATA);

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

  const sectionKey =
    activeSection === 'annual-dues'
      ? 'annualDues'
      : 'specialAssessment';

  const currentSection = duesData[sectionKey];

  const isAnnual = activeSection === 'annual-dues';

  const labels = useMemo(() => ({
    title: isAnnual
      ? 'ANNUAL DUES PAYMENT TYPES'
      : 'SPECIAL ASSESSMENT PAYMENT TYPES',

    instructions: isAnnual
      ? (
        'This is the programming of the annual dues types ' +
        'that will be applied to each resident. Please fill ' +
        "in the current annual dues rate and next year's " +
        'annual dues rate. The payment schedule columns are ' +
        'calculated from those rates.'
      )
      : (
        'This is the programming of the Special Assessment ' +
        'types that will be applied to each resident. Please ' +
        'fill in the current Special Assessment rate and next ' +
        "year's Special Assessment rate. The payment schedule " +
        'columns are calculated from those rates.'
      ),

    firstHeader: isAnnual
      ? 'Annual Dues Rate Type'
      : "Special Assm't Type",

    currentHeader: isAnnual
      ? 'Annual Dues Rate'
      : "Special Assm't Rate",

    nextHeader: isAnnual
      ? "Nxt Year's Annual Dues Rate"
      : "Nxt Year's Special Assm't Rate",

    dueDateLabel: isAnnual
      ? 'Annual Due Date'
      : "Special Assm't Due Date"
  }), [isAnnual]);

  useEffect(() => {
    let componentIsActive = true;

    async function loadSavedData() {
      try {
        const savedData =
          await loadDuesProgramming();

        if (!componentIsActive || !savedData) {
          return;
        }

        const loadedDuesData = {
          annualDues:
            normalizeSection(savedData.annualDues),
          specialAssessment:
            normalizeSection(
              savedData.specialAssessment
            )
        };

        savedDuesRef.current = loadedDuesData;
        setDuesData(loadedDuesData);

        if (savedData.activeSection) {
          setActiveSection(savedData.activeSection);
        }
      } catch (error) {
        console.error(error);

        if (componentIsActive) {
          setSaveError(
            'The saved Dues Programming settings could not be loaded.'
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
      JSON.stringify(duesData) !==
      JSON.stringify(savedDuesRef.current);

    setHasUnsavedChanges(isDirty);
  }, [duesData]);

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

  function updateCurrentSection(updater) {
    setDuesData((currentData) => ({
      ...currentData,
      [sectionKey]: updater(currentData[sectionKey])
    }));

    markChanged();
  }

  function changePaymentFrequency(event) {
    const { value } = event.target;

    updateCurrentSection((sectionData) => ({
      ...sectionData,
      paymentFrequency: value
    }));
  }

  function changeDueDate(event) {
    const nextValue =
      formatDateEntry(event.target.value);

    updateCurrentSection((sectionData) => ({
      ...sectionData,
      dueDate: nextValue
    }));
  }

  function changeRate(
    rateType,
    fieldName,
    value
  ) {
    const nextValue = decimalOnly(value);

    updateCurrentSection((sectionData) => ({
      ...sectionData,
      rates: {
        ...sectionData.rates,
        [rateType]: {
          ...sectionData.rates[rateType],
          [fieldName]: nextValue
        }
      }
    }));
  }

  function buildCompleteData() {
    return {
      annualDues: duesData.annualDues,
      specialAssessment: duesData.specialAssessment,
      activeSection
    };
  }

  async function saveCurrentSettings() {
    if (!isValidDate(currentSection.dueDate)) {
  setSaveError(
    `${labels.dueDateLabel} must be a valid mm/dd/yyyy date.`
  );

  return false;
}

if (!isCurrentYearDate(currentSection.dueDate)) {
  const currentYear = new Date().getFullYear();

  setSaveError(
    `${labels.dueDateLabel} must use the current year, ${currentYear}.`
  );

  return false;
}

    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      await saveDuesProgramming(
        buildCompleteData()
      );

      savedDuesRef.current = duesData;
      setHasUnsavedChanges(false);
      setSaveMessage('Changes saved.');

      return true;
    } catch (error) {
      console.error(error);

      setSaveError(
        error.message ||
        'Unable to save Dues Programming settings.'
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function restoreLastSavedData() {
    const savedData =
      await loadDuesProgramming();

    if (!savedData) {
      setDuesData(DEFAULT_DATA);
      setActiveSection('annual-dues');
      return;
    }

    const restoredDuesData = {
      annualDues:
        normalizeSection(savedData.annualDues),
      specialAssessment:
        normalizeSection(savedData.specialAssessment)
    };

    savedDuesRef.current = restoredDuesData;
    setDuesData(restoredDuesData);

    setActiveSection(
      savedData.activeSection || 'annual-dues'
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
        'The last saved Dues Programming settings could not be restored.'
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

  return (
    <div className="settings-dues-wrap">
      <div className="settings-dues-left">
        <div className="dues-header-row">
          <div className="dues-title">
            ANNUAL / SPECIAL DUES PROGRAMMING
          </div>
        </div>

        <div className="dues-grid">
          <div className="dues-grid-head">
            <div>Programming Type</div>
            <div>Description</div>
          </div>

          <div
            className={
              activeSection === 'annual-dues'
                ? 'dues-grid-row selected'
                : 'dues-grid-row'
            }
            onClick={() =>
              requestSection('annual-dues')
            }
          >
            <div>Annual Dues</div>
            <div>Annual Dues Payment Types</div>
          </div>

          <div
            className={
              activeSection === 'special-assessment'
                ? 'dues-grid-row selected'
                : 'dues-grid-row'
            }
            onClick={() =>
              requestSection('special-assessment')
            }
          >
            <div>Special Assessment</div>
            <div>
              Special Assessment Payment Types
            </div>
          </div>
        </div>
      </div>

      <div className="settings-dues-right">
        <div className="dues-details-title">
          {labels.title}
        </div>

        <div className="dues-instructions">
          {labels.instructions}
        </div>

        <div className="dues-control-row">
          <div className="dues-control-left">
            <label htmlFor="paymentFrequency">
              HOA Payment Type
            </label>

            <select
              id="paymentFrequency"
              className="dues-payment-frequency"
              value={currentSection.paymentFrequency}
              onChange={changePaymentFrequency}
            >
              <option value="Annually">
                Annually
              </option>
              <option value="Semi-Annually">
                Semi-Annually
              </option>
              <option value="Quarterly">
                Quarterly
              </option>
              <option value="Monthly">
                Monthly
              </option>
            </select>

            <label htmlFor="duesDueDate">
              {labels.dueDateLabel}
            </label>

            <input
              id="duesDueDate"
              type="text"
              inputMode="numeric"
              className="dues-date-box"
              placeholder="mm/dd/yyyy"
              maxLength={10}
              value={currentSection.dueDate}
              onChange={changeDueDate}
            />
          </div>

          <div className="dues-control-right">
            <button
              type="button"
              className={
                saveMessage
                  ? (
                    'dues-save-button ' +
                    'dues-save-button-saved'
                  )
                  : 'dues-save-button'
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
              <span className="dues-unsaved-message">
                Save Changes
              </span>
            )}

            {saveError && (
              <span className="dues-error-message">
                {saveError}
              </span>
            )}
          </div>
        </div>

        <div className="dues-table-scroll">
          <table className="dues-rate-table">
            <thead>
              <tr>
                <th>{labels.firstHeader}</th>
                <th>{labels.currentHeader}</th>
                <th>Pay'mt Annually</th>
                <th>Pay'mt Semi-Annually</th>
                <th>Pay'mt Quarterly</th>
                <th>Pay'mt Monthly</th>
                <th>{labels.nextHeader}</th>
                <th>Pay'mt Annually</th>
                <th>Pay'mt Semi-Annually</th>
                <th>Pay'mt Quarterly</th>
                <th>Pay'mt Monthly</th>
              </tr>
            </thead>

            <tbody>
              {RATE_TYPES.map((rateType) => {
                const rateData =
                  currentSection.rates[rateType];

                return (
                  <tr key={rateType}>
                    <td>{rateType}</td>

                    <td>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rateData.currentRate}
                        onChange={(event) =>
                          changeRate(
                            rateType,
                            'currentRate',
                            event.target.value
                          )
                        }
                      />
                    </td>

                    <td className="dues-calculated">
                      {calculatePayment(
                        rateData.currentRate,
                        1
                      )}
                    </td>

                    <td className="dues-calculated">
                      {calculatePayment(
                        rateData.currentRate,
                        2
                      )}
                    </td>

                    <td className="dues-calculated">
                      {calculatePayment(
                        rateData.currentRate,
                        4
                      )}
                    </td>

                    <td className="dues-calculated">
                      {calculatePayment(
                        rateData.currentRate,
                        12
                      )}
                    </td>

                    <td>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rateData.nextRate}
                        onChange={(event) =>
                          changeRate(
                            rateType,
                            'nextRate',
                            event.target.value
                          )
                        }
                      />
                    </td>

                    <td className="dues-calculated">
                      {calculatePayment(
                        rateData.nextRate,
                        1
                      )}
                    </td>

                    <td className="dues-calculated">
                      {calculatePayment(
                        rateData.nextRate,
                        2
                      )}
                    </td>

                    <td className="dues-calculated">
                      {calculatePayment(
                        rateData.nextRate,
                        4
                      )}
                    </td>

                    <td className="dues-calculated">
                      {calculatePayment(
                        rateData.nextRate,
                        12
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

export default DuesProgramming;

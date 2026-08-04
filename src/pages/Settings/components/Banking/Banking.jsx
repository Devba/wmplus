import { useEffect, useMemo, useState } from 'react';

import './Banking.css';

import {
  loadBankingSettings,
  saveBankingSettings
} from '../../services/bankingService';

import UnsavedChangesPrompt
  from '../UnsavedChangesPrompt/UnsavedChangesPrompt';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const DEFAULT_FISCAL_DATA = {
  openingRetainedEarnings: '',
  endingRetainedEarnings: '',
  currentFiscalYearIncome: '',
  accountsReceivable: '',
  accountsPayable: '',
  interestEarned: '',
  previousYearsEndingIncome: '',
  miscAssetEntry: '',
  miscLiabilityEntry: '',
  notes: ''
};

const DEFAULT_BANK_ROWS = [
  {
    id: 'operating-101',
    bankType: 'Operating',
    bankName: 'Bank of America',
    bankId: '101',
    active: 'Y',
    checkMode: 'System',
    startCheck: '1001',
    glCashAccount: '1010',
    accountNumber: '',
    routingNumber: '',
    startingBalance: '',
    startingMonth: 'May',
    contactPerson: '',
    contactTel: '',
    contactEmail: '',
    coMingled: 'N',
    coMingledWith: '',
    notes: ''
  },
  {
    id: 'capital-201',
    bankType: 'Capital',
    bankName: 'Bank of America',
    bankId: '201',
    active: 'Y',
    checkMode: 'None',
    startCheck: '',
    glCashAccount: '1010',
    accountNumber: '',
    routingNumber: '',
    startingBalance: '',
    startingMonth: 'May',
    contactPerson: '',
    contactTel: '',
    contactEmail: '',
    coMingled: 'N',
    coMingledWith: '',
    notes: ''
  },
  {
    id: 'escrow-301',
    bankType: 'Escrow',
    bankName: 'Wells Fargo',
    bankId: '301',
    active: 'Y',
    checkMode: 'Manual',
    startCheck: '9001',
    glCashAccount: '1020',
    accountNumber: '',
    routingNumber: '',
    startingBalance: '',
    startingMonth: 'May',
    contactPerson: '',
    contactTel: '',
    contactEmail: '',
    coMingled: 'N',
    coMingledWith: '',
    notes: ''
  },
  {
    id: 'money-market-401',
    bankType: 'Money Market',
    bankName: 'Truist',
    bankId: '401',
    active: 'Y',
    checkMode: 'None',
    startCheck: '',
    glCashAccount: '1010',
    accountNumber: '',
    routingNumber: '',
    startingBalance: '',
    startingMonth: 'May',
    contactPerson: '',
    contactTel: '',
    contactEmail: '',
    coMingled: 'N',
    coMingledWith: '',
    notes: ''
  },
  {
    id: 'savings-451',
    bankType: 'Savings',
    bankName: 'First Citizens',
    bankId: '451',
    active: 'Y',
    checkMode: 'None',
    startCheck: '',
    glCashAccount: '1010',
    accountNumber: '',
    routingNumber: '',
    startingBalance: '',
    startingMonth: 'May',
    contactPerson: '',
    contactTel: '',
    contactEmail: '',
    coMingled: 'N',
    coMingledWith: '',
    notes: ''
  },
  {
    id: 'cd-501',
    bankType: 'CD',
    bankName: 'Synovus',
    bankId: '501',
    active: 'Y',
    checkMode: 'None',
    startCheck: '',
    glCashAccount: '1010',
    accountNumber: '',
    routingNumber: '',
    startingBalance: '',
    startingMonth: 'May',
    contactPerson: '',
    contactTel: '',
    contactEmail: '',
    coMingled: 'N',
    coMingledWith: '',
    notes: ''
  }
];

function createBankId(bankType, bankId) {
  const safeType = bankType
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `${safeType || 'bank'}-${bankId.trim() || Date.now()}`;
}

function digitsOnly(value) {
  return value.replace(/\D/g, '');
}

function decimalOnly(value) {
  let cleanedValue = value.replace(/[^0-9.-]/g, '');

  const isNegative = cleanedValue.startsWith('-');

  cleanedValue = cleanedValue.replace(/-/g, '');

  const decimalParts = cleanedValue.split('.');
  const wholeNumber = decimalParts.shift() || '';
  const decimalNumber = decimalParts.join('');

  return (
    (isNegative ? '-' : '') +
    wholeNumber +
    (decimalParts.length > 0
      ? `.${decimalNumber}`
      : '')
  );
}

function telephoneOnly(value) {
  return value.replace(/[^0-9()+\-\s.]/g, '');
}

function Banking({
  requestedSettingsPanel,
  onSettingsNavigationApproved,
  onSettingsNavigationCancelled
}) {
  const [selectedRowId, setSelectedRowId] =
    useState('operating-101');

  const [bankRows, setBankRows] =
    useState(DEFAULT_BANK_ROWS);

  const [fiscalData, setFiscalData] =
    useState(DEFAULT_FISCAL_DATA);

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

  const selectedBank = useMemo(
    () => bankRows.find((row) => row.id === selectedRowId),
    [bankRows, selectedRowId]
  );

  const isFiscalSetup = selectedRowId === 'fiscal-setup';

  useEffect(() => {
    let componentIsActive = true;

    async function loadSavedData() {
      try {
        const savedData = await loadBankingSettings();

        if (!componentIsActive || !savedData) {
          return;
        }

        if (
          Array.isArray(savedData.bankRows) &&
          savedData.bankRows.length > 0
        ) {
          setBankRows(savedData.bankRows);
        }

        if (savedData.fiscalData) {
          setFiscalData({
            ...DEFAULT_FISCAL_DATA,
            ...savedData.fiscalData
          });
        }

        if (savedData.selectedRowId) {
          setSelectedRowId(savedData.selectedRowId);
        }
      } catch (error) {
        console.error(error);

        if (componentIsActive) {
          setSaveError(
            'The saved Banking settings could not be loaded.'
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

  function markChanged() {
    setHasUnsavedChanges(true);
    setSaveMessage('');
    setSaveError('');
  }

  function buildCompleteBankingData() {
    return {
      bankRows,
      fiscalData,
      selectedRowId
    };
  }

  async function saveCurrentBankingSettings() {
    if (
      selectedBank?.routingNumber &&
      selectedBank.routingNumber.length !== 9
    ) {
      setSaveError(
        'Routing Number must contain exactly 9 digits.'
      );

      return false;
    }

    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      await saveBankingSettings(
        buildCompleteBankingData()
      );

      setHasUnsavedChanges(false);
      setSaveMessage('Changes saved.');

      return true;
    } catch (error) {
      console.error(error);

      setSaveError(
        error.message ||
        'Unable to save Banking settings.'
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function restoreLastSavedData() {
    const savedData = await loadBankingSettings();

    if (!savedData) {
      setBankRows(DEFAULT_BANK_ROWS);
      setFiscalData(DEFAULT_FISCAL_DATA);
      setSelectedRowId('operating-101');
      return;
    }

    setBankRows(
      Array.isArray(savedData.bankRows) &&
      savedData.bankRows.length > 0
        ? savedData.bankRows
        : DEFAULT_BANK_ROWS
    );

    setFiscalData({
      ...DEFAULT_FISCAL_DATA,
      ...(savedData.fiscalData || {})
    });

    setSelectedRowId(
      savedData.selectedRowId || 'operating-101'
    );
  }

  function completePendingNavigation() {
    if (pendingDestinationType === 'settings-panel') {
      onSettingsNavigationApproved(pendingDestination);
    } else {
      setSelectedRowId(pendingDestination);
    }

    setPendingDestinationType('');
    setPendingDestination('');
    setShowUnsavedPrompt(false);
  }

  function requestRowSelection(rowId) {
    if (rowId === selectedRowId) {
      return;
    }

    if (hasUnsavedChanges) {
      setPendingDestinationType('row');
      setPendingDestination(rowId);
      setShowUnsavedPrompt(true);
      return;
    }

    setSelectedRowId(rowId);
    setSaveMessage('');
    setSaveError('');
  }

  async function handlePromptYes() {
    const saveSucceeded =
      await saveCurrentBankingSettings();

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
        'The last saved Banking settings could not be restored.'
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

  function changeFiscalField(event) {
    const { name, value } = event.target;

    const nextValue =
      name === 'notes'
        ? value
        : decimalOnly(value);

    setFiscalData((currentData) => ({
      ...currentData,
      [name]: nextValue
    }));

    markChanged();
  }

  function changeBankField(event) {
    const { name, value } = event.target;

    const digitFields = [
      'startCheck',
      'glCashAccount',
      'accountNumber',
      'routingNumber'
    ];

    let nextValue = value;

    if (digitFields.includes(name)) {
      nextValue = digitsOnly(value);
    } else if (name === 'startingBalance') {
      nextValue = decimalOnly(value);
    } else if (name === 'contactTel') {
      nextValue = telephoneOnly(value);
    }

    setBankRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== selectedRowId) {
          return row;
        }

        if (name === 'coMingled' && nextValue === 'N') {
          return {
            ...row,
            coMingled: nextValue,
            coMingledWith: ''
          };
        }

        return {
          ...row,
          [name]: nextValue
        };
      })
    );

    markChanged();
  }

  function handleAddAccount() {
    const newBankType = window.prompt('Bank Type:');

    if (
      newBankType === null ||
      newBankType.trim() === ''
    ) {
      return;
    }

    const newBankName =
      window.prompt('Bank Name / Description:');

    if (
      newBankName === null ||
      newBankName.trim() === ''
    ) {
      return;
    }

    const newBankIdEntry = window.prompt('Bank ID#:');

    if (newBankIdEntry === null) {
      return;
    }

    const newBankId = digitsOnly(newBankIdEntry);

    if (newBankId === '') {
      window.alert('Bank ID# must contain numbers only.');
      return;
    }

    const duplicate = bankRows.some(
      (row) =>
        row.bankId.trim().toLowerCase() ===
        newBankId.trim().toLowerCase()
    );

    if (duplicate) {
      window.alert('That Bank ID# already exists.');
      return;
    }

    const newRow = {
      id: createBankId(newBankType, newBankId),
      bankType: newBankType.trim(),
      bankName: newBankName.trim(),
      bankId: newBankId.trim(),
      active: 'Y',
      checkMode: 'None',
      startCheck: '',
      glCashAccount: '1010',
      accountNumber: '',
      routingNumber: '',
      startingBalance: '',
      startingMonth: 'May',
      contactPerson: '',
      contactTel: '',
      contactEmail: '',
      coMingled: 'N',
      coMingledWith: '',
      notes: ''
    };

    setBankRows((currentRows) => [
      ...currentRows,
      newRow
    ]);

    setSelectedRowId(newRow.id);
    markChanged();

    window.alert('New bank account added.');
  }

  function handleEditAccount() {
    if (isFiscalSetup || !selectedBank) {
      window.alert(
        'Fiscal Setup row name cannot be edited.'
      );
      return;
    }

    const newBankType = window.prompt(
      'Bank Type:',
      selectedBank.bankType
    );

    if (
      newBankType === null ||
      newBankType.trim() === ''
    ) {
      return;
    }

    const newBankName = window.prompt(
      'Bank Name / Description:',
      selectedBank.bankName
    );

    if (
      newBankName === null ||
      newBankName.trim() === ''
    ) {
      return;
    }

    const newBankIdEntry = window.prompt(
      'Bank ID#:',
      selectedBank.bankId
    );

    if (newBankIdEntry === null) {
      return;
    }

    const newBankId = digitsOnly(newBankIdEntry);

    if (newBankId === '') {
      window.alert('Bank ID# must contain numbers only.');
      return;
    }

    const duplicate = bankRows.some(
      (row) =>
        row.id !== selectedBank.id &&
        row.bankId.trim().toLowerCase() ===
          newBankId.trim().toLowerCase()
    );

    if (duplicate) {
      window.alert('That Bank ID# already exists.');
      return;
    }

    setBankRows((currentRows) =>
      currentRows.map((row) =>
        row.id === selectedBank.id
          ? {
              ...row,
              bankType: newBankType.trim(),
              bankName: newBankName.trim(),
              bankId: newBankId.trim()
            }
          : row
      )
    );

    markChanged();
    window.alert('Bank row updated.');
  }

  function handleDeactivateAccount() {
    if (isFiscalSetup || !selectedBank) {
      return;
    }

    const newActive =
      selectedBank.active === 'Y' ? 'N' : 'Y';

    const actionWord =
      newActive === 'N'
        ? 'Deactivate'
        : 'Reactivate';

    const confirmed = window.confirm(
      `${actionWord} this bank account?\n\n` +
      `${selectedBank.bankType} - ${selectedBank.bankName}`
    );

    if (!confirmed) {
      return;
    }

    setBankRows((currentRows) =>
      currentRows.map((row) =>
        row.id === selectedBank.id
          ? {
              ...row,
              active: newActive
            }
          : row
      )
    );

    markChanged();

    window.alert(
      `Bank account ${
        newActive === 'N'
          ? 'deactivated.'
          : 'reactivated.'
      }`
    );
  }

  function renderSaveControls() {
    return (
      <div className="bank-details-actions">
        <button
          type="button"
          className={
            saveMessage
              ? 'bank-save-button bank-save-button-saved'
              : 'bank-save-button'
          }
          onClick={saveCurrentBankingSettings}
          disabled={isLoading || isSaving}
        >
          {isSaving
            ? 'Saving...'
            : saveMessage
              ? 'Changes Saved'
              : 'Save Changes'}
        </button>

        {hasUnsavedChanges && (
          <span className="bank-unsaved-message">
            Save Changes
          </span>
        )}

        {saveError && (
          <span className="bank-error-message">
            {saveError}
          </span>
        )}
      </div>
    );
  }

  function renderFiscalSetupPanel() {
    return (
      <>
        <div className="bank-details-title">
          BALANCE SHEET START UP PROGRAMMING
        </div>

        <div className="bank-details-grid">
          <label htmlFor="openingRetainedEarnings">
            Opening Retained Earnings
          </label>
          <input
            id="openingRetainedEarnings"
            name="openingRetainedEarnings"
            type="text"
            inputMode="decimal"
            value={fiscalData.openingRetainedEarnings}
            onChange={changeFiscalField}
            style={{ width: '150px' }}
          />

          <label htmlFor="endingRetainedEarnings">
            Ending Retained Earnings
          </label>
          <input
            id="endingRetainedEarnings"
            name="endingRetainedEarnings"
            type="text"
            inputMode="decimal"
            value={fiscalData.endingRetainedEarnings}
            onChange={changeFiscalField}
            style={{ width: '150px' }}
          />

          <label htmlFor="currentFiscalYearIncome">
            Current Fiscal Year Income
          </label>
          <input
            id="currentFiscalYearIncome"
            name="currentFiscalYearIncome"
            type="text"
            inputMode="decimal"
            value={fiscalData.currentFiscalYearIncome}
            onChange={changeFiscalField}
            style={{ width: '150px' }}
          />

          <label htmlFor="accountsReceivable">
            Accounts Receivable
          </label>
          <input
            id="accountsReceivable"
            name="accountsReceivable"
            type="text"
            inputMode="decimal"
            value={fiscalData.accountsReceivable}
            onChange={changeFiscalField}
            style={{ width: '150px' }}
          />

          <label htmlFor="accountsPayable">
            Accounts Payable
          </label>
          <input
            id="accountsPayable"
            name="accountsPayable"
            type="text"
            inputMode="decimal"
            value={fiscalData.accountsPayable}
            onChange={changeFiscalField}
            style={{ width: '150px' }}
          />

          <label htmlFor="interestEarned">
            Interest Earned
          </label>
          <input
            id="interestEarned"
            name="interestEarned"
            type="text"
            inputMode="decimal"
            value={fiscalData.interestEarned}
            onChange={changeFiscalField}
            style={{ width: '150px' }}
          />

          <label htmlFor="previousYearsEndingIncome">
            Previous Years Ending Income
          </label>
          <input
            id="previousYearsEndingIncome"
            name="previousYearsEndingIncome"
            type="text"
            inputMode="decimal"
            value={fiscalData.previousYearsEndingIncome}
            onChange={changeFiscalField}
            style={{ width: '150px' }}
          />

          <label htmlFor="miscAssetEntry">
            Misc. Asset Entry
          </label>
          <input
            id="miscAssetEntry"
            name="miscAssetEntry"
            type="text"
            inputMode="decimal"
            value={fiscalData.miscAssetEntry}
            onChange={changeFiscalField}
            style={{ width: '150px' }}
          />

          <label htmlFor="miscLiabilityEntry">
            Misc. Liability Entry
          </label>
          <input
            id="miscLiabilityEntry"
            name="miscLiabilityEntry"
            type="text"
            inputMode="decimal"
            value={fiscalData.miscLiabilityEntry}
            onChange={changeFiscalField}
            style={{ width: '150px' }}
          />

          <label htmlFor="fiscalNotes">
            Notes
          </label>
          <textarea
            id="fiscalNotes"
            name="notes"
            value={fiscalData.notes}
            onChange={changeFiscalField}
            style={{
              width: '520px',
              height: '120px',
              overflowY: 'auto',
              resize: 'none'
            }}
          />
        </div>

        {renderSaveControls()}
      </>
    );
  }

  function renderBankAccountPanel() {
    if (!selectedBank) {
      return null;
    }

    const coMingledOptions = bankRows.filter(
      (row) =>
        row.id !== selectedBank.id &&
        row.active === 'Y'
    );

    return (
      <>
        <div className="bank-details-title">
          BANK ACCOUNT PROGRAMMING
        </div>

        <div className="bank-details-grid">
          <label htmlFor="bankType">Bank Type</label>
          <input
            id="bankType"
            name="bankType"
            type="text"
            value={selectedBank.bankType}
            readOnly
            style={{ width: '170px' }}
          />

          <label htmlFor="bankName">Bank Name</label>
          <input
            id="bankName"
            name="bankName"
            type="text"
            value={selectedBank.bankName}
            readOnly
            style={{ width: '320px' }}
          />

          <label htmlFor="bankId">Bank ID#</label>
          <input
            id="bankId"
            name="bankId"
            type="text"
            inputMode="numeric"
            value={selectedBank.bankId}
            readOnly
            style={{ width: '60px' }}
          />

          <label htmlFor="checkMode">Check Mode</label>
          <select
            id="checkMode"
            name="checkMode"
            value={selectedBank.checkMode}
            onChange={changeBankField}
            style={{ width: '100px' }}
          >
            <option value="System">System</option>
            <option value="Manual">Manual</option>
            <option value="None">None</option>
          </select>

          <label htmlFor="startCheck">Start Check#</label>
          <input
            id="startCheck"
            name="startCheck"
            type="text"
            inputMode="numeric"
            value={selectedBank.startCheck}
            onChange={changeBankField}
            style={{ width: '60px' }}
          />

          <label htmlFor="glCashAccount">
            GL Cash Account
          </label>
          <input
            id="glCashAccount"
            name="glCashAccount"
            type="text"
            inputMode="numeric"
            value={selectedBank.glCashAccount}
            onChange={changeBankField}
            style={{ width: '100px' }}
          />

          <label htmlFor="accountNumber">Account #</label>
          <input
            id="accountNumber"
            name="accountNumber"
            type="text"
            inputMode="numeric"
            value={selectedBank.accountNumber}
            onChange={changeBankField}
            style={{ width: '120px' }}
          />

          <label htmlFor="routingNumber">
            Routing Number
          </label>
          <input
            id="routingNumber"
            name="routingNumber"
            type="text"
            inputMode="numeric"
            maxLength={9}
            value={selectedBank.routingNumber}
            onChange={changeBankField}
            style={{ width: '150px' }}
          />

          <label htmlFor="startingBalance">
            Starting Balance
          </label>
          <input
            id="startingBalance"
            name="startingBalance"
            type="text"
            inputMode="decimal"
            value={selectedBank.startingBalance}
            onChange={changeBankField}
            style={{ width: '150px' }}
          />

          <label htmlFor="startingMonth">
            Starting Month
          </label>
          <select
            id="startingMonth"
            name="startingMonth"
            value={selectedBank.startingMonth}
            onChange={changeBankField}
            style={{ width: '150px' }}
          >
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <label htmlFor="contactPerson">
            Contact Person
          </label>
          <input
            id="contactPerson"
            name="contactPerson"
            type="text"
            value={selectedBank.contactPerson}
            onChange={changeBankField}
            style={{ width: '150px' }}
          />

          <label htmlFor="contactTel">Contact Tel#</label>
          <input
            id="contactTel"
            name="contactTel"
            type="tel"
            inputMode="tel"
            value={selectedBank.contactTel}
            onChange={changeBankField}
            style={{ width: '100px' }}
          />

          <label htmlFor="contactEmail">
            Contact E-Mail
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            inputMode="email"
            value={selectedBank.contactEmail}
            onChange={changeBankField}
            style={{ width: '150px' }}
          />

          <label htmlFor="active">Active</label>
          <input
            id="active"
            name="active"
            type="text"
            value={selectedBank.active}
            readOnly
            style={{ width: '40px' }}
          />

          {selectedBank.bankType === 'Escrow' && (
            <>
              <label htmlFor="coMingled">
                Co-Mingled
              </label>
              <select
                id="coMingled"
                name="coMingled"
                value={selectedBank.coMingled}
                onChange={changeBankField}
                style={{ width: '60px' }}
              >
                <option value="N">N</option>
                <option value="Y">Y</option>
              </select>

              <label htmlFor="coMingledWith">
                Co-Mingled With
              </label>
              <select
                id="coMingledWith"
                name="coMingledWith"
                value={selectedBank.coMingledWith}
                onChange={changeBankField}
                disabled={selectedBank.coMingled !== 'Y'}
                style={{ width: '260px' }}
              >
                <option value=""></option>

                {coMingledOptions.map((row) => {
                  const description =
                    `${row.bankType} - ` +
                    `${row.bankName} - ` +
                    `${row.bankId}`;

                  return (
                    <option
                      key={row.id}
                      value={description}
                    >
                      {description}
                    </option>
                  );
                })}
              </select>
            </>
          )}

          <label htmlFor="bankNotes">Notes</label>
          <textarea
            id="bankNotes"
            name="notes"
            value={selectedBank.notes}
            onChange={changeBankField}
            style={{
              width: '520px',
              height: '120px',
              overflowY: 'auto',
              resize: 'none'
            }}
          />
        </div>

        {renderSaveControls()}
      </>
    );
  }

  const deactivateText =
    selectedBank?.active === 'N'
      ? 'Reactivate'
      : 'Deactivate';

  return (
    <div className="settings-bank-wrap">
      <div className="settings-bank-left">
        <div className="bank-header-row">
          <div className="bank-title">
            BANKING / FISCAL YEAR SETUP
          </div>

          <div className="bank-actions">
            <button
              type="button"
              onClick={handleAddAccount}
            >
              Add Account
            </button>

            <button
              type="button"
              onClick={handleEditAccount}
              disabled={isFiscalSetup}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleDeactivateAccount}
              disabled={isFiscalSetup}
            >
              {deactivateText}
            </button>
          </div>
        </div>

        <div className="bank-grid">
          <div className="bank-grid-head">
            <div>Programming Type</div>
            <div>Description</div>
            <div>Bank ID#</div>
            <div>Active</div>
          </div>

          <div
            className={
              isFiscalSetup
                ? 'bank-grid-row selected'
                : 'bank-grid-row'
            }
            onClick={() =>
              requestRowSelection('fiscal-setup')
            }
          >
            <div>Fiscal Setup</div>
            <div>
              Balance Sheet Start Up Programming
            </div>
            <div>----</div>
            <div>----</div>
          </div>

          {bankRows.map((row) => (
            <div
              key={row.id}
              className={
                selectedRowId === row.id
                  ? 'bank-grid-row selected'
                  : 'bank-grid-row'
              }
              onClick={() =>
                requestRowSelection(row.id)
              }
            >
              <div>{row.bankType}</div>
              <div>{row.bankName}</div>
              <div>{row.bankId}</div>
              <div>{row.active}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-bank-right">
        {isFiscalSetup
          ? renderFiscalSetupPanel()
          : renderBankAccountPanel()}
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

export default Banking;

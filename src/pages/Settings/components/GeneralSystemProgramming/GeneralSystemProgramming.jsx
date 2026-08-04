import { useEffect, useState } from 'react';

import './GeneralSystemProgramming.css';

import {
  loadGeneralSystemSettings,
  saveGeneralSystemSettings
} from '../../services/generalSystemService';

import UnsavedChangesPrompt
  from '../UnsavedChangesPrompt/UnsavedChangesPrompt';

const DEFAULT_DATA = {
  printing: {
    printingMode: 'Local',
    printerName: '',
    webPrinterId: '',
    networkAddress: '',
    notes: ''
  },
  numbering: {
    residentStartingAcct: '',
    vendorStartingAcct: '',
    notes: ''
  },
  streetNames: {
    streetNames: '',
    defaultCity: '',
    defaultState: '',
    defaultZip: '',
    notes: ''
  },
  webPlus: {
    webPlusActive: 'N',
    webPageIpName: '',
    webPageManager: '',
    webManagerContact: '',
    notes: ''
  },
  cfoManage: {
    cfoActive: 'N',
    cfoCompanyName: '',
    cfoAddress: '',
    cfoTel: '',
    cfoRepName: '',
    cfoRepTel: '',
    cfoRepEmail: '',
    cfoVendorId: '',
    notes: ''
  },
  easyPay: {
    easyPayActive: 'N',
    finesPaidFirst: 'N',
    residentPaysCharges: 'N',
    achActive: 'N',
    notes: ''
  },
  estoppel: {
    residentEstoppelFee: '300.00',
    letterCode: '99',
    paidDirectlyToMgtCo: 'NO',
    payableToHoaSentToMgt: 'NO',
    transferWorkingCapitalFee: '63.00',
    notes: ''
  }
};

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

function stateCodeOnly(value) {
  return value
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 2);
}

function GeneralSystemProgramming({
  requestedSettingsPanel,
  onSettingsNavigationApproved,
  onSettingsNavigationCancelled
}) {
  const [activeSection, setActiveSection] =
    useState('printing');

  const [settingsData, setSettingsData] =
    useState(DEFAULT_DATA);

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

  useEffect(() => {
    let componentIsActive = true;

    async function loadSavedData() {
      try {
        const savedData =
          await loadGeneralSystemSettings();

        if (!componentIsActive || !savedData) {
          return;
        }

        setSettingsData({
          printing: {
            ...DEFAULT_DATA.printing,
            ...(savedData.printing || {})
          },
          numbering: {
            ...DEFAULT_DATA.numbering,
            ...(savedData.numbering || {})
          },
          streetNames: {
            ...DEFAULT_DATA.streetNames,
            ...(savedData.streetNames || {})
          },
          webPlus: {
            ...DEFAULT_DATA.webPlus,
            ...(savedData.webPlus || {})
          },
          cfoManage: {
            ...DEFAULT_DATA.cfoManage,
            ...(savedData.cfoManage || {})
          },
          easyPay: {
            ...DEFAULT_DATA.easyPay,
            ...(savedData.easyPay || {})
          },
          estoppel: {
            ...DEFAULT_DATA.estoppel,
            ...(savedData.estoppel || {})
          }
        });

        if (savedData.activeSection) {
          setActiveSection(savedData.activeSection);
        }
      } catch (error) {
        console.error(error);

        if (componentIsActive) {
          setSaveError(
            'The saved General System settings could not be loaded.'
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

  function sectionKey(sectionName) {
    const map = {
      printing: 'printing',
      numbering: 'numbering',
      'street-names': 'streetNames',
      'web-plus': 'webPlus',
      'cfo-manage': 'cfoManage',
      'easy-pay': 'easyPay',
      estoppel: 'estoppel'
    };

    return map[sectionName];
  }

  function updateSectionField(
    sectionName,
    fieldName,
    value
  ) {
    const key = sectionKey(sectionName);

    setSettingsData((currentData) => ({
      ...currentData,
      [key]: {
        ...currentData[key],
        [fieldName]: value
      }
    }));

    markChanged();
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;

    let nextValue = value;

    if (
      activeSection === 'numbering' &&
      ['residentStartingAcct', 'vendorStartingAcct']
        .includes(name)
    ) {
      nextValue = digitsOnly(value);
    }

    if (
      activeSection === 'street-names' &&
      name === 'defaultState'
    ) {
      nextValue = stateCodeOnly(value);
    }

    if (
      activeSection === 'street-names' &&
      name === 'defaultZip'
    ) {
      nextValue = digitsOnly(value).slice(0, 9);
    }

    if (
      activeSection === 'cfo-manage' &&
      ['cfoTel', 'cfoRepTel'].includes(name)
    ) {
      nextValue = telephoneOnly(value);
    }

    if (
      activeSection === 'estoppel' &&
      [
        'residentEstoppelFee',
        'transferWorkingCapitalFee'
      ].includes(name)
    ) {
      nextValue = decimalOnly(value);
    }

    updateSectionField(
      activeSection,
      name,
      nextValue
    );
  }

  function buildCompleteData() {
    return {
      ...settingsData,
      activeSection
    };
  }

  async function saveCurrentSettings() {
    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');

    try {
      await saveGeneralSystemSettings(
        buildCompleteData()
      );

      setHasUnsavedChanges(false);
      setSaveMessage('Changes saved.');

      return true;
    } catch (error) {
      console.error(error);

      setSaveError(
        error.message ||
        'Unable to save General System settings.'
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function restoreLastSavedData() {
    const savedData =
      await loadGeneralSystemSettings();

    if (!savedData) {
      setSettingsData(DEFAULT_DATA);
      setActiveSection('printing');
      return;
    }

    setSettingsData({
      printing: {
        ...DEFAULT_DATA.printing,
        ...(savedData.printing || {})
      },
      numbering: {
        ...DEFAULT_DATA.numbering,
        ...(savedData.numbering || {})
      },
      streetNames: {
        ...DEFAULT_DATA.streetNames,
        ...(savedData.streetNames || {})
      },
      webPlus: {
        ...DEFAULT_DATA.webPlus,
        ...(savedData.webPlus || {})
      },
      cfoManage: {
        ...DEFAULT_DATA.cfoManage,
        ...(savedData.cfoManage || {})
      },
      easyPay: {
        ...DEFAULT_DATA.easyPay,
        ...(savedData.easyPay || {})
      },
      estoppel: {
        ...DEFAULT_DATA.estoppel,
        ...(savedData.estoppel || {})
      }
    });

    setActiveSection(
      savedData.activeSection || 'printing'
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
        'The last saved General System settings could not be restored.'
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
      <div className="gsp-details-actions">
        <button
          type="button"
          className={
            saveMessage
              ? 'gsp-save-button gsp-save-button-saved'
              : 'gsp-save-button'
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
          <span className="gsp-unsaved-message">
            Save Changes
          </span>
        )}

        {saveError && (
          <span className="gsp-error-message">
            {saveError}
          </span>
        )}
      </div>
    );
  }

  function renderPrintingPanel() {
    const data = settingsData.printing;

    return (
      <>
        <div className="gsp-details-title">
          LOCAL / REMOTE PRINTING
        </div>

        <div className="gsp-details-grid">
          <label htmlFor="printingMode">
            Printing Mode
          </label>
          <select
            id="printingMode"
            name="printingMode"
            value={data.printingMode}
            onChange={handleFieldChange}
            style={{ width: '160px' }}
          >
            <option value="Local">Local</option>
            <option value="Remote">Remote</option>
          </select>

          <label htmlFor="printerName">
            Printer Name
          </label>
          <input
            id="printerName"
            name="printerName"
            type="text"
            value={data.printerName}
            onChange={handleFieldChange}
            style={{ width: '260px' }}
          />

          <label htmlFor="webPrinterId">
            Web Printer ID#
          </label>
          <input
            id="webPrinterId"
            name="webPrinterId"
            type="text"
            value={data.webPrinterId}
            onChange={handleFieldChange}
            style={{ width: '160px' }}
          />

          <label htmlFor="networkAddress">
            WiFi / Network Address
          </label>
          <input
            id="networkAddress"
            name="networkAddress"
            type="text"
            value={data.networkAddress}
            onChange={handleFieldChange}
            style={{ width: '260px' }}
          />

          <label htmlFor="printingNotes">
            Notes
          </label>
          <textarea
            id="printingNotes"
            name="notes"
            value={data.notes}
            onChange={handleFieldChange}
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

  function renderNumberingPanel() {
    const data = settingsData.numbering;

    return (
      <>
        <div className="gsp-details-title">
          RESIDENT &amp; VENDOR NUMBERING
        </div>

        <div className="gsp-details-grid">
          <label htmlFor="residentStartingAcct">
            Resident Starting Acct#
          </label>
          <input
            id="residentStartingAcct"
            name="residentStartingAcct"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={data.residentStartingAcct}
            onChange={handleFieldChange}
            style={{ width: '100px' }}
          />

          <label htmlFor="vendorStartingAcct">
            Vendor Starting Acct#
          </label>
          <input
            id="vendorStartingAcct"
            name="vendorStartingAcct"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={data.vendorStartingAcct}
            onChange={handleFieldChange}
            style={{ width: '80px' }}
          />

          <label htmlFor="numberingNotes">
            Notes
          </label>
          <textarea
            id="numberingNotes"
            name="notes"
            value={data.notes}
            onChange={handleFieldChange}
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

  function renderStreetNamesPanel() {
    const data = settingsData.streetNames;

    return (
      <>
        <div className="gsp-details-title">
          STREET NAMES
        </div>

        <div className="gsp-details-grid">
          <label htmlFor="streetNames">
            Street Names List
          </label>
          <textarea
            id="streetNames"
            name="streetNames"
            value={data.streetNames}
            onChange={handleFieldChange}
            style={{
              width: '420px',
              height: '150px',
              overflowY: 'auto',
              resize: 'none'
            }}
          />

          <label htmlFor="defaultCity">
            Default City
          </label>
          <input
            id="defaultCity"
            name="defaultCity"
            type="text"
            value={data.defaultCity}
            onChange={handleFieldChange}
            style={{ width: '180px' }}
          />

          <label htmlFor="defaultState">
            Default State
          </label>
          <input
            id="defaultState"
            name="defaultState"
            type="text"
            maxLength={2}
            value={data.defaultState}
            onChange={handleFieldChange}
            style={{ width: '60px' }}
          />

          <label htmlFor="defaultZip">
            Default Zip
          </label>
          <input
            id="defaultZip"
            name="defaultZip"
            type="text"
            inputMode="numeric"
            maxLength={9}
            value={data.defaultZip}
            onChange={handleFieldChange}
            style={{ width: '100px' }}
          />

          <label htmlFor="streetNotes">
            Notes
          </label>
          <textarea
            id="streetNotes"
            name="notes"
            value={data.notes}
            onChange={handleFieldChange}
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

  function renderWebPlusPanel() {
    const data = settingsData.webPlus;

    return (
      <>
        <div className="gsp-details-title">
          WEB+ CONFIGURATION
        </div>

        <div className="gsp-details-grid">
          <label htmlFor="webPlusActive">
            WEB+ Active
          </label>
          <select
            id="webPlusActive"
            name="webPlusActive"
            value={data.webPlusActive}
            onChange={handleFieldChange}
            style={{ width: '60px' }}
          >
            <option value="N">N</option>
            <option value="Y">Y</option>
          </select>

          <label htmlFor="webPageIpName">
            WEB Page IP / Name
          </label>
          <input
            id="webPageIpName"
            name="webPageIpName"
            type="text"
            value={data.webPageIpName}
            onChange={handleFieldChange}
            style={{ width: '320px' }}
          />

          <label htmlFor="webPageManager">
            WEB Page Manager
          </label>
          <input
            id="webPageManager"
            name="webPageManager"
            type="text"
            value={data.webPageManager}
            onChange={handleFieldChange}
            style={{ width: '220px' }}
          />

          <label htmlFor="webManagerContact">
            Manager Contact Info
          </label>
          <input
            id="webManagerContact"
            name="webManagerContact"
            type="text"
            value={data.webManagerContact}
            onChange={handleFieldChange}
            style={{ width: '320px' }}
          />

          <label htmlFor="webPlusNotes">
            Notes
          </label>
          <textarea
            id="webPlusNotes"
            name="notes"
            value={data.notes}
            onChange={handleFieldChange}
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

  function renderCFOManagePanel() {
    const data = settingsData.cfoManage;

    return (
      <>
        <div className="gsp-details-title">
          CFO MANAGE CONFIGURATION
        </div>

        <div className="gsp-details-grid">
          <label htmlFor="cfoActive">
            CFO Manage Active
          </label>
          <select
            id="cfoActive"
            name="cfoActive"
            value={data.cfoActive}
            onChange={handleFieldChange}
            style={{ width: '60px' }}
          >
            <option value="N">N</option>
            <option value="Y">Y</option>
          </select>

          <label htmlFor="cfoCompanyName">
            CFO Company Name
          </label>
          <input
            id="cfoCompanyName"
            name="cfoCompanyName"
            type="text"
            value={data.cfoCompanyName}
            onChange={handleFieldChange}
            style={{ width: '320px' }}
          />

          <label htmlFor="cfoAddress">
            CFO Co. Address
          </label>
          <input
            id="cfoAddress"
            name="cfoAddress"
            type="text"
            value={data.cfoAddress}
            onChange={handleFieldChange}
            style={{ width: '420px' }}
          />

          <label htmlFor="cfoTel">
            CFO Co. Tel#
          </label>
          <input
            id="cfoTel"
            name="cfoTel"
            type="tel"
            inputMode="tel"
            value={data.cfoTel}
            onChange={handleFieldChange}
            style={{ width: '140px' }}
          />

          <label htmlFor="cfoRepName">
            CFO Rep. Name
          </label>
          <input
            id="cfoRepName"
            name="cfoRepName"
            type="text"
            value={data.cfoRepName}
            onChange={handleFieldChange}
            style={{ width: '220px' }}
          />

          <label htmlFor="cfoRepTel">
            CFO Rep. Tel#
          </label>
          <input
            id="cfoRepTel"
            name="cfoRepTel"
            type="tel"
            inputMode="tel"
            value={data.cfoRepTel}
            onChange={handleFieldChange}
            style={{ width: '140px' }}
          />

          <label htmlFor="cfoRepEmail">
            CFO Rep. E-Mail
          </label>
          <input
            id="cfoRepEmail"
            name="cfoRepEmail"
            type="email"
            inputMode="email"
            value={data.cfoRepEmail}
            onChange={handleFieldChange}
            style={{ width: '260px' }}
          />

          <label htmlFor="cfoVendorId">
            CFO Co. Vendor ID#
          </label>
          <input
            id="cfoVendorId"
            name="cfoVendorId"
            type="text"
            value={data.cfoVendorId}
            onChange={handleFieldChange}
            style={{ width: '100px' }}
          />

          <label htmlFor="cfoNotes">
            Notes
          </label>
          <textarea
            id="cfoNotes"
            name="notes"
            value={data.notes}
            onChange={handleFieldChange}
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

  function renderEasyPayPanel() {
    const data = settingsData.easyPay;

    return (
      <>
        <div className="gsp-details-title">
          EASYPAY CONFIGURATION
        </div>

        <div className="gsp-details-grid">
          <label htmlFor="easyPayActive">
            EasyPay Active
          </label>
          <select
            id="easyPayActive"
            name="easyPayActive"
            value={data.easyPayActive}
            onChange={handleFieldChange}
            style={{ width: '60px' }}
          >
            <option value="N">N</option>
            <option value="Y">Y</option>
          </select>

          <label htmlFor="finesPaidFirst">
            Fines Paid First
          </label>
          <select
            id="finesPaidFirst"
            name="finesPaidFirst"
            value={data.finesPaidFirst}
            onChange={handleFieldChange}
            style={{ width: '60px' }}
          >
            <option value="N">N</option>
            <option value="Y">Y</option>
          </select>

          <label htmlFor="residentPaysCharges">
            Resident Pays Charges
          </label>
          <select
            id="residentPaysCharges"
            name="residentPaysCharges"
            value={data.residentPaysCharges}
            onChange={handleFieldChange}
            style={{ width: '60px' }}
          >
            <option value="N">N</option>
            <option value="Y">Y</option>
          </select>

          <label htmlFor="achActive">
            ACH
          </label>
          <select
            id="achActive"
            name="achActive"
            value={data.achActive}
            onChange={handleFieldChange}
            style={{ width: '60px' }}
          >
            <option value="N">N</option>
            <option value="Y">Y</option>
          </select>

          <label htmlFor="easyPayNotes">
            Notes
          </label>
          <textarea
            id="easyPayNotes"
            name="notes"
            value={data.notes}
            onChange={handleFieldChange}
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

  function renderEstoppelPanel() {
    const data = settingsData.estoppel;

    return (
      <>
        <div className="gsp-details-title">
          ESTOPPEL LETTER PROGRAMMING
        </div>

        <div className="gsp-details-grid">
          <label htmlFor="residentEstoppelFee">
            Resident Estoppel Fee
          </label>
          <input
            id="residentEstoppelFee"
            name="residentEstoppelFee"
            type="text"
            inputMode="decimal"
            value={data.residentEstoppelFee}
            onChange={handleFieldChange}
            style={{ width: '120px' }}
          />

          <label htmlFor="letterCode">
            Letter Code
          </label>
          <input
            id="letterCode"
            name="letterCode"
            type="text"
            value={data.letterCode}
            onChange={handleFieldChange}
            style={{ width: '60px' }}
          />

          <label htmlFor="paidDirectlyToMgtCo">
            Paid Directly to Mgt Co?
          </label>
          <select
            id="paidDirectlyToMgtCo"
            name="paidDirectlyToMgtCo"
            value={data.paidDirectlyToMgtCo}
            onChange={handleFieldChange}
            style={{ width: '70px' }}
          >
            <option value="NO">NO</option>
            <option value="YES">YES</option>
          </select>

          <label htmlFor="payableToHoaSentToMgt">
            Payable to HOA / Sent to Mgt?
          </label>
          <select
            id="payableToHoaSentToMgt"
            name="payableToHoaSentToMgt"
            value={data.payableToHoaSentToMgt}
            onChange={handleFieldChange}
            style={{ width: '70px' }}
          >
            <option value="NO">NO</option>
            <option value="YES">YES</option>
          </select>

          <label htmlFor="transferWorkingCapitalFee">
            Transfer / Working Capital Fee
          </label>
          <input
            id="transferWorkingCapitalFee"
            name="transferWorkingCapitalFee"
            type="text"
            inputMode="decimal"
            value={data.transferWorkingCapitalFee}
            onChange={handleFieldChange}
            style={{ width: '120px' }}
          />

          <label htmlFor="estoppelNotes">
            Notes
          </label>
          <textarea
            id="estoppelNotes"
            name="notes"
            value={data.notes}
            onChange={handleFieldChange}
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

  function renderRightPanel() {
    if (activeSection === 'numbering') {
      return renderNumberingPanel();
    }

    if (activeSection === 'street-names') {
      return renderStreetNamesPanel();
    }

    if (activeSection === 'web-plus') {
      return renderWebPlusPanel();
    }

    if (activeSection === 'cfo-manage') {
      return renderCFOManagePanel();
    }

    if (activeSection === 'easy-pay') {
      return renderEasyPayPanel();
    }

    if (activeSection === 'estoppel') {
      return renderEstoppelPanel();
    }

    return renderPrintingPanel();
  }

  const rows = [
    ['printing', 'Printing', 'Local / Remote Printing'],
    ['numbering', 'Numbering', 'Resident & Vendor Numbering'],
    [
      'street-names',
      'Street Names',
      'HOA Street Names / Default Address Info'
    ],
    ['web-plus', 'WEB+', 'WEB+ Configuration'],
    [
      'cfo-manage',
      'CFO Manage',
      'CFO Manage Configuration'
    ],
    ['easy-pay', 'EasyPay', 'EasyPay Configuration'],
    [
      'estoppel',
      'Estoppel',
      'Estoppel Letter Programming'
    ]
  ];

  return (
    <div className="settings-gsp-wrap">
      <div className="settings-gsp-left">
        <div className="gsp-header-row">
          <div className="gsp-title">
            GENERAL SYSTEM PROGRAMMING
          </div>
        </div>

        <div className="gsp-grid">
          <div className="gsp-grid-head">
            <div>Programming Type</div>
            <div>Description</div>
          </div>

          {rows.map(([key, title, description]) => (
            <div
              key={key}
              className={
                activeSection === key
                  ? 'gsp-grid-row selected'
                  : 'gsp-grid-row'
              }
              onClick={() => requestSection(key)}
            >
              <div>{title}</div>
              <div>{description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-gsp-right">
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

export default GeneralSystemProgramming;

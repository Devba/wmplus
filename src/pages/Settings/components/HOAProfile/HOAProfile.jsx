


import { useEffect, useState } from 'react';

import './HOAProfile.css';

import {
  loadHOAProfile,
  saveHOAProfile
} from '../../services/hoaProfileService';

import UnsavedChangesPrompt
  from '../UnsavedChangesPrompt/UnsavedChangesPrompt';

function telephoneOnly(value) {
  return value.replace(/[^0-9()+\-\s.]/g, '');
}




function HOAProfile({
  requestedSettingsPanel,
  onSettingsNavigationApproved,
  onSettingsNavigationCancelled
}) {
  const [activeSection, setActiveSection] = useState('hoa-profile');
  const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [saveError, setSaveError] = useState('');
    const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
    const [pendingSection, setPendingSection] = useState('');
    const [pendingDestinationType, setPendingDestinationType] = useState('');

  
    const [hoaProfileData, setHoaProfileData] = useState({
    hoaCorporateName: '',
    hoaBillingName: '',
    hoaLetterName: '',
    hoaAddress: '',
    hoaEmail: '',
    hoaContactName: '',
    hoaContactTel: '',
    hoaNotes: ''
  });

  const [clientInfoData, setClientInfoData] = useState({
    clientId: '',
    licenseNumber: '',
    licenseStatus: '',
    subscriptionRenewalDate: '',
    licenseType: '',
    licenseSize: '',
    clientNotes: ''
  });

  const [managementData, setManagementData] = useState({
    selfManaged: 'N',
    mgtCoName: '',
    mgtCoAddress: '',
    mgtCoContactName: '',
    mgtCoContactTel: '',
    mgtCoContactEmail: '',
    clientRepresentative: '',
    repTel: '',
    repEmail: '',
    mgtCoLetterEmail: '',
    mgtCoLetterTel: '',
    managementNotes: ''
  });


useEffect(() => {
  let componentIsActive = true;

  async function loadSavedData() {
    try {
      const savedData = await loadHOAProfile();

      if (!componentIsActive || !savedData) {
        return;
      }

      if (savedData.hoaProfile) {
        setHoaProfileData((currentData) => ({
          ...currentData,
          ...savedData.hoaProfile
        }));
      }

      if (savedData.clientInfo) {
        setClientInfoData((currentData) => ({
          ...currentData,
          ...savedData.clientInfo
        }));
      }

      if (savedData.management) {
        setManagementData((currentData) => ({
          ...currentData,
          ...savedData.management
        }));
      }
    } catch (error) {
      console.error(error);

      if (componentIsActive) {
        setSaveError(
          'The saved HOA Profile could not be loaded.'
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
    setPendingSection(requestedSettingsPanel);
    setShowUnsavedPrompt(true);
    return;
  }

  onSettingsNavigationApproved(requestedSettingsPanel);
}, [
  requestedSettingsPanel,
  hasUnsavedChanges,
  onSettingsNavigationApproved
]);

  function selectSection(sectionName) {
  if (sectionName === activeSection) {
    return;
  }

  if (hasUnsavedChanges) {
    setPendingDestinationType('section');
    setPendingSection(sectionName);
    setShowUnsavedPrompt(true);
    return;
  }

  setActiveSection(sectionName);
}

function markFormChanged() {
  setHasUnsavedChanges(true);
  setSaveMessage('');
  setSaveError('');
}




  function changeHOAProfileField(event) {
  const { name, value } = event.target;

  const nextValue =
    name === 'hoaContactTel'
      ? telephoneOnly(value)
      : value;

  setHoaProfileData((currentData) => ({
    ...currentData,
    [name]: nextValue
  }));

  markFormChanged();
}



  function changeClientInfoField(event) {
  const { name, value } = event.target;

  setClientInfoData((currentData) => ({
    ...currentData,
    [name]: value
    }));

    markFormChanged();
    }

  function changeManagementField(event) {
  const { name, value } = event.target;

  const telephoneFields = [
    'mgtCoContactTel',
    'repTel',
    'mgtCoLetterTel'
  ];

  const nextValue = telephoneFields.includes(name)
    ? telephoneOnly(value)
    : value;

  setManagementData((currentData) => ({
    ...currentData,
    [name]: nextValue
  }));

  markFormChanged();
}

function buildCompleteHOAProfileData() {
  return {
    hoaProfile: hoaProfileData,
    clientInfo: clientInfoData,
    management: managementData
  };
}

async function saveCurrentHOAProfile() {
  setIsSaving(true);
  setSaveMessage('');
  setSaveError('');

  try {
    await saveHOAProfile(
      buildCompleteHOAProfileData()
    );

    setHasUnsavedChanges(false);
    setSaveMessage('Changes saved.');

    return true;
  } catch (error) {
    console.error(error);

    setSaveError(
      error.message || 'Unable to save HOA Profile.'
    );

    return false;
  } finally {
    setIsSaving(false);
  }
}

async function handleSaveChanges() {
  await saveCurrentHOAProfile();
}

function completePendingNavigation() {
  if (pendingDestinationType === 'settings-panel') {
    onSettingsNavigationApproved(pendingSection);
  } else {
    setActiveSection(pendingSection);
  }

  setPendingDestinationType('');
  setPendingSection('');
  setShowUnsavedPrompt(false);
}

async function handlePromptYes() {
  const saveSucceeded =
    await saveCurrentHOAProfile();

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
    const savedData = await loadHOAProfile();

    setHoaProfileData({
      hoaCorporateName:
        savedData?.hoaProfile?.hoaCorporateName || '',
      hoaBillingName:
        savedData?.hoaProfile?.hoaBillingName || '',
      hoaLetterName:
        savedData?.hoaProfile?.hoaLetterName || '',
      hoaAddress:
        savedData?.hoaProfile?.hoaAddress || '',
      hoaEmail:
        savedData?.hoaProfile?.hoaEmail || '',
      hoaContactName:
        savedData?.hoaProfile?.hoaContactName || '',
      hoaContactTel:
        savedData?.hoaProfile?.hoaContactTel || '',
      hoaNotes:
        savedData?.hoaProfile?.hoaNotes || ''
    });

    setClientInfoData({
      clientId:
        savedData?.clientInfo?.clientId || '',
      licenseNumber:
        savedData?.clientInfo?.licenseNumber || '',
      licenseStatus:
        savedData?.clientInfo?.licenseStatus || '',
      subscriptionRenewalDate:
        savedData?.clientInfo?.subscriptionRenewalDate || '',
      licenseType:
        savedData?.clientInfo?.licenseType || '',
      licenseSize:
        savedData?.clientInfo?.licenseSize || '',
      clientNotes:
        savedData?.clientInfo?.clientNotes || ''
    });

    setManagementData({
      selfManaged:
        savedData?.management?.selfManaged || 'N',
      mgtCoName:
        savedData?.management?.mgtCoName || '',
      mgtCoAddress:
        savedData?.management?.mgtCoAddress || '',
      mgtCoContactName:
        savedData?.management?.mgtCoContactName || '',
      mgtCoContactTel:
        savedData?.management?.mgtCoContactTel || '',
      mgtCoContactEmail:
        savedData?.management?.mgtCoContactEmail || '',
      clientRepresentative:
        savedData?.management?.clientRepresentative || '',
      repTel:
        savedData?.management?.repTel || '',
      repEmail:
        savedData?.management?.repEmail || '',
      mgtCoLetterEmail:
        savedData?.management?.mgtCoLetterEmail || '',
      mgtCoLetterTel:
        savedData?.management?.mgtCoLetterTel || '',
      managementNotes:
        savedData?.management?.managementNotes || ''
    });

    setHasUnsavedChanges(false);
    completePendingNavigation();
  } catch (error) {
    console.error(error);

    setSaveError(
      'The last saved HOA Profile could not be restored.'
    );
  } finally {
    setIsLoading(false);
  }
}

function handlePromptCancel() {
  const wasSettingsNavigation =
    pendingDestinationType === 'settings-panel';

  setPendingDestinationType('');
  setPendingSection('');
  setShowUnsavedPrompt(false);

  if (wasSettingsNavigation) {
    onSettingsNavigationCancelled();
  }
}







  function renderHOAProfilePanel() {
    return (
      <>
        <div className="hoa-details-title">
          HOA NAME &amp; ADDRESS
        </div>

        <div className="hoa-details-grid">

          <label htmlFor="hoaCorporateName">
            HOA Corporate Name
          </label>

          <input
            id="hoaCorporateName"
            name="hoaCorporateName"
            type="text"
            value={hoaProfileData.hoaCorporateName}
            onChange={changeHOAProfileField}
            style={{ width: '320px' }}
          />


          <label htmlFor="hoaBillingName">
            HOA Billing Name
          </label>

          <input
            id="hoaBillingName"
            name="hoaBillingName"
            type="text"
            value={hoaProfileData.hoaBillingName}
            onChange={changeHOAProfileField}
            style={{ width: '320px' }}
          />


          <label htmlFor="hoaLetterName">
            HOA Letter Name
          </label>

          <input
            id="hoaLetterName"
            name="hoaLetterName"
            type="text"
            value={hoaProfileData.hoaLetterName}
            onChange={changeHOAProfileField}
            style={{ width: '320px' }}
          />


          <label htmlFor="hoaAddress">
            HOA Address
          </label>

          <input
            id="hoaAddress"
            name="hoaAddress"
            type="text"
            value={hoaProfileData.hoaAddress}
            onChange={changeHOAProfileField}
            style={{ width: '420px' }}
          />


          <label htmlFor="hoaEmail">
            HOA E-Mail
          </label>

          <input
            id="hoaEmail"
            name="hoaEmail"
            type="email"
            inputMode="email"
            value={hoaProfileData.hoaEmail}
            onChange={changeHOAProfileField}
            style={{ width: '260px' }}
          />


          <label htmlFor="hoaContactName">
            Contact Name
          </label>

          <input
            id="hoaContactName"
            name="hoaContactName"
            type="text"
            value={hoaProfileData.hoaContactName}
            onChange={changeHOAProfileField}
            style={{ width: '220px' }}
          />


          <label htmlFor="hoaContactTel">
            Contact Tel#
          </label>

          <input
            id="hoaContactTel"
            name="hoaContactTel"
            type="tel"
            inputMode="tel"
            value={hoaProfileData.hoaContactTel}
            onChange={changeHOAProfileField}
            style={{ width: '140px' }}
          />


          <label htmlFor="hoaNotes">
            Notes
          </label>

          <textarea
            id="hoaNotes"
            name="hoaNotes"
            value={hoaProfileData.hoaNotes}
            onChange={changeHOAProfileField}
            style={{
              width: '520px',
              height: '120px',
              overflowY: 'auto',
              resize: 'none'
            }}
          />

        </div>

    <div className="hoa-details-actions">
  <button
    type="button"
    className={
      saveMessage
        ? 'hoa-save-button hoa-save-button-saved'
        : 'hoa-save-button'
    }
    onClick={handleSaveChanges}
    disabled={isLoading || isSaving}
  >
    {isSaving
      ? 'Saving...'
      : saveMessage
        ? 'Changes Saved'
        : 'Save Changes'}
  </button>

  {hasUnsavedChanges && (
    <span className="hoa-unsaved-message">
      Save Changes
    </span>
  )}

  {saveError && (
    <span className="hoa-error-message">
      {saveError}
    </span>
  )}
</div>
      </>
    );
  }

  function renderClientInfoPanel() {
    return (
      <>
        <div className="hoa-details-title">
          MANAGE+ CLIENT INFORMATION
        </div>

        <div className="hoa-details-grid">

          <label htmlFor="clientId">
            Client ID#
          </label>

          <input
            id="clientId"
            name="clientId"
            type="text"
            inputMode="numeric"
            value={clientInfoData.clientId}
            onChange={changeClientInfoField}
            style={{ width: '100px' }}
          />


          <label htmlFor="licenseNumber">
            License #
          </label>

          <input
            id="licenseNumber"
            name="licenseNumber"
            type="text"
            value={clientInfoData.licenseNumber}
            onChange={changeClientInfoField}
            style={{ width: '180px' }}
          />


          <label htmlFor="licenseStatus">
            License Status
          </label>

          <input
            id="licenseStatus"
            name="licenseStatus"
            type="text"
            value={clientInfoData.licenseStatus}
            readOnly
            style={{ width: '160px' }}
          />


          <label htmlFor="subscriptionRenewalDate">
            Subscription Renewal Date
          </label>

          <input
            id="subscriptionRenewalDate"
            name="subscriptionRenewalDate"
            type="text"
            value={clientInfoData.subscriptionRenewalDate}
            readOnly
            style={{ width: '140px' }}
          />


          <label htmlFor="licenseType">
            License Type
          </label>

          <input
            id="licenseType"
            name="licenseType"
            type="text"
            value={clientInfoData.licenseType}
            onChange={changeClientInfoField}
            style={{ width: '160px' }}
          />


          <label htmlFor="licenseSize">
            License Size
          </label>

          <input
            id="licenseSize"
            name="licenseSize"
            type="text"
            value={clientInfoData.licenseSize}
            onChange={changeClientInfoField}
            style={{ width: '100px' }}
          />


          <label htmlFor="clientNotes">
            Notes
          </label>

          <textarea
            id="clientNotes"
            name="clientNotes"
            value={clientInfoData.clientNotes}
            onChange={changeClientInfoField}
            style={{
              width: '520px',
              height: '120px',
              overflowY: 'auto',
              resize: 'none'
            }}
          />

        </div>

     <div className="hoa-details-actions">
  <button
    type="button"
    className={
      saveMessage
        ? 'hoa-save-button hoa-save-button-saved'
        : 'hoa-save-button'
    }
    onClick={handleSaveChanges}
    disabled={isLoading || isSaving}
  >
    {isSaving
      ? 'Saving...'
      : saveMessage
        ? 'Changes Saved'
        : 'Save Changes'}
  </button>

  {hasUnsavedChanges && (
    <span className="hoa-unsaved-message">
      Save Changes
    </span>
  )}

  {saveError && (
    <span className="hoa-error-message">
      {saveError}
    </span>
  )}
</div>
      </>
    );
  }

  function renderManagementPanel() {
    return (
      <>
        <div className="hoa-details-title">
          MANAGEMENT COMPANY PROFILE
        </div>

        <div className="hoa-details-grid">

          <label htmlFor="selfManaged">
            Self Managed
          </label>

          <select
            id="selfManaged"
            name="selfManaged"
            value={managementData.selfManaged}
            onChange={changeManagementField}
            style={{ width: '60px' }}
          >
            <option value="N">N</option>
            <option value="Y">Y</option>
          </select>


          <label htmlFor="mgtCoName">
            Mgt Co. Name
          </label>

          <input
            id="mgtCoName"
            name="mgtCoName"
            type="text"
            value={managementData.mgtCoName}
            onChange={changeManagementField}
            style={{ width: '320px' }}
          />


          <label htmlFor="mgtCoAddress">
            Mgt Co. Address
          </label>

          <input
            id="mgtCoAddress"
            name="mgtCoAddress"
            type="text"
            value={managementData.mgtCoAddress}
            onChange={changeManagementField}
            style={{ width: '420px' }}
          />


          <label htmlFor="mgtCoContactName">
            Mgt Co. Contact Name
          </label>

          <input
            id="mgtCoContactName"
            name="mgtCoContactName"
            type="text"
            value={managementData.mgtCoContactName}
            onChange={changeManagementField}
            style={{ width: '220px' }}
          />


          <label htmlFor="mgtCoContactTel">
            Mgt Co. Contact Tel#
            
          </label>

          <input
            id="mgtCoContactTel"
            name="mgtCoContactTel"
            type="tel"
            inputMode="tel"
            value={managementData.mgtCoContactTel}
            onChange={changeManagementField}
            style={{ width: '140px' }}
          />


          <label htmlFor="mgtCoContactEmail">
            Mgt Co. Contact E-Mail
          </label>

          <input
            id="mgtCoContactEmail"
            name="mgtCoContactEmail"
            type="email"
            inputMode="email"
            value={managementData.mgtCoContactEmail}
            onChange={changeManagementField}
            style={{ width: '260px' }}
          />


          <label htmlFor="clientRepresentative">
            Client Representative
          </label>

          <input
            id="clientRepresentative"
            name="clientRepresentative"
            type="text"
            value={managementData.clientRepresentative}
            onChange={changeManagementField}
            style={{ width: '220px' }}
          />


          <label htmlFor="repTel">
            Rep. Tel#
          </label>

          <input
            id="repTel"
            name="repTel"
            type="tel"
            inputMode="tel"
            value={managementData.repTel}
            onChange={changeManagementField}
            style={{ width: '140px' }}
          />


          <label htmlFor="repEmail">
            Rep. E-Mail
          </label>

          <input
            id="repEmail"
            name="repEmail"
            type="email"
            inputMode="email"
            value={managementData.repEmail}
            onChange={changeManagementField}
            style={{ width: '260px' }}
          />


          <label htmlFor="mgtCoLetterEmail">
            Mgt Co. Letter E-Mail
          </label>

          <input
            id="mgtCoLetterEmail"
            name="mgtCoLetterEmail"
            type="email"
            inputMode="email"
            value={managementData.mgtCoLetterEmail}
            onChange={changeManagementField}
            style={{ width: '260px' }}
          />


          <label htmlFor="mgtCoLetterTel">
            Mgt Co. Letter Tel#
          </label>

          <input
            id="mgtCoLetterTel"
            name="mgtCoLetterTel"
            type="tel"
            inputMode="tel"
            value={managementData.mgtCoLetterTel}
            onChange={changeManagementField}
            style={{ width: '140px' }}
          />


          <label htmlFor="managementNotes">
            Notes
          </label>

          <textarea
            id="managementNotes"
            name="managementNotes"
            value={managementData.managementNotes}
            onChange={changeManagementField}
            style={{
              width: '520px',
              height: '120px',
              overflowY: 'auto',
              resize: 'none'
            }}
          />

        </div>

        <div className="hoa-details-actions">
  <button
    type="button"
    className={
      saveMessage
        ? 'hoa-save-button hoa-save-button-saved'
        : 'hoa-save-button'
    }
    onClick={handleSaveChanges}
    disabled={isLoading || isSaving}
  >
    {isSaving
      ? 'Saving...'
      : saveMessage
        ? 'Changes Saved'
        : 'Save Changes'}
  </button>

  {hasUnsavedChanges && (
    <span className="hoa-unsaved-message">
      Save Changes
    </span>
  )}

  {saveError && (
    <span className="hoa-error-message">
      {saveError}
    </span>
  )}
</div>


      </>
    );
  }

  function renderRightPanel() {
    if (activeSection === 'client-info') {
      return renderClientInfoPanel();
    }

    if (activeSection === 'management') {
      return renderManagementPanel();
    }

    return renderHOAProfilePanel();
  }

  return (
    <div className="settings-hoa-wrap">

      <div className="settings-hoa-left">

        <div className="hoa-header-row">
          <div className="hoa-title">
            HOA PROFILE
          </div>
        </div>

        <div className="hoa-grid">

          <div className="hoa-grid-head">
            <div>Programming Type</div>
            <div>Description</div>
          </div>

          <div
            className={
              activeSection === 'hoa-profile'
                ? 'hoa-grid-row selected'
                : 'hoa-grid-row'
            }
            onClick={() => selectSection('hoa-profile')}
          >
            <div>HOA Profile</div>
            <div>HOA Name &amp; Address</div>
          </div>

          <div
            className={
              activeSection === 'client-info'
                ? 'hoa-grid-row selected'
                : 'hoa-grid-row'
            }
            onClick={() => selectSection('client-info')}
          >
            <div>Client Info</div>
            <div>Manage+ Client Information</div>
          </div>

          <div
            className={
              activeSection === 'management'
                ? 'hoa-grid-row selected'
                : 'hoa-grid-row'
            }
            onClick={() => selectSection('management')}
          >
            <div>Management</div>
            <div>Management Co. Profile</div>
          </div>

        </div>
      </div>

      <div className="settings-hoa-right">
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

export default HOAProfile;



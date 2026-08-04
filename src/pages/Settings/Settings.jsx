import { useState } from 'react';

import './Settings.css';

import TopSection from './components/TopSection/TopSection';
import HOAProfile from './components/HOAProfile/HOAProfile';
import Banking from './components/Banking/Banking';
import GeneralSystemProgramming
  from './components/GeneralSystemProgramming/GeneralSystemProgramming';
import DuesProgramming
  from './components/DuesProgramming/DuesProgramming';
import FinesLateFees
  from './components/FinesLateFees/FinesLateFees';
import GLMapping
  from './components/GLMapping/GLMapping';

function Settings() {
  const [activeSettingsPanel, setActiveSettingsPanel] =
    useState('');

  const [requestedSettingsPanel, setRequestedSettingsPanel] =
    useState('');

  function openSettingsPanel(panelName) {
    if (panelName === activeSettingsPanel) {
      return;
    }

    if (
      activeSettingsPanel === 'hoa-profile' ||
      activeSettingsPanel === 'banking' ||
      activeSettingsPanel === 'general-system' ||
      activeSettingsPanel === 'dues-programming' ||
      activeSettingsPanel === 'fines-late-fees' ||
      activeSettingsPanel === 'gl-mapping'
    ) {
      setRequestedSettingsPanel(panelName);
      return;
    }

    setActiveSettingsPanel(panelName);
  }

  function completeProtectedNavigation(panelName) {
    setRequestedSettingsPanel('');
    setActiveSettingsPanel(panelName);
  }

  function cancelProtectedNavigation() {
    setRequestedSettingsPanel('');
  }

  function protectedNavigationProps() {
    return {
      requestedSettingsPanel,
      onSettingsNavigationApproved:
        completeProtectedNavigation,
      onSettingsNavigationCancelled:
        cancelProtectedNavigation
    };
  }

  function renderSettingsPanel() {
    if (activeSettingsPanel === 'hoa-profile') {
      return (
        <HOAProfile
          {...protectedNavigationProps()}
        />
      );
    }

    if (activeSettingsPanel === 'banking') {
      return (
        <Banking
          {...protectedNavigationProps()}
        />
      );
    }

    if (activeSettingsPanel === 'general-system') {
      return (
        <GeneralSystemProgramming
          {...protectedNavigationProps()}
        />
      );
    }

    if (activeSettingsPanel === 'dues-programming') {
      return (
        <DuesProgramming
          {...protectedNavigationProps()}
        />
      );
    }

    if (activeSettingsPanel === 'fines-late-fees') {
      return (
        <FinesLateFees
          {...protectedNavigationProps()}
        />
      );
    }

    if (activeSettingsPanel === 'gl-mapping') {
      return (
        <GLMapping
          {...protectedNavigationProps()}
        />
      );
    }

    return (
      <div className="settings-content-panel">
        <h2>SETTINGS HUB</h2>

        <p>
          Select a settings category above to review or edit
          system configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-shell">

        <div className="settings-fixed">
          <TopSection
            activeSettingsPanel={activeSettingsPanel}
            onSettingsButtonClick={openSettingsPanel}
          />
        </div>

        {renderSettingsPanel()}

      </div>
    </div>
  );
}

export default Settings;

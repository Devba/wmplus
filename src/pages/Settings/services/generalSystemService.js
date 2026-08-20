/*
  General System Programming persistence service

  Current development mode:
    local  = browser localStorage

  Future production mode:
    server = Node/Express API
*/
import { API_BASE_URL } from '../../../config/api';
const PERSISTENCE_MODE = 'server';

const STORAGE_KEY =
  'wmplus-settings-general-system';

const SERVER_URL =
  `${API_BASE_URL}/settings/system`;

export async function loadGeneralSystemSettings() {
  if (PERSISTENCE_MODE === 'server') {
    return loadGeneralSystemSettingsFromServer();
  }

  return loadGeneralSystemSettingsFromLocalStorage();
}

export async function saveGeneralSystemSettings(data) {
  if (PERSISTENCE_MODE === 'server') {
    return saveGeneralSystemSettingsToServer(data);
  }

  return saveGeneralSystemSettingsToLocalStorage(data);
}

function loadGeneralSystemSettingsFromLocalStorage() {
  const savedText =
    localStorage.getItem(STORAGE_KEY);

  if (!savedText) {
    return null;
  }

  try {
    return JSON.parse(savedText);
  } catch (error) {
    console.error(
      'Unable to read the saved General System settings:',
      error
    );

    return null;
  }
}

function saveGeneralSystemSettingsToLocalStorage(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  return {
    success: true,
    source: 'local'
  };
}

async function loadGeneralSystemSettingsFromServer() {
  const response = await fetch(SERVER_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load General System settings. ` +
      `Server returned ${response.status}.`
    );
  }

  return response.json();
}

async function saveGeneralSystemSettingsToServer(data) {
  const response = await fetch(SERVER_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(
      `Unable to save General System settings. ` +
      `Server returned ${response.status}.`
    );
  }

  return response.json();
}

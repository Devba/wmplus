/*
  Fines / Late Fees persistence service

  Current development mode:
    local  = browser localStorage

  Future production mode:
    server = Node/Express API
*/
import { API_BASE_URL } from '../../../config/api';
const PERSISTENCE_MODE = 'server';


const STORAGE_KEY =
  'wmplus-settings-fines-late-fees';

const SERVER_URL =
  `${API_BASE_URL}/settings/fines-late-fees`;

export async function loadFinesLateFees() {
  if (PERSISTENCE_MODE === 'server') {
    return loadFinesLateFeesFromServer();
  }

  return loadFinesLateFeesFromLocalStorage();
}

export async function saveFinesLateFees(data) {
  if (PERSISTENCE_MODE === 'server') {
    return saveFinesLateFeesToServer(data);
  }

  return saveFinesLateFeesToLocalStorage(data);
}

function loadFinesLateFeesFromLocalStorage() {
  const savedText =
    localStorage.getItem(STORAGE_KEY);

  if (!savedText) {
    return null;
  }

  try {
    return JSON.parse(savedText);
  } catch (error) {
    console.error(
      'Unable to read saved Fines / Late Fees settings:',
      error
    );

    return null;
  }
}

function saveFinesLateFeesToLocalStorage(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  return {
    success: true,
    source: 'local'
  };
}

async function loadFinesLateFeesFromServer() {
  const response = await fetch(SERVER_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load Fines / Late Fees settings. ` +
      `Server returned ${response.status}.`
    );
  }

  return response.json();
}

async function saveFinesLateFeesToServer(data) {
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
      `Unable to save Fines / Late Fees settings. ` +
      `Server returned ${response.status}.`
    );
  }

  return response.json();
}


import { API_BASE_URL } from '../../../config/api';

/*
  HOA Profile persistence service

  Current development mode:
    local  = browser localStorage

  Future production mode:
    server = Node/Express API
*/

const PERSISTENCE_MODE = 'server';

const STORAGE_KEY = 'wmplus-settings-hoa-profile';

const SERVER_URL = `${API_BASE_URL}/settings/hoa-profile`;


export async function loadHOAProfile() {
  if (PERSISTENCE_MODE === 'server') {
    return loadHOAProfileFromServer();
  }

  return loadHOAProfileFromLocalStorage();
}


export async function saveHOAProfile(data) {
  if (PERSISTENCE_MODE === 'server') {
    return saveHOAProfileToServer(data);
  }

  return saveHOAProfileToLocalStorage(data);
}


/* ===========================================================
   LOCAL STORAGE
   =========================================================== */

function loadHOAProfileFromLocalStorage() {
  const savedText = localStorage.getItem(STORAGE_KEY);

  if (!savedText) {
    return null;
  }

  try {
    return JSON.parse(savedText);
  } catch (error) {
    console.error(
      'Unable to read the saved HOA Profile:',
      error
    );

    return null;
  }
}


function saveHOAProfileToLocalStorage(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  return {
    success: true,
    source: 'local'
  };
}


/* ===========================================================
   SERVER
   =========================================================== */

async function loadHOAProfileFromServer() {
  const response = await fetch(SERVER_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load HOA Profile. Server returned ${response.status}.`
    );
  }

  return response.json();
}


async function saveHOAProfileToServer(data) {
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
      `Unable to save HOA Profile. Server returned ${response.status}.`
    );
  }

  return response.json();
}
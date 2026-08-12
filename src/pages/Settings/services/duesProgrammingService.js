/*
  Annual / Special Dues Programming persistence service

  Current development mode:
    local  = browser localStorage

  Future production mode:
    server = Node/Express API
*/

const PERSISTENCE_MODE = 'server';

const STORAGE_KEY =
  'wmplus-settings-dues-programming';

const SERVER_URL =
  'http://localhost:3011/api/settings/dues-programming';

export async function loadDuesProgramming() {
  if (PERSISTENCE_MODE === 'server') {
    return loadDuesProgrammingFromServer();
  }

  return loadDuesProgrammingFromLocalStorage();
}

export async function saveDuesProgramming(data) {
  if (PERSISTENCE_MODE === 'server') {
    return saveDuesProgrammingToServer(data);
  }

  return saveDuesProgrammingToLocalStorage(data);
}

function loadDuesProgrammingFromLocalStorage() {
  const savedText =
    localStorage.getItem(STORAGE_KEY);

  if (!savedText) {
    return null;
  }

  try {
    return JSON.parse(savedText);
  } catch (error) {
    console.error(
      'Unable to read saved Dues Programming settings:',
      error
    );

    return null;
  }
}

function saveDuesProgrammingToLocalStorage(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  return {
    success: true,
    source: 'local'
  };
}

async function loadDuesProgrammingFromServer() {
  const response = await fetch(SERVER_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load Dues Programming settings. ` +
      `Server returned ${response.status}.`
    );
  }

  return response.json();
}

async function saveDuesProgrammingToServer(data) {
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
      `Unable to save Dues Programming settings. ` +
      `Server returned ${response.status}.`
    );
  }

  return response.json();
}

/*
  GL Mapping persistence service

  Current development mode:
    local  = browser localStorage

  Future production mode:
    server = Node/Express API
*/

const PERSISTENCE_MODE = 'server';

const STORAGE_KEY =
  'wmplus-settings-gl-mapping';

const SERVER_URL =
  'http://localhost:3011/api/settings/gl-mapping';

export async function loadGLMapping() {
  if (PERSISTENCE_MODE === 'server') {
    return loadGLMappingFromServer();
  }

  return loadGLMappingFromLocalStorage();
}

export async function saveGLMapping(data) {
  if (PERSISTENCE_MODE === 'server') {
    return saveGLMappingToServer(data);
  }

  return saveGLMappingToLocalStorage(data);
}

function loadGLMappingFromLocalStorage() {
  const savedText =
    localStorage.getItem(STORAGE_KEY);

  if (!savedText) {
    return null;
  }

  try {
    return JSON.parse(savedText);
  } catch (error) {
    console.error(
      'Unable to read saved GL Mapping settings:',
      error
    );

    return null;
  }
}

function saveGLMappingToLocalStorage(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  return {
    success: true,
    source: 'local'
  };
}

async function loadGLMappingFromServer() {
  const response = await fetch(SERVER_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load GL Mapping settings. ` +
      `Server returned ${response.status}.`
    );
  }

  const data = await response.json();

  const glAccounts = Array.isArray(data.glAccounts)
    ? data.glAccounts
    : [];

  const expenseRows = glAccounts.filter((row) => {
    const glNumber = parseInt(
      String(row.glNumber || '').replace(/\D.*$/, ''),
      10
    );

    return Number.isFinite(glNumber) && glNumber < 40000;
  });

  const revenueRows = glAccounts.filter((row) => {
    const glNumber = parseInt(
      String(row.glNumber || '').replace(/\D.*$/, ''),
      10
    );

    return Number.isFinite(glNumber) && glNumber >= 40000;
  });

  return {
    expenseRows,
    revenueRows,
    activeSection: 'expense'
  };
}
async function saveGLMappingToServer(data) {
  const glAccounts = [
    ...(Array.isArray(data.expenseRows)
      ? data.expenseRows
      : []),

    ...(Array.isArray(data.revenueRows)
      ? data.revenueRows
      : [])
  ];

  const response = await fetch(SERVER_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      glAccounts
    })
  });

  if (!response.ok) {
    throw new Error(
      `Unable to save GL Mapping settings. ` +
      `Server returned ${response.status}.`
    );
  }

  return response.json();
}

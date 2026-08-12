/*
  Banking / Fiscal Year Setup persistence service

  Current development mode:
    local  = browser localStorage

  Future production mode:
    server = Node/Express API
*/

const PERSISTENCE_MODE = 'server';

const STORAGE_KEY =
  'wmplus-settings-banking';

const SERVER_URL =
  'http://localhost:3011/api/settings/banking';

export async function loadBankingSettings() {
  if (PERSISTENCE_MODE === 'server') {
    return loadBankingSettingsFromServer();
  }

  return loadBankingSettingsFromLocalStorage();
}

export async function saveBankingSettings(data) {
  if (PERSISTENCE_MODE === 'server') {
    return saveBankingSettingsToServer(data);
  }

  return saveBankingSettingsToLocalStorage(data);
}

function loadBankingSettingsFromLocalStorage() {
  const savedText =
    localStorage.getItem(STORAGE_KEY);

  if (!savedText) {
    return null;
  }

  try {
    return JSON.parse(savedText);
  } catch (error) {
    console.error(
      'Unable to read the saved Banking settings:',
      error
    );

    return null;
  }
}

function saveBankingSettingsToLocalStorage(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  return {
    success: true,
    source: 'local'
  };
}

async function loadBankingSettingsFromServer() {
  const response = await fetch(SERVER_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load Banking settings. ` +
      `Server returned ${response.status}.`
    );
  }

  const data = await response.json();

  const bankRows = Array.isArray(data.banks)
    ? data.banks.map((bank) => ({
        ...bank,
        dbId: bank.id,
        id:
          `${String(bank.bankType || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')}-${bank.bankId}`
      }))
    : [];

  return {
    bankRows,
    fiscalData: data.fiscalSetup || {},
    selectedRowId: 'operating-101'
  };
}

async function saveBankingSettingsToServer(data) {
  const payload = {};

  if (Array.isArray(data.banks)) {
    payload.banks = data.banks.map((bank) => ({
      ...bank,
      id: bank.dbId
    }));
  }

  if (data.fiscalSetup) {
    payload.fiscalSetup = data.fiscalSetup;
  }

  const response = await fetch(SERVER_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(
      `Unable to save Banking settings. ` +
      `Server returned ${response.status}.`
    );
  }

  return response.json();
}

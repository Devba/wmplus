import { API_BASE_URL } from '../config/api.js';
import mainDirectorySampleData from '../pages/MainDirectory/data/mainDirectorySampleData.js';

export async function fetchResidents() {
  try {
    const response = await fetch(`${API_BASE_URL}/residents`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map(r => ({
        acctNo: r.account_id || r.acctNo,
        acct: r.account_id || r.acctNo,
        firstName: r.first_name || r.firstName,
        lastName: r.last_name || r.lastName,
        name: r.display_name || `${r.first_name || ''} ${r.last_name || ''}`.trim(),
        residence: r.address || r.residence,
        address: r.address || r.residence,
        billingAddress: r.address || r.billingAddress,
        city: r.city,
        state: r.state,
        zip: r.zip,
        phone: r.phone,
        email: r.email,
        type: r.type,
        dues: r.annual_dues || r.dues,
        activeFlag: r.active_flag || 'Y',
        ...r
      }));
    }
    return mainDirectorySampleData;
  } catch (err) {
    console.warn('Could not fetch residents from API, using sample data:', err);
    return mainDirectorySampleData;
  }
}

function mapToApiSchema(r) {
  return {
    account_id: r.acctNo || r.acct || r.account_id,
    first_name: r.firstName || r.first_name,
    last_name: r.lastName || r.last_name,
    display_name: r.name || r.displayName || r.display_name || `${r.firstName || ''} ${r.lastName || ''}`.trim(),
    address: r.residence || r.address,
    billing_address: r.billingAddress || r.billing_address || r.residence || r.address,
    city: r.city,
    state: r.state || r.st,
    zip: r.zip,
    phone: r.phone,
    email: r.email,
    type: r.type,
    active_flag: r.activeFlag || r.active_flag || 'Y',
    annual_dues: r.dues || r.annualRate || r.annualDues || r.annual_dues || 0.00
  };
}

export async function createResident(residentData) {
  try {
    const apiData = mapToApiSchema(residentData);
    const response = await fetch(`${API_BASE_URL}/residents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Failed to save resident to database:', err);
    throw err;
  }
}

export async function updateResident(accountId, residentData) {
  try {
    const apiData = mapToApiSchema(residentData);
    const response = await fetch(`${API_BASE_URL}/residents/${accountId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Failed to update resident in database:', err);
    throw err;
  }
}


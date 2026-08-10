import { API_BASE_URL, setConnectionStatus } from '../config/api.js';
import mainDirectorySampleData from '../pages/MainDirectory/data/mainDirectorySampleData.js';

export async function fetchResidents() {
  try {
    const response = await fetch(`${API_BASE_URL}/residents`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const residentsArray = Array.isArray(data) ? data : (data && Array.isArray(data.residents) ? data.residents : null);
    if (residentsArray) {
      setConnectionStatus(false);
      return residentsArray.map(r => ({
        acctNo: r.account_id,
        acct: r.account_id,
        firstName: r.first_name || '',
        middleName: r.middle_name || '',
        lastName: r.last_name || '',
        prefix: r.prefix || '',
        name: r.display_name || `${r.first_name || ''} ${r.last_name || ''}`.trim(),
        residence: r.residence_address || '',
        address: r.residence_address || '',
        billingAddress: r.billing_address || '',
        city: r.city || '',
        state: r.state_code || '',
        st: r.state_code || '',
        zip: r.zip_code || '',
        phone: r.primary_phone || '',
        email: r.email_address || '',
        primaryCell: r.primary_cell || '',
        secondaryCell: r.secondary_cell || '',
        moveInDate: r.move_in_date || '',
        type: r.resident_type || '',
        active: r.active_flag || 'Y',
        activeFlag: r.active_flag || 'Y',
        ach: r.ach_flag || '',
        addlFirst: r.addl_first_name || '',
        addlMiddle: r.addl_middle_name || '',
        addlLast: r.addl_last_name || '',
        addlEmail: r.addl_email || '',
        bothFirst: `${r.first_name || ''}${r.addl_first_name ? ' & ' + r.addl_first_name : ''}`.trim(),
        annualRate: r.annual_dues_rate || 'Rate Code A',
        annualDues: r.annual_dues !== null && r.annual_dues !== undefined ? String(r.annual_dues) : '',
        dues: r.annual_dues || 0.00,
        specialRate: r.special_assessment_rate || 'Rate Code A',
        specialDues: r.special_assessment_dues !== null && r.special_assessment_dues !== undefined ? String(r.special_assessment_dues) : '',
        nextAnnual: r.next_year_annual_dues !== null && r.next_year_annual_dues !== undefined ? String(r.next_year_annual_dues) : '',
        nextSpecial: r.next_year_special_assmt_dues !== null && r.next_year_special_assmt_dues !== undefined ? String(r.next_year_special_assmt_dues) : '',
        notes: r.resident_notes || '',
        proRata: r.pro_rata || ''
      }));
    }
    setConnectionStatus(true);
    return mainDirectorySampleData;
  } catch (err) {
    console.warn('Could not fetch residents from API, using sample data:', err);
    setConnectionStatus(true);
    return mainDirectorySampleData;
  }
}

function mapToApiSchema(r) {
  return {
    account_id: r.acctNo || r.acct || r.account_id,
    first_name: r.firstName || r.first_name || null,
    middle_name: r.middleName || r.middle_name || null,
    last_name: r.lastName || r.last_name || null,
    display_name: r.name || r.displayName || r.display_name || `${r.firstName || ''} ${r.lastName || ''}`.trim(),
    residence_address: r.residence || r.address || null,
    billing_address: r.billingAddress || r.billing_address || r.residence || r.address || null,
    city: r.city || null,
    state_code: r.state || r.st || null,
    zip_code: r.zip || null,
    primary_phone: r.phone || null,
    primary_cell: r.primaryCell || null,
    secondary_cell: r.secondaryCell || null,
    email_address: r.email || null,
    move_in_date: r.moveInDate || null,
    resident_type: r.type || null,
    active_flag: r.active || r.activeFlag || 'Y',
    ach_flag: r.ach || null,
    addl_first_name: r.addlFirst || null,
    addl_middle_name: r.addlMiddle || null,
    addl_last_name: r.addlLast || null,
    addl_email: r.addlEmail || null,
    annual_dues_rate: r.annualRate || null,
    annual_dues: r.annualDues || r.dues || 0.00,
    special_assessment_rate: r.specialRate || null,
    special_assessment_dues: r.specialDues || 0.00,
    next_year_annual_dues: r.nextAnnual || 0.00,
    next_year_special_assmt_dues: r.nextSpecial || 0.00,
    resident_notes: r.notes || null
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
    setConnectionStatus(false);
    return await response.json();
  } catch (err) {
    console.error('Failed to save resident to database:', err);
    setConnectionStatus(true);
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
    setConnectionStatus(false);
    return await response.json();
  } catch (err) {
    console.error('Failed to update resident in database:', err);
    setConnectionStatus(true);
    throw err;
  }
}



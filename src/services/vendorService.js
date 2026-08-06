import { API_BASE_URL, setConnectionStatus } from '../config/api.js';
import vendorIdListSampleData from '../pages/VendorIdList/data/vendorIdListSampleData.js';

export async function fetchVendors() {
  try {
    const response = await fetch(`${API_BASE_URL}/vendors`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      setConnectionStatus(false);
      return data.map(v => ({
        id: v.vendor_id,
        vendorId: v.vendor_id,
        vendorName: v.vendor_name,
        name: v.vendor_name,
        streetAddress: v.address,
        coAddress: v.co_address,
        address: v.address,
        address2: v.address2,
        city: v.city,
        state: v.state,
        zip: v.zip,
        phone: v.phone,
        tel: v.phone,
        email: v.email,
        contactName: v.contact_name,
        vendorType: v.vendor_type,
        taxId: v.tax_id,
        electronicCheckYN: v.electronic_check || 'N',
        electronicCheckAmount: v.electronic_check_amount || '',
        startMonth: v.start_month || '',
        startDay: v.start_day || '',
        bankAccount: v.bank_account || '',
        defaultGlNumber: v.default_gl_number,
        defaultGlName: v.default_gl_name,
        glNumber: v.default_gl_number,
        glAccount: v.default_gl_name,
        currentTransactionNumber: v.current_txn || '',
        checkNotation: v.default_check_note || '',
        notes: v.notes || '',
        vendorStatus: v.active_flag === 'Y' ? 'Active' : 'Inactive',
        active_flag: v.active_flag || 'Y'
      }));
    }
    setConnectionStatus(true);
    return vendorIdListSampleData;
  } catch (err) {
    console.warn('Could not fetch vendors from API, using sample data:', err);
    setConnectionStatus(true);
    return vendorIdListSampleData;
  }
}

export async function createVendor(vendor) {
  const body = {
    vendor_id: vendor.vendorId || vendor.id,
    vendor_name: vendor.vendorName || vendor.name,
    co_address: vendor.coAddress,
    address: vendor.streetAddress || vendor.address,
    address2: vendor.address2,
    city: vendor.city,
    state: vendor.state,
    zip: vendor.zip,
    phone: vendor.phone || vendor.tel,
    email: vendor.email,
    contact_name: vendor.contactName,
    vendor_type: vendor.vendorType,
    tax_id: vendor.taxId,
    electronic_check: vendor.electronicCheckYN,
    electronic_check_amount: vendor.electronicCheckAmount ? parseFloat(vendor.electronicCheckAmount) : null,
    start_month: vendor.startMonth ? parseInt(vendor.startMonth, 10) : null,
    start_day: vendor.startDay ? parseInt(vendor.startDay, 10) : null,
    bank_account: vendor.bankAccount,
    default_gl_number: vendor.defaultGlNumber || vendor.glNumber ? parseInt(vendor.defaultGlNumber || vendor.glNumber, 10) : null,
    default_gl_name: vendor.defaultGlName || vendor.glAccount,
    default_check_note: vendor.checkNotation,
    notes: vendor.notes,
    active_flag: vendor.vendorStatus === 'Active' || vendor.active_flag === 'Y' ? 'Y' : 'N'
  };

  const response = await fetch(`${API_BASE_URL}/vendors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

export async function updateVendor(vendorId, vendor) {
  const body = {
    vendor_name: vendor.vendorName || vendor.name,
    co_address: vendor.coAddress,
    address: vendor.streetAddress || vendor.address,
    address2: vendor.address2,
    city: vendor.city,
    state: vendor.state,
    zip: vendor.zip,
    phone: vendor.phone || vendor.tel,
    email: vendor.email,
    contact_name: vendor.contactName,
    vendor_type: vendor.vendorType,
    tax_id: vendor.taxId,
    electronic_check: vendor.electronicCheckYN,
    electronic_check_amount: vendor.electronicCheckAmount ? parseFloat(vendor.electronicCheckAmount) : null,
    start_month: vendor.startMonth ? parseInt(vendor.startMonth, 10) : null,
    start_day: vendor.startDay ? parseInt(vendor.startDay, 10) : null,
    bank_account: vendor.bankAccount,
    default_gl_number: vendor.defaultGlNumber || vendor.glNumber ? parseInt(vendor.defaultGlNumber || vendor.glNumber, 10) : null,
    default_gl_name: vendor.defaultGlName || vendor.glAccount,
    default_check_note: vendor.checkNotation,
    notes: vendor.notes,
    active_flag: vendor.vendorStatus === 'Active' || vendor.active_flag === 'Y' ? 'Y' : 'N'
  };

  const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

export async function deleteVendor(vendorId) {
  const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}


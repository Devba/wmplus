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
        streetAddress: v.address || v.streetAddress,
        coAddress: v.address || v.coAddress,
        address: v.address,
        city: v.city,
        state: v.state,
        zip: v.zip,
        phone: v.phone,
        email: v.email,
        contactName: v.contact_name || v.contactName,
        vendorType: v.vendor_type || v.vendorType,
        taxId: v.tax_id || v.taxId,
        defaultGlNumber: v.default_gl_number || v.defaultGlNumber,
        defaultGlName: v.default_gl_name || v.defaultGlName,
        ...v
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


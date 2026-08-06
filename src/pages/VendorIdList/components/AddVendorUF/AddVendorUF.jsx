import { useRef } from 'react';
import './AddVendorUF.css';

function AddVendorUF({
  mode = 'add',
  vendor = null,
  onEnterData
}) {
  const formRef = useRef(null);
  const isEditMode = mode === 'edit';

  const readValue = (id) => {
    const element = formRef.current?.querySelector(`#${id}`);
    return element?.value?.trim() || '';
  };

  const closeOverlay = () => {
    const closeButton = document.querySelector('.overlay-close-btn, .overlay-close');
    closeButton?.click();
  };

  const handleEnterData = () => {
    const vendorId = isEditMode ? vendor.vendorId : readValue('vdAddVendorID');
    if (!vendorId) {
      window.alert('Vendor ID is required.');
      return;
    }
    if (!readValue('vdAddVendorName')) {
      window.alert('Vendor Name is required.');
      return;
    }

    const enteredVendor = {
      ...vendor,
      vendorId: vendorId,
      id: vendorId,
      vendorName: readValue('vdAddVendorName'),
      name: readValue('vdAddVendorName'),
      coAddress: readValue('vdAddCareOf'),
      streetAddress: readValue('vdAddAddress'),
      address: readValue('vdAddAddress'),
      city: readValue('vdAddCity'),
      state: readValue('vdAddState'),
      zip: readValue('vdAddZip'),
      phone: readValue('vdAddPhone'),
      tel: readValue('vdAddPhone'),
      email: readValue('vdAddEmail'),
      contactName: readValue('vdAddContactName'),
      vendorType: readValue('vdAddVendorType'),
      taxId: readValue('vdAddTaxID'),
      electronicCheckYN: readValue('vdAddECheck'),
      electronicCheckAmount: readValue('vdAddECheckAmount'),
      startMonth: readValue('vdAddECheckStartMonth'),
      startDay: readValue('vdAddECheckStartDay'),
      bankAccount: readValue('vdAddBankAccount'),
      defaultGlNumber: readValue('vdAddGLNumber'),
      glNumber: readValue('vdAddGLNumber'),
      defaultGlName: readValue('vdAddGLAccountName'),
      glAccount: readValue('vdAddGLAccountName'),
      checkNotation: readValue('vdAddCheckNotation'),
      notes: readValue('vdAddNotes'),
      vendorStatus: readValue('vdAddActive')
    };

    onEnterData(enteredVendor);
    closeOverlay();
  };

  return (
    <div className="vuf-container" ref={formRef}>
      <div className="vuf-grid">
        
        {/* CARD 1: General Info */}
        <div className="vuf-card">
          <div className="vuf-card-header">General Information</div>
          <div className="vuf-card-body vuf-form-grid">
            <div className="vuf-form-group">
              <label htmlFor="vdAddVendorID">Vendor ID *</label>
              <input
                id="vdAddVendorID"
                type="text"
                placeholder="e.g. VEND-100"
                defaultValue={vendor?.vendorId || ''}
                disabled={isEditMode}
              />
            </div>
            <div className="vuf-form-group span-2">
              <label htmlFor="vdAddVendorName">Vendor Name *</label>
              <input
                id="vdAddVendorName"
                type="text"
                placeholder="Enter vendor name"
                defaultValue={vendor?.vendorName || ''}
              />
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddActive">Status</label>
              <select id="vdAddActive" defaultValue={vendor?.vendorStatus || 'Active'}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 2: Address Info */}
        <div className="vuf-card">
          <div className="vuf-card-header">Address Details</div>
          <div className="vuf-card-body vuf-form-grid">
            <div className="vuf-form-group span-2">
              <label htmlFor="vdAddCareOf">Care Of Address Line</label>
              <input
                id="vdAddCareOf"
                type="text"
                placeholder="c/o Attn Name"
                defaultValue={vendor?.coAddress || ''}
              />
            </div>
            <div className="vuf-form-group span-2">
              <label htmlFor="vdAddAddress">Street Address</label>
              <input
                id="vdAddAddress"
                type="text"
                placeholder="123 main st"
                defaultValue={vendor?.streetAddress || ''}
              />
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddCity">City</label>
              <input
                id="vdAddCity"
                type="text"
                defaultValue={vendor?.city || 'Miami'}
              />
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddState">State</label>
              <input
                id="vdAddState"
                type="text"
                defaultValue={vendor?.state || 'FL'}
              />
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddZip">Zip Code</label>
              <input
                id="vdAddZip"
                type="text"
                defaultValue={vendor?.zip || ''}
              />
            </div>
          </div>
        </div>

        {/* CARD 3: Contact Info */}
        <div className="vuf-card">
          <div className="vuf-card-header">Contact Information</div>
          <div className="vuf-card-body vuf-form-grid">
            <div className="vuf-form-group">
              <label htmlFor="vdAddContactName">Contact Name</label>
              <input
                id="vdAddContactName"
                type="text"
                placeholder="John Doe"
                defaultValue={vendor?.contactName || ''}
              />
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddPhone">Phone Number</label>
              <input
                id="vdAddPhone"
                type="text"
                placeholder="(305) 555-0199"
                defaultValue={vendor?.phone || ''}
              />
            </div>
            <div className="vuf-form-group span-2">
              <label htmlFor="vdAddEmail">Email Address</label>
              <input
                id="vdAddEmail"
                type="email"
                placeholder="vendor@email.com"
                defaultValue={vendor?.email || ''}
              />
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddTaxID">Tax ID / SSN</label>
              <input
                id="vdAddTaxID"
                type="text"
                placeholder="XX-XXXXXXX"
                defaultValue={vendor?.taxId || ''}
              />
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddVendorType">Vendor Type</label>
              <input
                id="vdAddVendorType"
                type="text"
                placeholder="e.g. Landscaping"
                defaultValue={vendor?.vendorType || 'General'}
              />
            </div>
          </div>
        </div>

        {/* CARD 4: Banking & Check Details */}
        <div className="vuf-card">
          <div className="vuf-card-header">Banking & Check Settings</div>
          <div className="vuf-card-body vuf-form-grid">
            <div className="vuf-form-group">
              <label htmlFor="vdAddECheck">E-Check Y/N</label>
              <select id="vdAddECheck" defaultValue={vendor?.electronicCheckYN || 'N'}>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddECheckAmount">E-Check Amount ($)</label>
              <input
                id="vdAddECheckAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={vendor?.electronicCheckAmount || ''}
              />
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddECheckStartMonth">Start Month (1-12)</label>
              <input
                id="vdAddECheckStartMonth"
                type="number"
                min="1"
                max="12"
                placeholder="1"
                defaultValue={vendor?.startMonth || ''}
              />
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddECheckStartDay">Start Day (1-31)</label>
              <input
                id="vdAddECheckStartDay"
                type="number"
                min="1"
                max="31"
                placeholder="1"
                defaultValue={vendor?.startDay || ''}
              />
            </div>
            <div className="vuf-form-group span-2">
              <label htmlFor="vdAddBankAccount">Bank Account Name</label>
              <input
                id="vdAddBankAccount"
                type="text"
                placeholder="Operating Bank"
                defaultValue={vendor?.bankAccount || ''}
              />
            </div>
            <div className="vuf-form-group span-2">
              <label htmlFor="vdAddCheckNotation">Default Check Notation</label>
              <input
                id="vdAddCheckNotation"
                type="text"
                placeholder="Services rendered"
                defaultValue={vendor?.checkNotation || ''}
              />
            </div>
          </div>
        </div>

        {/* CARD 5: GL Configuration & Notes */}
        <div className="vuf-card span-2">
          <div className="vuf-card-header">GL Configuration & Notes</div>
          <div className="vuf-card-body vuf-form-grid">
            <div className="vuf-form-group">
              <label htmlFor="vdAddGLNumber">Default GL Number</label>
              <input
                id="vdAddGLNumber"
                type="number"
                placeholder="5010"
                defaultValue={vendor?.defaultGlNumber || ''}
              />
            </div>
            <div className="vuf-form-group span-2">
              <label htmlFor="vdAddGLAccountName">Default GL Account Name</label>
              <input
                id="vdAddGLAccountName"
                type="text"
                placeholder="Landscaping Maintenance"
                defaultValue={vendor?.defaultGlName || ''}
              />
            </div>
            <div className="vuf-form-group span-3">
              <label htmlFor="vdAddNotes">Vendor Notes</label>
              <textarea
                id="vdAddNotes"
                placeholder="Any special remarks or instructions..."
                defaultValue={vendor?.notes || ''}
                rows={3}
              />
            </div>
          </div>
        </div>

      </div>

      <div className="vuf-footer">
        <button className="vuf-btn vuf-btn-cancel" onClick={closeOverlay}>
          CANCEL
        </button>
        <button className="vuf-btn vuf-btn-submit" onClick={handleEnterData}>
          {isEditMode ? 'SAVE CHANGES' : 'CREATE VENDOR'}
        </button>
      </div>
    </div>
  );
}

export default AddVendorUF;

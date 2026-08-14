import { useEffect, useRef, useState } from 'react';
import './AddVendorUF.css';
import { API_BASE_URL } from '../../../../config/api';

const VALID_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]);





function AddVendorUF({
  mode = 'add',
  vendor = null,
  onEnterData
}) {
  const formRef = useRef(null);
  const isEditMode = mode === 'edit';
  const [bankOptions, setBankOptions] = useState([]);

  const [glOptions, setGLOptions] = useState([]);
  const [selectedGLNumber, setSelectedGLNumber] = useState(
  vendor?.defaultGlNumber || ''
);
  
  const [eCheckYN, setECheckYN] = useState(
  vendor?.electronicCheckYN || 'N'
);


  useEffect(() => {
  const loadBankOptions = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/settings/banking`
      );

      if (!response.ok) {
        throw new Error(
          `Banking request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      const activeBanks = Array.isArray(data.banks)
        ? data.banks.filter((bank) => bank.active === 'Y')
        : [];

      setBankOptions(activeBanks);
    } catch (error) {
      console.error(
        'Unable to load Vendor bank options:',
        error
      );

      setBankOptions([]);
    }
  };

  loadBankOptions();
}, []);


  useEffect(() => {
  const loadGLOptions = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/gl-options?screen=CR`
      );

      if (!response.ok) {
        throw new Error(
          `GL options request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      setGLOptions(
        Array.isArray(data.glAccounts) ? data.glAccounts : []
      );

    } catch (error) {
      console.error(
        'Unable to load Vendor GL options:',
        error
      );

      setGLOptions([]);
    }
  };

  loadGLOptions();
}, []); 

  const readValue = (id) => {
    const element = formRef.current?.querySelector(`#${id}`);
    return element?.value?.trim() || '';
  };

  const closeOverlay = () => {
    const closeButton = document.querySelector('.overlay-close-btn, .overlay-close');
    closeButton?.click();
  };

  const handleEnterData = () => {
  const vendorId = isEditMode ? vendor.vendorId : '';
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
              autoComplete="off"
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
                autoComplete="off"
                defaultValue={vendor?.streetAddress || ''}
              />
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddCity">City</label>
              <input
                id="vdAddCity"
                type="text"
                defaultValue={vendor?.city || ''}
              />
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddState">State</label>
              <input
  id="vdAddState"
  type="text"
  maxLength={2}
  defaultValue={vendor?.state || ''}

  onBlur={(event) => {
    const value = event.target.value.trim();

    if (value === '') return;

    const stateCode = value.toUpperCase();

if (!VALID_STATE_CODES.has(stateCode)) {
      window.alert(
        'State must contain exactly 2 letters.'
      );
      event.target.value = '';
      event.target.focus();
      return;
    }

    event.target.value = stateCode;
  }}

  onKeyDown={(event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      const value = event.currentTarget.value.trim();

      if (value === '') {
        event.currentTarget.blur();
        return;
      }

      const stateCode = value.toUpperCase();

if (!VALID_STATE_CODES.has(stateCode)) {
        window.alert(
          'State must contain exactly 2 letters.'
        );
        event.currentTarget.value = '';
        event.currentTarget.focus();
        return;
      }

      event.target.value = stateCode;
      event.currentTarget.blur();
    }
  }}
/>
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddZip">Zip Code</label>
              <input
  id="vdAddZip"
  type="text"
  maxLength={10}
  defaultValue={vendor?.zip || ''}
  onBlur={(event) => {
    const value = event.target.value.trim();

    if (
      value !== '' &&
      !/^\d{5}(-\d{4})?$/.test(value)
    ) {
      window.alert(
        'Zip Code must be 5 digits or ZIP+4 (12345-6789).'
      );
      event.target.value = '';
      event.target.focus();
    }
  }}
  onKeyDown={(event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      const value = event.currentTarget.value.trim();

      if (
        value !== '' &&
        !/^\d{5}(-\d{4})?$/.test(value)
      ) {
        window.alert(
          'Zip Code must be 5 digits or ZIP+4 (12345-6789).'
        );
        event.currentTarget.value = '';
        event.currentTarget.focus();
        return;
      }

      event.currentTarget.blur();
    }
  }}
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

  onBlur={(event) => {
    const value = event.target.value.trim();

    if (value === '') return;

    const digits = value.replace(/\D/g, '');

    if (digits.length !== 10) {
      window.alert(
        'Phone Number must contain exactly 10 digits.'
      );
      event.target.value = '';
      event.target.focus();
    }
  }}

  onKeyDown={(event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      const value = event.currentTarget.value.trim();

      if (value === '') {
        event.currentTarget.blur();
        return;
      }

      const digits = value.replace(/\D/g, '');

      if (digits.length !== 10) {
        window.alert(
          'Phone Number must contain exactly 10 digits.'
        );
        event.currentTarget.value = '';
        event.currentTarget.focus();
        return;
      }

      event.currentTarget.blur();
    }
    }}
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

  onBlur={(event) => {
    const value = event.target.value.trim();

    if (value === '') return;

    const digits = value.replace(/\D/g, '');

    if (digits.length !== 9) {
      window.alert(
        'Tax ID / SSN must contain exactly 9 digits.'
      );
      event.target.value = '';
      event.target.focus();
    }
  }}

  onKeyDown={(event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      const value = event.currentTarget.value.trim();

      if (value === '') {
        event.currentTarget.blur();
        return;
      }

      const digits = value.replace(/\D/g, '');

      if (digits.length !== 9) {
        window.alert(
          'Tax ID / SSN must contain exactly 9 digits.'
        );
        event.currentTarget.value = '';
        event.currentTarget.focus();
        return;
      }

      event.currentTarget.blur();
    }
  }}
/>
            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddVendorType">Vendor Type</label>
              <input
                id="vdAddVendorType"
                type="text"
                placeholder="e.g. Landscaping"
                defaultValue={vendor?.vendorType || ''}
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
              <select
              id="vdAddECheck"
              value={eCheckYN}
              onChange={(event) => {
              const nextValue = event.target.value;

              setECheckYN(nextValue);

              if (nextValue === 'Y') {
                const startMonth =
                  formRef.current?.querySelector('#vdAddECheckStartMonth');

                const startDay =
                  formRef.current?.querySelector('#vdAddECheckStartDay');

                if (startMonth && !startMonth.value) {
                  startMonth.value = '1';
                }

                if (startDay && !startDay.value) {
                  startDay.value = '1';
                }
              }
            }}
            >
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
  min="0"
  placeholder="0.00"
  defaultValue={vendor?.electronicCheckAmount || ''}
  disabled={eCheckYN !== 'Y'}

  onBlur={(event) => {
    const rawValue = event.target.value;

    if (rawValue === '') return;

    const value = Number(rawValue);
    const decimalPart = rawValue.split('.')[1];

    if (
      !Number.isFinite(value) ||
      value < 0 ||
      (decimalPart && decimalPart.length > 2)
    ) {
      window.alert(
        'E-Check Amount must be a valid amount with no more than 2 decimal places.'
      );
      event.target.value = '';
      event.target.focus();
      return;
    }

    event.target.value = value.toFixed(2);
  }}

  onKeyDown={(event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      const rawValue = event.currentTarget.value;
      if (rawValue === '') return;

      const value = Number(rawValue);
      const decimalPart = rawValue.split('.')[1];

      if (
        !Number.isFinite(value) ||
        value < 0 ||
        (decimalPart && decimalPart.length > 2)
      ) {
        window.alert(
          'E-Check Amount must be a valid amount with no more than 2 decimal places.'
        );
        event.currentTarget.value = '';
        event.currentTarget.focus();
        return;
      }

      event.currentTarget.value = value.toFixed(2);
      event.currentTarget.blur();
    }
    }}
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
                disabled={eCheckYN !== 'Y'}
                onBlur={(event) => {
                const value = Number(event.target.value);

                if (
                  event.target.value !== '' &&
                  (!Number.isInteger(value) || value < 1 || value > 12)
                ) {
                  window.alert('Start Month must be a whole number from 1 through 12.');
                  event.target.value = '';
                  event.target.focus();
                }
              }}

              onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();

                const value = Number(event.currentTarget.value);

                if (
                  event.currentTarget.value !== '' &&
                  (!Number.isInteger(value) || value < 1 || value > 12)
                ) {
                  window.alert('Start Month must be a whole number from 1 through 12.');
                  event.currentTarget.value = '';
                  event.currentTarget.focus();
                  return;
                }

                event.currentTarget.blur();
              }
            }}

              />

              

            </div>
            <div className="vuf-form-group">
              <label htmlFor="vdAddECheckStartDay">Start Day (1-28)</label>
              <input
  id="vdAddECheckStartDay"
  type="number"
  min="1"
  max="28"
  placeholder="1"
  defaultValue={vendor?.startDay || ''}
  disabled={eCheckYN !== 'Y'}

  onBlur={(event) => {
    const value = Number(event.target.value);

    if (
      event.target.value !== '' &&
      (!Number.isInteger(value) || value < 1 || value > 28)
    ) {
      window.alert(
        'Start Day must be a whole number from 1 through 28.'
      );
      event.target.value = '';
      event.target.focus();
    }
  }}

      onKeyDown={(event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      const value = Number(event.currentTarget.value);

      if (
        event.currentTarget.value !== '' &&
        (!Number.isInteger(value) || value < 1 || value > 28)
      ) {
        window.alert(
          'Start Day must be a whole number from 1 through 28.'
        );
        event.currentTarget.value = '';
        event.currentTarget.focus();
        return;
      }

      event.currentTarget.blur();
    }
  }}
/>
            </div>


            <div className="vuf-form-group span-2">
  <label htmlFor="vdAddBankAccount">Bank Account</label>

  <select
    id="vdAddBankAccount"
    defaultValue={vendor?.bankAccount || ''}
    disabled={eCheckYN !== 'Y'}
  >
    <option value="">
      -- Select Bank Account --
    </option>

    {bankOptions.map((bank) => {
      const displayText =
        `${bank.bankName} - ${bank.bankType} - ${bank.bankId}`;

      return (
        <option
          key={bank.id}
          value={bank.bankId}
        >
          {displayText}
        </option>
      );
    })}
  </select>
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
    type="text"
    value={selectedGLNumber}
    readOnly
  />
</div>

<div className="vuf-form-group span-2">
  <label htmlFor="vdAddGLAccountName">Default GL Account Name</label>

  <select
    id="vdAddGLAccountName"
    defaultValue={vendor?.defaultGlName || ''}
    disabled={eCheckYN !== 'Y'}
    onChange={(event) => {
      const selectedName = event.target.value;

      const selectedOption = glOptions.find(
        (gl) => gl.glName === selectedName
      );

      setSelectedGLNumber(
        selectedOption?.glNumber || ''
      );
    }}
  >
    <option value="">
      -- Select GL Account --
    </option>

    {glOptions.map((gl) => (
      <option
        key={gl.id}
        value={gl.glName}
      >
        {gl.glName}
      </option>
    ))}
  </select>
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

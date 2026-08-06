import { useRef, useState } from 'react';

import './AddResidentUF.css';
import AddressMap from './AddressMap';

function AddResidentUF({
  mode = 'add',
  resident = null,
  onEnterData
}) {
  const formRef = useRef(null);
  const isEditMode = mode === 'edit';

  const residenceParts = String(
    resident?.residence || ''
  )
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const initialStreetNumber =
    residenceParts.length > 0
      ? residenceParts[0]
      : '';

  const initialStreetName =
    residenceParts.length > 1
      ? residenceParts.slice(1).join(' ')
      : '';

  const [streetNumberValue, setStreetNumberValue] =
    useState(initialStreetNumber);

  const [streetNameValue, setStreetNameValue] =
    useState(initialStreetName);

  const [billingAddressValue, setBillingAddressValue] =
    useState(resident?.billingAddress || '');

  const achValue =
    resident?.ach === 'Y'
      ? 'Yes'
      : resident?.ach === 'N'
        ? 'No'
        : resident?.ach || '';

  const streetNames = [
    'Hanover St',
    'Pine Rd',
    'Lake View Dr',
    'Insurance Way',
    'Anywhere Lane'
  ];

  const availableStreetNames = initialStreetName
    ? Array.from(
        new Set([
          initialStreetName,
          ...streetNames
        ])
      )
    : streetNames;

  const updateBillingAddress = (
    nextStreetNumber,
    nextStreetName
  ) => {
    const combinedAddress = [
      nextStreetNumber.trim(),
      nextStreetName.trim()
    ]
      .filter(Boolean)
      .join(' ');

    setBillingAddressValue(combinedAddress);
  };

  const readValue = (id) => {
    const element =
      formRef.current?.querySelector(`#${id}`);

    return element?.value?.trim() || '';
  };

  const closeOverlay = () => {
    const closeButton = document.querySelector(
      '.overlay-close-btn, .overlay-close'
    );

    closeButton?.click();
  };

  const handleEnterData = () => {
    const firstName =
      readValue('mdAddFirstName');

    const additionalFirstName =
      readValue('mdAddAddlFirst');

    const enteredACH =
      readValue('mdAddACH');

    const existingAccountNumber =
      resident?.acctNo ||
      resident?.acct ||
      '';

    const enteredResident = {
      ...resident,

      acctNo: isEditMode
        ? existingAccountNumber
        : '',

      acct: isEditMode
        ? existingAccountNumber
        : '',

      firstName,
      middleName:
        readValue('mdAddMiddleName'),
      lastName:
        readValue('mdAddLastName'),
      prefix:
        readValue('mdAddPrefix'),

      residence: [
        streetNumberValue.trim(),
        streetNameValue.trim()
      ]
        .filter(Boolean)
        .join(' '),

      billingAddress:
        billingAddressValue.trim(),

      city:
        readValue('mdAddBillingCity'),

      state:
        readValue('mdAddBillingState'),

      st:
        readValue('mdAddBillingState'),

      zip:
        readValue('mdAddBillingZip'),

      phone:
        readValue('mdAddHomePhone'),

      email:
        readValue('mdAddEmail'),

      primaryCell:
        readValue('mdAddCell'),

      moveInDate:
        readValue('mdAddMoveIn'),

      type:
        readValue('mdAddPropertyType'),

      annualRate:
        readValue('mdAddAnnualRate'),

      annualDues:
        readValue('mdAddAnnualDues'),

      specialRate:
        readValue('mdAddSpecialRate'),

      specialDues:
        readValue('mdAddSpecialDues'),

      addlFirst:
        additionalFirstName,

      addlMiddle:
        readValue('mdAddAddlMiddle'),

      addlLast:
        readValue('mdAddAddlLast'),

      addlEmail:
        readValue('mdAddAddlEmail'),

      secondaryCell:
        readValue('mdAddAddlCell'),

      bothFirst: [
        firstName,
        additionalFirstName
      ]
        .filter(Boolean)
        .join(' & '),

      ach:
        enteredACH === 'Yes'
          ? 'Y'
          : enteredACH === 'No'
            ? 'N'
            : '',

      proRata:
        readValue('mdAddProRata'),

      notes:
        readValue('mdAddNotes'),

      nextAnnual:
        resident?.nextAnnual || '',

      nextSpecial:
        resident?.nextSpecial || '',

      active:
        resident?.active || 'Y'
    };

    if (typeof onEnterData !== 'function') {
      window.alert(
        'Resident Enter Data function is not available.'
      );
      return;
    }

    onEnterData(enteredResident);

    window.alert(
      isEditMode
        ? 'Resident updated successfully.'
        : 'Resident added successfully.'
    );

    closeOverlay();
  };

  return (
    <div ref={formRef} className="md-add-uf">
      {/* Title block */}
      <div className="md-form-header">
        <div className="md-header-info">
          <h2 className="md-add-title" id="mdResidentUFTitle">
            {isEditMode ? 'Edit Resident Record' : 'Add New Resident Address'}
          </h2>
          <p className="md-add-subtitle">
            {isEditMode
              ? 'Update account details and property fields in the Main Directory.'
              : 'Register a new physical property and main owner records.'}
          </p>
        </div>
        <div className="md-add-header-actions">
          <span className="md-add-video-label">See Instructional Video:</span>
          <button type="button" className="md-add-info-btn" title="Information Help">i</button>
        </div>
      </div>

      <div className="md-cards-container">
        {/* Card 1: Primary Owner */}
        <div className="md-card">
          <div className="md-card-title">Primary Owner Information</div>
          <div className="md-card-grid">
            <div className="md-form-group">
              <label htmlFor="mdAddFirstName" className="md-add-label">
                First Name <span className="req-red">*</span>
              </label>
              <input
                className="md-add-input"
                id="mdAddFirstName"
                type="text"
                defaultValue={resident?.firstName || ''}
              />
            </div>
            
            <div className="md-form-group">
              <label htmlFor="mdAddMiddleName" className="md-add-label">Middle Name</label>
              <input
                className="md-add-input"
                id="mdAddMiddleName"
                type="text"
                defaultValue={resident?.middleName || ''}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddLastName" className="md-add-label">
                Last Name <span className="req-blue">*</span>
              </label>
              <input
                className="md-add-input"
                id="mdAddLastName"
                type="text"
                defaultValue={resident?.lastName || ''}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddPrefix" className="md-add-label">Special Prefix</label>
              <input
                className="md-add-input"
                id="mdAddPrefix"
                type="text"
                defaultValue={resident?.prefix || ''}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddAcct" className="md-add-label">Account Number</label>
              <input
                className="md-add-input read-only-input"
                id="mdAddAcct"
                type="text"
                value={isEditMode ? (resident?.acctNo || resident?.acct || '') : ''}
                readOnly
                tabIndex={-1}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Property & Residence */}
        <div className="md-card">
          <div className="md-card-title">Residence Address</div>
          <div className="md-card-grid">
            <div className="md-form-group">
              <label htmlFor="mdAddStreetNum" className="md-add-label">
                Street Number <span className="req-blue">*</span>
              </label>
              <input
                className="md-add-input"
                id="mdAddStreetNum"
                type="text"
                value={streetNumberValue}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setStreetNumberValue(nextValue);
                  if (!isEditMode) {
                    updateBillingAddress(nextValue, streetNameValue);
                  }
                }}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddStreetAddress" className="md-add-label">
                Street Name <span className="req-blue">*</span>
              </label>
              <select
                className="md-add-input"
                id="mdAddStreetAddress"
                value={streetNameValue}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setStreetNameValue(nextValue);
                  if (!isEditMode) {
                    updateBillingAddress(streetNumberValue, nextValue);
                  }
                }}
              >
                <option value=""></option>
                {availableStreetNames.map((street) => (
                  <option key={street} value={street}>
                    {street}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Billing Address */}
        <div className="md-card">
          <div className="md-card-title">Billing Address</div>
          <div className="md-card-grid">
            <div className="md-form-group span-2">
              <label htmlFor="mdAddBillingAddress" className="md-add-label">
                Billing Street Address <span className="req-blue">*</span>
              </label>
              <input
                className="md-add-input"
                id="mdAddBillingAddress"
                type="text"
                value={billingAddressValue}
                onChange={(event) => setBillingAddressValue(event.target.value)}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddBillingCity" className="md-add-label">
                Billing City <span className="req-blue">*</span>
              </label>
              <input
                className="md-add-input"
                id="mdAddBillingCity"
                type="text"
                defaultValue={resident?.city || (isEditMode ? '' : 'Mount Pleasant')}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddBillingState" className="md-add-label">
                Billing State <span className="req-blue">*</span>
              </label>
              <input
                className="md-add-input"
                id="mdAddBillingState"
                type="text"
                defaultValue={resident?.state || resident?.st || (isEditMode ? '' : 'SC')}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddBillingZip" className="md-add-label">
                Billing Zip Code <span className="req-blue">*</span>
              </label>
              <input
                className="md-add-input"
                id="mdAddBillingZip"
                type="text"
                defaultValue={resident?.zip || (isEditMode ? '' : '29466')}
              />
            </div>
          </div>
        </div>

        <AddressMap
          address={billingAddressValue || [
            streetNumberValue.trim(),
            streetNameValue.trim()
          ].filter(Boolean).join(' ')}
          city={resident?.city || ''}
          state={resident?.state || resident?.st || ''}
          zip={resident?.zip || ''}
        />

        {/* Card 4: Contact Information */}
        <div className="md-card">
          <div className="md-card-title">Primary Contact</div>
          <div className="md-card-grid">
            <div className="md-form-group">
              <label htmlFor="mdAddHomePhone" className="md-add-label">Home Phone</label>
              <input
                className="md-add-input"
                id="mdAddHomePhone"
                type="text"
                defaultValue={resident?.phone || ''}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddCell" className="md-add-label">Cell Number</label>
              <input
                className="md-add-input"
                id="mdAddCell"
                type="text"
                defaultValue={resident?.primaryCell || ''}
              />
            </div>

            <div className="md-form-group span-2">
              <label htmlFor="mdAddEmail" className="md-add-label">Primary E-Mail</label>
              <input
                className="md-add-input"
                id="mdAddEmail"
                type="text"
                defaultValue={resident?.email || ''}
              />
            </div>
          </div>
        </div>

        {/* Card 5: Co-Owner Information */}
        <div className="md-card">
          <div className="md-card-title">Additional Owner Information</div>
          <div className="md-card-grid">
            <div className="md-form-group">
              <label htmlFor="mdAddAddlFirst" className="md-add-label">First Name</label>
              <input
                className="md-add-input"
                id="mdAddAddlFirst"
                type="text"
                defaultValue={resident?.addlFirst || ''}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddAddlMiddle" className="md-add-label">Middle Name</label>
              <input
                className="md-add-input"
                id="mdAddAddlMiddle"
                type="text"
                defaultValue={resident?.addlMiddle || ''}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddAddlLast" className="md-add-label">Last Name</label>
              <input
                className="md-add-input"
                id="mdAddAddlLast"
                type="text"
                defaultValue={resident?.addlLast || ''}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddAddlCell" className="md-add-label">Cell Number</label>
              <input
                className="md-add-input"
                id="mdAddAddlCell"
                type="text"
                defaultValue={resident?.secondaryCell || ''}
              />
            </div>

            <div className="md-form-group span-2">
              <label htmlFor="mdAddAddlEmail" className="md-add-label">E-Mail</label>
              <input
                className="md-add-input"
                id="mdAddAddlEmail"
                type="text"
                defaultValue={resident?.addlEmail || ''}
              />
            </div>
          </div>
        </div>

        {/* Card 6: Property & Rates */}
        <div className="md-card">
          <div className="md-card-title">Property Details & Dues</div>
          <div className="md-card-grid">
            <div className="md-form-group">
              <label htmlFor="mdAddPropertyType" className="md-add-label">
                Property Type
              </label>
              <select
                className="md-add-input"
                id="mdAddPropertyType"
                defaultValue={resident?.type || ''}
              >
                <option value=""></option>
                <option value="L">Lot (L)</option>
                <option value="H">House (H)</option>
                <option value="R">Rental (R)</option>
              </select>
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddMoveIn" className="md-add-label">Move In Date</label>
              <input
                className="md-add-input"
                id="mdAddMoveIn"
                type="text"
                placeholder="mm/dd/yyyy"
                defaultValue={resident?.moveInDate || ''}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddAnnualRate" className="md-add-label">
                Annual Dues Rate <span className="req-blue">*</span>
              </label>
              <select
                className="md-add-input"
                id="mdAddAnnualRate"
                defaultValue={resident?.annualRate || 'Rate Code A'}
              >
                <option value="Rate Code A">Rate Code A</option>
              </select>
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddAnnualDues" className="md-add-label">Annual Dues</label>
              <input
                className="md-add-input center-text font-bold"
                id="mdAddAnnualDues"
                type="text"
                defaultValue={resident?.annualDues || (isEditMode ? '' : '1800')}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddSpecialRate" className="md-add-label">
                Special Assm't Rate <span className="req-blue">*</span>
              </label>
              <select
                className="md-add-input"
                id="mdAddSpecialRate"
                defaultValue={resident?.specialRate || 'Rate Code A'}
              >
                <option value="Rate Code A">Rate Code A</option>
              </select>
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddSpecialDues" className="md-add-label">Special Assm't</label>
              <input
                className="md-add-input center-text font-bold"
                id="mdAddSpecialDues"
                type="text"
                defaultValue={resident?.specialDues || (isEditMode ? '' : '75')}
              />
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddACH" className="md-add-label">EasyPay ACH</label>
              <select
                className="md-add-input"
                id="mdAddACH"
                defaultValue={achValue}
              >
                <option value=""></option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="md-form-group">
              <label htmlFor="mdAddProRata" className="md-add-label">Current Yr ProRata%</label>
              <input
                className="md-add-input"
                id="mdAddProRata"
                type="text"
                defaultValue={resident?.proRata || ''}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="md-notes-section">
        <div className="md-form-group">
          <label htmlFor="mdAddNotes" className="md-card-title-inline">Resident Directory Notes</label>
          <textarea
            className="md-add-notes"
            id="mdAddNotes"
            defaultValue={resident?.notes || ''}
            placeholder="Add directory notes here..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="md-add-footer">
        <div className="md-footer-notes">
          <div><span className="req-red">*</span> If property is corporate owned, insert <strong>"Owner"</strong> in First Name.</div>
          <div><span className="req-blue">*</span> / <span className="req-red">*</span> Required fields.</div>
        </div>
        <button
          type="button"
          id="btnMDAddResidentEnterData"
          className="md-add-enter-btn"
          onClick={handleEnterData}
        >
          {isEditMode ? 'Update Resident' : 'Save Resident'}
        </button>
      </div>
    </div>
  );
}

export default AddResidentUF;
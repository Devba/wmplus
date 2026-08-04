


import { useRef, useState } from 'react';

import './AddResidentUF.css';

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
    <div
      ref={formRef}
      className="md-add-uf"
    >
      <div
        className="md-add-title"
        id="mdResidentUFTitle"
      >
        {isEditMode
          ? "This form Edits this Resident's data in the Main Directory"
          : 'This form enters new Street Addresses with Resident Data into the Main Directory'}
      </div>

      <div className="md-add-video-label">
        See Instructional Video Here:
      </div>

      <button
        type="button"
        className="md-add-info-btn"
      >
        i
      </button>

      <div className="md-add-section md-add-primary-title">
        Primary Owner Information:
      </div>

      <label className="md-add-label lbl-first">
        First Name{' '}
        <span className="req-blue">*</span>
        <span className="req-red">*</span>
      </label>

      <input
        className="md-add-input inp-first"
        id="mdAddFirstName"
        type="text"
        defaultValue={
          resident?.firstName || ''
        }
      />

      <label className="md-add-label lbl-middle">
        Middle Name
      </label>

      <input
        className="md-add-input inp-middle"
        id="mdAddMiddleName"
        type="text"
        defaultValue={
          resident?.middleName || ''
        }
      />

      <label className="md-add-label lbl-last">
        Last Name{' '}
        <span className="req-blue">*</span>
      </label>

      <input
        className="md-add-input inp-last"
        id="mdAddLastName"
        type="text"
        defaultValue={
          resident?.lastName || ''
        }
      />

      <label className="md-add-label lbl-prefix">
        Special Prefix
      </label>

      <input
        className="md-add-input inp-prefix"
        id="mdAddPrefix"
        type="text"
        defaultValue={
          resident?.prefix || ''
        }
      />

      <label className="md-add-label lbl-acct">
        Account Number
      </label>

      <input
        className="md-add-input inp-acct"
        id="mdAddAcct"
        type="text"
        value={
          isEditMode
            ? resident?.acctNo ||
              resident?.acct ||
              ''
            : ''
        }
        readOnly
        tabIndex={-1}
      />

      <label className="md-add-label lbl-streetnum">
        Street Address #{' '}
        <span className="req-blue">*</span>
      </label>

      <input
        className="md-add-input inp-streetnum"
        id="mdAddStreetNum"
        type="text"
        value={streetNumberValue}
        onChange={(event) => {
          const nextValue =
            event.target.value;

          setStreetNumberValue(nextValue);

          if (!isEditMode) {
            updateBillingAddress(
              nextValue,
              streetNameValue
            );
          }
        }}
      />

      <label className="md-add-label lbl-street">
        Street Address{' '}
        <span className="req-blue">*</span>
      </label>

      <select
        className="md-add-input inp-street"
        id="mdAddStreetAddress"
        value={streetNameValue}
        onChange={(event) => {
          const nextValue =
            event.target.value;

          setStreetNameValue(nextValue);

          if (!isEditMode) {
            updateBillingAddress(
              streetNumberValue,
              nextValue
            );
          }
        }}
      >
        <option value=""></option>

        {availableStreetNames.map(
          (street) => (
            <option
              key={street}
              value={street}
            >
              {street}
            </option>
          )
        )}
      </select>

      <label className="md-add-label lbl-billing">
        Billing Street Address{' '}
        <span className="req-blue">*</span>
      </label>

      <input
        className="md-add-input inp-billing"
        id="mdAddBillingAddress"
        type="text"
        value={billingAddressValue}
        onChange={(event) =>
          setBillingAddressValue(
            event.target.value
          )
        }
      />

      <label className="md-add-label lbl-bcity">
        Billing City{' '}
        <span className="req-blue">*</span>
      </label>

      <input
        className="md-add-input inp-bcity"
        id="mdAddBillingCity"
        type="text"
        defaultValue={
          resident?.city ||
          (isEditMode
            ? ''
            : 'Mount Pleasant')
        }
      />

      <label className="md-add-label lbl-bstate">
        Billing State{' '}
        <span className="req-blue">*</span>
      </label>

      <input
        className="md-add-input inp-bstate"
        id="mdAddBillingState"
        type="text"
        defaultValue={
          resident?.state ||
          resident?.st ||
          (isEditMode ? '' : 'SC')
        }
      />

      <label className="md-add-label lbl-bzip">
        Billing Zip Code{' '}
        <span className="req-blue">*</span>
      </label>

      <input
        className="md-add-input inp-bzip"
        id="mdAddBillingZip"
        type="text"
        defaultValue={
          resident?.zip ||
          (isEditMode
            ? ''
            : '29466')
        }
      />

      <label className="md-add-label lbl-homephone">
        Home Phone
      </label>

      <input
        className="md-add-input inp-homephone"
        id="mdAddHomePhone"
        type="text"
        defaultValue={
          resident?.phone || ''
        }
      />

      <label className="md-add-label lbl-email">
        Primary E-Mail
      </label>

      <input
        className="md-add-input inp-email"
        id="mdAddEmail"
        type="text"
        defaultValue={
          resident?.email || ''
        }
      />

      <label className="md-add-label lbl-cell">
        Cell Number
      </label>

      <input
        className="md-add-input inp-cell"
        id="mdAddCell"
        type="text"
        defaultValue={
          resident?.primaryCell || ''
        }
      />

      <label className="md-add-label lbl-movein">
        Move In Date
      </label>

      <input
        className="md-add-input inp-movein"
        id="mdAddMoveIn"
        type="text"
        placeholder="mm/dd/yyyy"
        defaultValue={
          resident?.moveInDate || ''
        }
      />

      <label className="md-add-label lbl-proptype">
        Property Type
      </label>

      <select
        className="md-add-input inp-proptype"
        id="mdAddPropertyType"
        defaultValue={
          resident?.type || ''
        }
      >
        <option value=""></option>
        <option value="L">L</option>
        <option value="H">H</option>
        <option value="R">R</option>
      </select>

      <div className="md-add-prop-help">
        L = Lot
        <br />
        H = House
        <br />
        R = Rental
      </div>

      <label className="md-add-label lbl-annualrate">
        Annual Dues Rate{' '}
        <span className="req-blue">*</span>
      </label>

      <select
        className="md-add-input inp-annualrate"
        id="mdAddAnnualRate"
        defaultValue={
          resident?.annualRate ||
          'Rate Code A'
        }
      >
        <option value="Rate Code A">
          Rate Code A
        </option>
      </select>

      <label className="md-add-label lbl-annualdues">
        Annual Dues
      </label>

      <input
        className="md-add-input inp-annualdues"
        id="mdAddAnnualDues"
        type="text"
        defaultValue={
          resident?.annualDues ||
          (isEditMode ? '' : '1800')
        }
      />

      <label className="md-add-label lbl-specialrate">
        Special Assm&apos;t Rate{' '}
        <span className="req-blue">*</span>
      </label>

      <select
        className="md-add-input inp-specialrate"
        id="mdAddSpecialRate"
        defaultValue={
          resident?.specialRate ||
          'Rate Code A'
        }
      >
        <option value="Rate Code A">
          Rate Code A
        </option>
      </select>

      <label className="md-add-label lbl-specialdues">
        Special Assm&apos;t
      </label>

      <input
        className="md-add-input inp-specialdues"
        id="mdAddSpecialDues"
        type="text"
        defaultValue={
          resident?.specialDues ||
          (isEditMode ? '' : '75')
        }
      />

      <div className="md-add-section md-add-addl-title">
        Additional Owner Information:
      </div>

      <label className="md-add-label lbl-addfirst">
        First Name
      </label>

      <input
        className="md-add-input inp-addfirst"
        id="mdAddAddlFirst"
        type="text"
        defaultValue={
          resident?.addlFirst || ''
        }
      />

      <label className="md-add-label lbl-addmiddle">
        Middle Name
      </label>

      <input
        className="md-add-input inp-addmiddle"
        id="mdAddAddlMiddle"
        type="text"
        defaultValue={
          resident?.addlMiddle || ''
        }
      />

      <label className="md-add-label lbl-addlast">
        Last Name
      </label>

      <input
        className="md-add-input inp-addlast"
        id="mdAddAddlLast"
        type="text"
        defaultValue={
          resident?.addlLast || ''
        }
      />

      <label className="md-add-label lbl-addemail">
        E-Mail
      </label>

      <input
        className="md-add-input inp-addemail"
        id="mdAddAddlEmail"
        type="text"
        defaultValue={
          resident?.addlEmail || ''
        }
      />

      <label className="md-add-label lbl-addcell">
        Cell Number
      </label>

      <input
        className="md-add-input inp-addcell"
        id="mdAddAddlCell"
        type="text"
        defaultValue={
          resident?.secondaryCell || ''
        }
      />

      <label className="md-add-label lbl-ach">
        EasyPay ACH
      </label>

      <select
        className="md-add-input inp-ach"
        id="mdAddACH"
        defaultValue={achValue}
      >
        <option value=""></option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>

      <div className="md-add-ach-note">
        (Yes/No)
      </div>

      <label className="md-add-label lbl-prorata">
        Current Yr ProRata%
      </label>

      <input
        className="md-add-input inp-prorata"
        id="mdAddProRata"
        type="text"
        defaultValue={
          resident?.proRata || ''
        }
      />

      <div className="md-add-section md-add-notes-title">
        Resident Directory Notes:
      </div>

      <textarea
        className="md-add-notes"
        id="mdAddNotes"
        defaultValue={
          resident?.notes || ''
        }
      />

      <div className="md-add-corp-note">
        <span className="req-red">*</span>
        <br />
        Note: If property is
        <br />
        Corporate owned then
        <br />
        insert &quot;Owner&quot; in First
        <br />
        Name text box
      </div>

      <div className="md-add-required-note">
        <span className="req-blue">*</span>{' '}
        Required Entries
      </div>

      <button
        type="button"
        id="btnMDAddResidentEnterData"
        className="md-add-enter-btn"
        onClick={handleEnterData}
      >
        Enter Data
      </button>
    </div>
  );
}

export default AddResidentUF;
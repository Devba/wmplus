



import { useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../../../../../config/api';
import { closeOverlay } from '../../../../../engines';
import './EnterAssmtPaymentUF.css';



function accountFor(resident) {
  return String(
    resident?.acctNo ||
    resident?.ownerAcct ||
    resident?.acct ||
    ''
  ).trim();
}

function nameFor(resident) {
  return String(
    resident?.displayName ||
    resident?.ownerName ||
    ''
  ).trim();
}

function addressFor(resident) {
  return String(
    resident?.residence ||
    resident?.address ||
    ''
  ).trim();
}

function splitResidentName(fullName) {
  const name = String(fullName || '').trim();

  if (!name) {
    return {
      firstName: '',
      lastName: ''
    };
  }

  if (name.includes(',')) {
    const [lastName, firstName] =
      name.split(',').map((part) => part.trim());

    return {
      firstName: firstName || '',
      lastName: lastName || ''
    };
  }

  const parts = name.split(/\s+/);

  return {
    firstName:
      parts.length > 1
        ? parts.slice(0, -1).join(' ')
        : '',
    lastName:
      parts.length > 1
        ? parts.at(-1)
        : parts[0]
  };
}

function numberFromMoney(value) {
  const parsed = Number.parseFloat(
    String(value || '')
      .replace(/[$,\s]/g, '')
  );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function moneyText(value) {
  const amount = numberFromMoney(value);

  return amount.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}

function currentDateText() {
  const today = new Date();

  return [
    today.getMonth() + 1,
    today.getDate(),
    today.getFullYear()
  ].join('/');
}

function EnterAssmtPaymentUF({
  residents = [],
  onAddPayment
}) {

  const [selectedAccount, setSelectedAccount] =
    useState('');

  const [selectedResident, setSelectedResident] =
    useState(null);

  const [annualPayment, setAnnualPayment] =
    useState('');

  const [specialPayment, setSpecialPayment] =
    useState('');

  const [dateDeposited, setDateDeposited] =
    useState(currentDateText());

  const [checkNumber, setCheckNumber] =
    useState('');

    const [residentNameQuery, setResidentNameQuery] =
  useState('');

  const [residentNameDropdownOpen, setResidentNameDropdownOpen] =
  useState(false);

  const [residentAddressQuery, setResidentAddressQuery] =
  useState('');

  const [residentAddressDropdownOpen, setResidentAddressDropdownOpen] =
  useState(false);

  const residentNameComboRef = useRef(null);
  const residentAddressComboRef = useRef(null);

  const [searchResidentRows, setSearchResidentRows] =
  useState([]);

  const searchResidents = async (
  searchText,
  sortMode = 'name'
) => {
  const trimmedSearch =
    String(searchText || '').trim();

  try {
    const response = await fetch(
      `${API_BASE_URL}/residents?search=${encodeURIComponent(
        trimmedSearch
      )}&offset=0&sort=${sortMode}`
    );

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const data = await response.json();
    const rows = data.residents || [];

    return rows.map((resident) => ({
      acctNo: String(resident.account_id || ''),
      firstName: resident.first_name || '',
      lastName: resident.last_name || '',
      displayName:
        `${resident.first_name || ''} ${resident.last_name || ''}`.trim(),
      residence: resident.residence_address || ''
    }));
  } catch (error) {
    console.error(
      'APR resident search error:',
      error
    );

    return [];
  }
};


  const handleResidentNameQueryChange = async (event) => {
  const value = event.target.value;
  const searchText = value.trim().toLowerCase();

  setResidentNameQuery(value);
  setResidentNameDropdownOpen(true);

  const localMatches = sortedByName.filter((resident) => {
    const searchableText =
      `${resident.lastName || ''} ${resident.firstName || ''} ${nameFor(resident)}`
        .toLowerCase();

    return searchableText.includes(searchText);
  });

  if (searchText.length < 3 || localMatches.length > 0) {
    setSearchResidentRows(localMatches);
    return;
  }

  const serverMatches =
  await searchResidents(value, 'name');


setSearchResidentRows(serverMatches);
};

const handleResidentAddressQueryChange = async (event) => {
  const value = event.target.value;
  const searchText = value.trim().toLowerCase();

  setResidentAddressQuery(value);
  setResidentAddressDropdownOpen(true);

  const localMatches = sortedByAddress.filter((resident) => {
    const searchableText =
      `${addressFor(resident)} ${resident.lastName || ''} ${resident.firstName || ''}`
        .toLowerCase();

    return searchableText.includes(searchText);
  });

  if (searchText.length < 3 || localMatches.length > 0) {
    setSearchResidentRows(localMatches);
    return;
  }

  const serverMatches =
    await searchResidents(value, 'address');

  setSearchResidentRows(serverMatches);
};


   const selectResidentFromNameSearch = (resident) => {
  handleResidentSelection(
    accountFor(resident)
  );

  setResidentNameQuery(
    `${resident.lastName}, ${resident.firstName} — ${addressFor(resident)} — ${accountFor(resident)}`
  );

  setResidentAddressQuery(
    addressFor(resident)
  );

  setResidentNameDropdownOpen(false);
};

const selectResidentFromAddressSearch = (resident) => {
  handleResidentSelection(
    accountFor(resident)
  );

  setResidentNameQuery(
    `${resident.lastName}, ${resident.firstName} — ${addressFor(resident)} — ${accountFor(resident)}`
  );

  setResidentAddressQuery(
    addressFor(resident)
  );

  setResidentAddressDropdownOpen(false);
};

  useEffect(() => {
  const handleClickOutsideResidentLookups = (event) => {
    if (
      residentNameComboRef.current &&
      !residentNameComboRef.current.contains(event.target)
    ) {
      setResidentNameDropdownOpen(false);
    }

    if (
      residentAddressComboRef.current &&
      !residentAddressComboRef.current.contains(event.target)
    ) {
      setResidentAddressDropdownOpen(false);
    }
  };

  document.addEventListener(
    'mousedown',
    handleClickOutsideResidentLookups
  );

  return () => {
    document.removeEventListener(
      'mousedown',
      handleClickOutsideResidentLookups
    );
  };
}, []);

  const sortedByAccount = useMemo(
    () =>
      [...residents].sort((a, b) =>
        accountFor(a).localeCompare(
          accountFor(b),
          undefined,
          { numeric: true }
        )
      ),
    [residents]
  );

  const sortedByName = useMemo(
  () =>
    [...residents].sort((a, b) => {
      const lastCompare =
        String(a.lastName || '').localeCompare(
          String(b.lastName || ''),
          undefined,
          { sensitivity: 'base' }
        );

      if (lastCompare !== 0) {
        return lastCompare;
      }

      return String(a.firstName || '').localeCompare(
        String(b.firstName || ''),
        undefined,
        { sensitivity: 'base' }
      );
    }),
  [residents]
);

  const sortedByAddress = useMemo(
    () =>
      [...residents].sort((a, b) =>
        addressFor(a).localeCompare(
          addressFor(b),
          undefined,
          { numeric: true }
        )
      ),
    [residents]
  );

  const residentName =
    nameFor(selectedResident);

  const {
    firstName,
    lastName
  } = splitResidentName(residentName);

  const mapCurrentResident = (resident) => ({
    acctNo: String(resident?.ResidentAccountID || ''),
    firstName: resident?.FirstName || '',
    lastName: resident?.LastName || '',
    displayName:
      resident?.DisplayName ||
      `${resident?.FirstName || ''} ${resident?.LastName || ''}`.trim(),
    residence: resident?.ResidenceAddress || '',
    email: resident?.EmailAddress || '',
    addlFirst: resident?.AdditionalOwnerFirstName || '',
    addlLast: resident?.AdditionalOwnerLastName || '',
    addlEmail: resident?.AdditionalOwnerEmail || '',
    assmtPaidYTD: resident?.AnnualDuesPaidYTD ?? '',
    assmtDue: resident?.AnnualDuesBalance ?? '',
    specialPaidYTD: resident?.SpecialAssessmentPaidYTD ?? '',
    specialDue: resident?.SpecialAssessmentBalance ?? '',
    annualRate: resident?.AnnualDuesRate ?? '',
    specialRate: resident?.SpecialAssessmentRate ?? '',
    finesDue: resident?.FinesFeesBalance ?? '',
    totalPaidYTD:
      Number(resident?.AnnualDuesPaidYTD || 0) +
      Number(resident?.SpecialAssessmentPaidYTD || 0),
    totalAnnual: resident?.AnnualDuesPaidYTD ?? '',
    totalSpecial: resident?.SpecialAssessmentPaidYTD ?? '',
    totalCredits:
      resident?.ResidentCreditBalance ??
      resident?.PriorYearCredit ??
      ''
  });

  const handleResidentSelection = async (
    accountNumber
  ) => {
    const accountId =
      String(accountNumber || '').trim();

    setSelectedAccount(accountId);
    setSelectedResident(null);

    if (!accountId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/residents/${encodeURIComponent(
          accountId
        )}/current`
      );

      const result = await response.json();

      if (!response.ok || !result?.ok || !result?.resident) {
        if (result?.code === 'RESIDENT_NOT_FOUND') {
          window.alert(
            result.message ||
            'This resident record is no longer current. Please select the current resident.'
          );
        } else {
          window.alert(
            result?.message ||
            'Unable to retrieve the current resident record.'
          );
        }

        setSelectedAccount('');
        setSelectedResident(null);
        setResidentNameQuery('');
        setResidentAddressQuery('');
        return;
      }

      const currentResident =
        mapCurrentResident(result.resident);

      setSelectedResident(currentResident);
      setSelectedAccount(
        accountFor(currentResident)
      );
    } catch (error) {
      console.error(
        'APR current resident load error:',
        error
      );

      window.alert(
        'Unable to retrieve the current resident record.'
      );

      setSelectedAccount('');
      setSelectedResident(null);
    }
  };

  const handleMoneyChange = (
    setter,
    value
  ) => {
    let cleaned = String(value)
      .replace(/[^0-9.]/g, '');

    const parts = cleaned.split('.');

    if (parts.length > 2) {
      cleaned =
        parts[0] +
        '.' +
        parts.slice(1).join('');
    }

    if (cleaned.includes('.')) {
      const [whole, decimals = ''] =
        cleaned.split('.');

      cleaned =
        whole +
        '.' +
        decimals.slice(0, 2);
    }

    setter(cleaned);
  };

  const formatMoneyField = (
    setter,
    value
  ) => {
    if (!String(value).trim()) {
      return;
    }

    setter(moneyText(value));
  };

  const clearForNextPayment = () => {
  setSelectedAccount('');
  setSelectedResident(null);
  setResidentNameQuery('');
  setResidentAddressQuery('');
  setAnnualPayment('');
  setSpecialPayment('');
  setCheckNumber('');
  };

  const handleEnterPayment = async (
  keepOpen = false
    ) => {

    if (!selectedResident) {
      window.alert(
        'Please select a resident before entering payment.'
      );
      return;
    }

    const annualPaymentNumber =
  numberFromMoney(annualPayment);

const specialPaymentNumber =
  numberFromMoney(specialPayment);

if (
  annualPaymentNumber <= 0 &&
  specialPaymentNumber <= 0
) {
  window.alert(
    'Please enter an Annual Dues or Special Assessment payment amount.'
  );
  return;
}

    if (!String(dateDeposited).trim()) {
      window.alert(
        'Please enter the Date Deposited.'
      );
      return;
    }

    

    const totalPayment =
      annualPaymentNumber +
      specialPaymentNumber;

    

    const newPayment = {
      ownerAcct:
        accountFor(selectedResident),

      ownerName: residentName,

      address:
        addressFor(selectedResident),

      amount:
        `$${moneyText(totalPayment)}`,

      dateDeposited,

      dateCleared: '',

      monthCleared: '',

      annualPayment:
        `$${moneyText(annualPaymentNumber)}`,

      specialPayment:
        specialPaymentNumber > 0
          ? `$${moneyText(specialPaymentNumber)}`
          : '',

      credit: '',

      totalPaidYTD:
        `$${moneyText(
          numberFromMoney(
            selectedResident.totalPaidYTD
          ) + totalPayment
        )}`,

      totalAnnual:
        `$${moneyText(
          numberFromMoney(
            selectedResident.totalAnnual ||
            selectedResident.assmtPaidYTD
          ) + annualPaymentNumber
        )}`,

      totalSpecial:
        `$${moneyText(
          numberFromMoney(
            selectedResident.totalSpecial ||
            selectedResident.specialPaidYTD
          ) + specialPaymentNumber
        )}`,

      totalCredits:
        selectedResident.totalCredits ||
        '$0.00',

      transaction: '',

      yeCreditUsed: '',
      yeAnnual: '',
      yeSpecial: '',
      paidPrior: '',
      excessCredit: '',

      annualRate:
        selectedResident.annualRate || '',

      specialRate:
        selectedResident.specialRate || '',

      depositInvoice: '',

      electronic: checkNumber
  ? checkNumber
  : 'No',

uploaded: 'No',

checkNumber
    };

    if (
      typeof onAddPayment !== 'function'
    ) {
      window.alert(
        'Assessment payment entry function is not available.'
      );
      return;
    }

    

if (keepOpen) {
  clearForNextPayment();

  window.alert(
    'Assessment payment entered successfully. Continue with the next resident.'
  );
} else {
  closeOverlay();
}

const payload = {
  residentAccountId:
    accountFor(selectedResident),

  paymentType:
    specialPaymentNumber > 0
      ? 'SpecialAssessment'
      : 'AnnualDues',

  annualDuesPayment:
    annualPaymentNumber,

  specialAssessmentPayment:
    specialPaymentNumber,

  paymentDate:
    dateDeposited,

  creditAmount:
  0,

electronicPaymentId:
  checkNumber || null,

operatorId:
  'SYSTEM'
};

    try {
      const response = await fetch(
        `${API_BASE_URL}/apr/enter-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        console.error(
          'APR server rejected payment:',
          result
        );
      }

      if (response.ok && result?.success) {
        const serverRow = result.rows?.[0];

        if (serverRow) {
          newPayment.transaction =
            serverRow.transactionNumber || '';
           onAddPayment(
          newPayment,
          serverRow.transactionNumber
        );
        }
      }


    } catch (error) {
      console.error(
        'APR payment server error:',
        error
      );
    }
  };

  return (
    <div className="apr-enter-react-uf">
      <div className="apr-enter-blue-title">
        CURRENT RESIDENT STATUS:
      </div>

      <label className="apr-enter-label apr-enter-acct-label">
        ACCT #
      </label>

      <select
        className="apr-enter-input apr-enter-acct"
        value={selectedAccount}
        onChange={(event) =>
          handleResidentSelection(
            event.target.value
          )
        }
      >
        <option value=""></option>

        {sortedByAccount.map(
          (resident) => (
            <option
              key={accountFor(resident)}
              value={accountFor(resident)}
            >
              {accountFor(resident)}
            </option>
          )
        )}
      </select>

      <label className="apr-enter-label apr-enter-first-label">
        FIRST NAME
      </label>

      <input
        className="apr-enter-input apr-enter-first"
        value={firstName}
        readOnly
      />

      <label className="apr-enter-label apr-enter-last-label">
        LAST NAME
      </label>

      <input
        className="apr-enter-input apr-enter-last"
        value={lastName}
        readOnly
      />

      <label className="apr-enter-label apr-enter-address-label">
        RESIDENT ADDRESS
      </label>

      <input
        className="apr-enter-input apr-enter-address"
        value={addressFor(selectedResident)}
        readOnly
      />

      <label className="apr-enter-label apr-enter-email-label">
        RESIDENT EMAIL ADDRESS
      </label>

      <input
        className="apr-enter-input apr-enter-email"
        value={selectedResident?.email || ''}
        readOnly
      />

      <label className="apr-enter-label apr-enter-add-first-label">
        ADDITIONAL RESIDENT FIRST NAME
      </label>

      <input
        className="apr-enter-input apr-enter-add-first"
        value={
          selectedResident?.addlFirst || ''
        }
        readOnly
      />

      <label className="apr-enter-label apr-enter-add-last-label">
        ADDITIONAL RESIDENT LAST NAME
      </label>

      <input
        className="apr-enter-input apr-enter-add-last"
        value={
          selectedResident?.addlLast || ''
        }
        readOnly
      />

      <label className="apr-enter-label apr-enter-add-email-label">
        ADDITIONAL RESIDENT EMAIL ADDRESS
      </label>

      <input
        className="apr-enter-input apr-enter-add-email"
        value={
          selectedResident?.addlEmail || ''
        }
        readOnly
      />

      <label className="apr-enter-label apr-enter-paid-label">
        ASSMT PAID YTD
      </label>

      <input
        className="apr-enter-input apr-enter-paid"
        value={
          selectedResident?.assmtPaidYTD ||
          selectedResident?.totalAnnual ||
          ''
        }
        readOnly
      />

      <label className="apr-enter-label apr-enter-due-label">
        ASSMT DUE
      </label>

      <input
        className="apr-enter-input apr-enter-due"
        value={
          selectedResident?.assmtDue || ''
        }
        readOnly
      />

      <label className="apr-enter-label apr-enter-special-paid-label">
        SPECIAL ASSMT
        <br />
        PAID YTD
      </label>

      <input
        className="apr-enter-input apr-enter-special-paid"
        value={
          selectedResident?.specialPaidYTD ||
          selectedResident?.totalSpecial ||
          ''
        }
        readOnly
      />

      <label className="apr-enter-label apr-enter-special-due-label">
        SPECIAL ASSMT
        <br />
        DUE
      </label>

      <input
        className="apr-enter-input apr-enter-special-due"
        value={
          selectedResident?.specialDue || ''
        }
        readOnly
      />

      <label className="apr-enter-label apr-enter-annual-rate-label">
        Annual Dues Rate
      </label>

      <input
        className="apr-enter-input apr-enter-annual-rate"
        value={
          selectedResident?.annualRate || ''
        }
        readOnly
      />

      <label className="apr-enter-label apr-enter-special-rate-label">
        Special Assm&apos;t Rate
      </label>

      <input
        className="apr-enter-input apr-enter-special-rate"
        value={
          selectedResident?.specialRate || ''
        }
        readOnly
      />

      <label className="apr-enter-label apr-enter-fines-label">
        OTHER FINES &amp;
        <br />
        LATE FEES DUE
      </label>

      <input
        className="apr-enter-input apr-enter-fines"
        value={
          selectedResident?.finesDue || ''
        }
        readOnly
      />

      <div className="apr-enter-section-title">
        ANNUAL DUES PAYMENT ENTRY:
      </div>

      <label className="apr-enter-label apr-enter-payment-label">
        INSERT PAYMT $$
      </label>

      <input
        className="apr-enter-input apr-enter-payment"
        value={annualPayment}
        onChange={(event) =>
          handleMoneyChange(
            setAnnualPayment,
            event.target.value
          )
        }
        onBlur={() =>
          formatMoneyField(
            setAnnualPayment,
            annualPayment
          )
        }
      />

      <label className="apr-enter-label apr-enter-date-label">
        DATE DEPOSITED
      </label>

      <input
        className="apr-enter-input apr-enter-date"
        value={dateDeposited}
        onChange={(event) =>
          setDateDeposited(
            event.target.value
          )
        }
      />

      <div className="apr-enter-date-note">
        (MM/DD/YYYY)
      </div>

      <label className="apr-enter-label apr-enter-check-label">
        CHECK NUMBER
      </label>

      <input
        className="apr-enter-input apr-enter-check"
        inputMode="numeric"
        value={checkNumber}
        onChange={(event) =>
            setCheckNumber(
            event.target.value.replace(/[^0-9]/g, '')
            )
        }
        />

      <label className="apr-enter-label apr-enter-special-payment-label">
        SPECIAL ASSMT
        <br />
        PAY&apos;MT ENTRY
      </label>

      <input
        className="apr-enter-input apr-enter-special-payment"
        value={specialPayment}
        onChange={(event) =>
          handleMoneyChange(
            setSpecialPayment,
            event.target.value
          )
        }
        onBlur={() =>
          formatMoneyField(
            setSpecialPayment,
            specialPayment
          )
        }
      />

      <div className="apr-enter-red-star apr-enter-star-one">
        *
      </div>

      <div className="apr-enter-red-star apr-enter-star-two">
        *
      </div>

      <div className="apr-enter-payment-note">
        If Quarterly or Monthly Annual Dues
        <br />
        payment method, then enter Special
        <br />
        Assessment payments here
      </div>

      <button
          type="button"
          className="apr-enter-submit"
          onClick={() =>
            handleEnterPayment(false)
          }
        >
          ENTER
        </button>

      <button
        type="button"
        className="apr-enter-multiple"
        onClick={() =>
          handleEnterPayment(true)
        }
      >
        ENTER MULTIPLE RESIDENT ASSM&apos;T DEPOSITS
      </button>

      <div className="apr-enter-search-title">
        Quick Resident Acct # Search - 2 Way
      </div>

      <label className="apr-enter-search-label apr-enter-name-search-label">
        Resident Name
      </label>

      <div
          className="apr-enter-resident-combo apr-enter-name-combo"
          ref={residentNameComboRef}
        >
  <input
    type="text"
    className="apr-enter-search-input apr-enter-name-search"
    value={residentNameQuery}
    placeholder="Select resident"
    onFocus={() => {
      setSearchResidentRows(sortedByName);
      setResidentNameDropdownOpen(true);
    }}
    onChange={handleResidentNameQueryChange}
    autoComplete="off"
  />

  {residentNameDropdownOpen && (
    <div className="apr-enter-resident-dropdown">
      {searchResidentRows.map((resident) => (
        <button
          key={accountFor(resident)}
          type="button"
          className="apr-enter-resident-option"
          onClick={() =>
            selectResidentFromNameSearch(resident)
          }
        >
          {resident.lastName}, {resident.firstName} — {addressFor(resident)} — {accountFor(resident)}
        </button>
      ))}
    </div>
  )}
</div>

      <label className="apr-enter-search-label apr-enter-address-search-label">
        Resident Address
      </label>

      <div
  className="apr-enter-resident-combo apr-enter-address-combo"
  ref={residentAddressComboRef}
>
  <input
    type="text"
    className="apr-enter-search-input apr-enter-address-search"
    value={residentAddressQuery}
    placeholder="Select resident address"
    onFocus={() => {
      setSearchResidentRows(sortedByAddress);
      setResidentAddressDropdownOpen(true);
    }}

    onChange={
      handleResidentAddressQueryChange
    }
    autoComplete="off"
  />

  {residentAddressDropdownOpen && (
    <div className="apr-enter-resident-dropdown">
      {searchResidentRows.map((resident) => (
        <button
          key={accountFor(resident)}
          type="button"
          className="apr-enter-resident-option"
          onClick={() =>
            selectResidentFromAddressSearch(
              resident
            )
          }
        >
          {addressFor(resident)} — {resident.lastName}, {resident.firstName} — {accountFor(resident)}
        </button>
      ))}
    </div>
  )}
</div>



      <label className="apr-enter-search-label apr-enter-account-result-label">
        Resident Acct#
      </label>

      <input
        className="apr-enter-input apr-enter-account-result"
        value={selectedAccount}
        readOnly
      />
    </div>
  );
}

export default EnterAssmtPaymentUF;
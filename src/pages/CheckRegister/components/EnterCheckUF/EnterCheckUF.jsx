


import { useEffect, useMemo, useRef, useState } from 'react';
import './EnterCheckUF.css';
import { API_BASE_URL } from '../../../../config/api';
import { closeOverlay } from '../../../../engines/overlay/overlay-engine';






function formatMoney(value) {
  const amount = Number(
    String(value || '')
      .replace(/[$,]/g, '')
      .trim()
  );

  if (!Number.isFinite(amount)) {
    return '$0.00';
  }

  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
}

function parseMoney(value) {
  const amount = Number(
    String(value || '')
      .replace(/[$,]/g, '')
      .trim()
  );

  return Number.isFinite(amount) ? amount : 0;
}


const formatDateForDatabase = (dateText) => {
  const value = String(dateText || '').trim();

  if (!value) return null;

  const parts = value.replace(/-/g, '/').split('/');

  if (parts.length !== 3) return null;

  const month = String(parts[0]).padStart(2, '0');
  const day = String(parts[1]).padStart(2, '0');
  const year = parts[2];

  return `${year}-${month}-${day}`;
};






function formatDateForTransaction(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear());
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `CHK${month}${day}${year}-${hours}${minutes}${seconds}`;
}

function EnterCheckUF({ onAddCheck }) {
  const [banks, setBanks] = useState([]);
  const [glAccounts, setGLAccounts] = useState([]);
  const [residents, setResidents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showEntryChoice, setShowEntryChoice] = useState(false);
  const [pendingCheck, setPendingCheck] = useState(null);

useEffect(() => {
  async function loadBanks() {
    try {
      const response = await fetch(`${API_BASE_URL}/settings/banking`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const loadedBanks = (data.banks || []).map((bank) => ({
        ...bank,
        id: String(bank.id),
        name: `${bank.bankName} - ${bank.bankType} - ${bank.bankId}`
      }));

      setBanks(loadedBanks);
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  }

  loadBanks();
}, []);




useEffect(() => {
  async function loadCRGLAccounts() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/gl-options?screen=CR`
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      const rows = Array.isArray(data.glAccounts)
        ? data.glAccounts
        : Array.isArray(data)
          ? data
          : [];

      setServerGLAccounts(
      rows.map((gl) => ({
        bankId: String(gl.bankId || ''),
        category: gl.glName || '',
        glNumber: String(gl.glNumber || ''),
        pc: String(gl.pc || ''),
        parentGl: String(gl.parentGl || '')
      }))
    );

    } catch (error) {
      console.error(
        'Error loading Check Register GL options:',
        error
      );

      setServerGLAccounts([]);
    }
  }

  loadCRGLAccounts();
}, []);


useEffect(() => {
  async function loadResidents() {
    try {
      const residentResponse = await fetch(
        `${API_BASE_URL}/residents?offset=0`
      );

      if (!residentResponse.ok) {
        throw new Error(
          `Residents server returned ${residentResponse.status}`
        );
      }

      const residentData = await residentResponse.json();
      const residentRows = residentData.residents || [];

      setResidentOffset(residentData.offset || 0);
      setResidentHasMore(Boolean(residentData.hasMore));

      const loadedResidents = residentRows.map((resident) => ({
        id: String(resident.account_id),

        lastName:
          resident.last_name ||
          resident.display_name ||
          resident.account_id ||
          '',

        fullName:
          resident.display_name ||
          `${resident.first_name || ''} ${resident.last_name || ''}`.trim(),

        address: resident.residence_address || ''
      }));

      setResidents(loadedResidents);

    } catch (error) {
      console.error(
        'Error loading residents:',
        error
      );

      setResidents([]);
    }
  }

  async function loadVendors() {
    try {
      const vendorResponse = await fetch(
        `${API_BASE_URL}/vendors`
      );

      if (!vendorResponse.ok) {
        throw new Error(
          `Vendors server returned ${vendorResponse.status}`
        );
      }

      const vendorRows = await vendorResponse.json();

      const loadedVendors = vendorRows.map((vendor) => ({
        id: String(vendor.vendor_id),
        name: vendor.vendor_name || ''
      }));

      setVendors(loadedVendors);

    } catch (error) {
      console.error(
        'Error loading vendors:',
        error
      );

      setVendors([]);
    }
  }

  loadResidents();
  loadVendors();
}, []);


const loadNextResidentChunk = async () => {
  if (!residentHasMore) return;

  try {
    const nextOffset = residentOffset + 500;

    const response = await fetch(
      `${API_BASE_URL}/residents?offset=${nextOffset}`
    );

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    const rows = data.residents || [];

    const nextResidents = rows.map((resident) => ({
      id: String(resident.account_id),
      lastName:
  resident.last_name ||
  resident.display_name ||
  resident.account_id ||
  '',
      fullName:
        resident.display_name ||
        `${resident.first_name || ''} ${resident.last_name || ''}`.trim(),
      address: resident.residence_address || ''
    }));

    setResidents((currentResidents) => [
      ...currentResidents,
      ...nextResidents
    ]);

    setResidentOffset(data.offset || nextOffset);
    setResidentHasMore(Boolean(data.hasMore));
  } catch (error) {
    console.error(
      'Error loading next resident chunk:',
      error
    );
  }
};

const searchResidents = async (searchText, sortMode = 'name') => {
  const trimmedSearch = String(searchText || '').trim();

  try {
    const response = await fetch(
      `${API_BASE_URL}/residents?search=${encodeURIComponent(trimmedSearch)}&offset=0&sort=${sortMode}`
    );

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    const rows = data.residents || [];

    const matchingResidents = rows.map((resident) => ({
      id: String(resident.account_id),
      lastName:
  resident.last_name ||
  resident.display_name ||
  resident.account_id ||
  '',
      fullName:
        resident.display_name ||
        `${resident.first_name || ''} ${resident.last_name || ''}`.trim(),
      address: resident.residence_address || ''
    }));

    setResidents(matchingResidents);
    setResidentOffset(data.offset || 0);
    setResidentHasMore(Boolean(data.hasMore));
  } catch (error) {
    console.error(
      'Error searching residents:',
      error
    );
  }
};


const handleResidentNameQueryChange = async (event) => {
  const value = event.target.value;

  setResidentNameQuery(value);
  setResidentNameDropdownOpen(true);

  await searchResidents(value);
};

const selectResidentFromSearch = (resident) => {
  loadResident(resident.id);

  setResidentNameQuery(
    `${resident.lastName} | ${resident.id} | ${resident.address}`
  );

  setResidentNameDropdownOpen(false);
};

const handleResidentAddressQueryChange = async (event) => {
  const value = event.target.value;

  setResidentAddressQuery(value);
  setResidentAddressDropdownOpen(true);

  await searchResidents(value, 'address');
};

const selectResidentFromAddressSearch = (resident) => {
  loadResident(resident.id);

  setResidentAddressQuery(resident.address || '');

  setResidentAddressDropdownOpen(false);
};


  const [bankId, setBankId] = useState('');
  const [checkAmount, setCheckAmount] = useState('');
  const [entityId, setEntityId] = useState('');
  const [entityName, setEntityName] = useState('');
  const [residentAddress, setResidentAddress] = useState('');

  const [glCategory, setGLCategory] = useState('');
  const [glNumber, setGLNumber] = useState('');
  const [glAccountName, setGLAccountName] = useState('');
  const [showGLSelectionUF, setShowGLSelectionUF] =
  useState(false);

  const [selectedGLParent, setSelectedGLParent] =
  useState('');

  const [selectedGLChild, setSelectedGLChild] =
  useState('');




  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('');
  const [vendorInvoiceDate, setVendorInvoiceDate] =
    useState('');
  const [vendorInvoiceAmount, setVendorInvoiceAmount] =
    useState('');

  const [checkNumber, setCheckNumber] = useState('');
  const [checkNotation, setCheckNotation] = useState('');
  const [serverGLAccounts, setServerGLAccounts] = useState([]);
  const [autoWithdrawal, setAutoWithdrawal] = useState(false);

  const [residentNameSearch, setResidentNameSearch] =
  useState('');
  const [residentNameQuery, setResidentNameQuery] = useState('');
  const [residentNameDropdownOpen, setResidentNameDropdownOpen] =
  useState(false);


  const [residentAddressSearch, setResidentAddressSearch] =
  useState('');
  const [residentAddressQuery, setResidentAddressQuery] =
  useState('');

  const [residentAddressDropdownOpen, setResidentAddressDropdownOpen] =
    useState(false);
  
  const residentNameComboRef = useRef(null);
const residentAddressComboRef = useRef(null);

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

  const [residentOffset, setResidentOffset] = useState(0);
  const [residentHasMore, setResidentHasMore] = useState(false);

  const [vendorNameSearch, setVendorNameSearch] =
  useState('');

  const [vendorAccountSearch, setVendorAccountSearch] =
    useState('');
  const [helperEntityId, setHelperEntityId] = useState('');

  const selectedBank = useMemo(
    () => banks.find((bank) => bank.id === bankId) || null,
    [bankId]
  );

  

  const availableGLParents = useMemo(
  () =>
    serverGLAccounts.filter(
      (gl) =>
        gl.pc === 'P' &&
        /^\d+$/.test(gl.glNumber)
    ),
  [serverGLAccounts]
);

const availableGLChildren = useMemo(
  () =>
    serverGLAccounts.filter(
      (gl) =>
        gl.pc === 'C' &&
        /^\d+$/.test(gl.glNumber) &&
        String(gl.parentGl || '').trim() !== ''
    ),
  [serverGLAccounts]
);


const visibleGLChildren = useMemo(
  () =>
    availableGLChildren.filter(
      (gl) =>
        String(gl.parentGl || '') ===
        String(selectedGLParent || '')
    ),
  [
    availableGLChildren,
    selectedGLParent
  ]
);







  const bankBalance = selectedBank
    ? formatMoney(selectedBank.balance)
    : '';

  const balanceWithOpenChecks = selectedBank
    ? formatMoney(
        selectedBank.balance -
          selectedBank.openChecks -
          parseMoney(checkAmount)
      )
    : '';

  const resetPartySearches = () => {
    setResidentNameSearch('');
    setResidentAddressSearch('');
    setVendorNameSearch('');
    setVendorAccountSearch('');
  };

  const loadResident = (residentId) => {
    const resident = residents.find(
      (item) => item.id === residentId
    );

    if (!resident) return;

    setEntityId(resident.id);
    setEntityName(resident.fullName);
    setResidentAddress(resident.address);
    setHelperEntityId(resident.id);

    setResidentNameSearch(resident.id);
    setResidentAddressSearch(resident.id);
    setVendorNameSearch('');
    setVendorAccountSearch('');
  };

  const loadVendor = (vendorId) => {
    const vendor = vendors.find(
      (item) => item.id === vendorId
    );

    if (!vendor) return;

    setEntityId(vendor.id);
    setEntityName(vendor.name);
    setResidentAddress('');
    setHelperEntityId(vendor.id);

    setVendorNameSearch(vendor.id);
    setVendorAccountSearch(vendor.id);
    setResidentNameSearch('');
    setResidentAddressSearch('');
  };

  const handleBankChange = async (event) => {
  const newBankId = event.target.value;

  const bank =
    banks.find((item) => item.id === newBankId) || null;

  setBankId(newBankId);
  setGLCategory('');
  setGLNumber('');
  setGLAccountName('');
  setCheckNumber('');

  if (!bank) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/check-register/next-check-number?bankAccountId=${newBankId}`
    );

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    if (
      String(data.checkMode || '').toLowerCase() === 'system'
    ) {
      setCheckNumber(data.nextCheckNumber || '');
    }
  } catch (error) {
    console.error(
      'Error loading next check number:',
      error
    );
  }
};

  const handleGLChange = (event) => {
  const category = event.target.value;

  setGLCategory(category);

  const gl = serverGLAccounts.find(
    (item) => item.category === category
  );

  setGLNumber(
    gl?.glNumber !== undefined && gl?.glNumber !== null
      ? String(gl.glNumber)
      : ''
  );
};

  const handleResidentNameSearch = async (event) => {
  const residentId = event.target.value;

  if (residentId === '__LOAD_MORE__') {
    await loadNextResidentChunk();
    setResidentNameSearch('');
    return;
  }

  setResidentNameSearch(residentId);

  if (!residentId) {
    resetPartySearches();
    return;
  }

  loadResident(residentId);
};

 const handleResidentAddressSearch = async (event) => {
  const residentId = event.target.value;

  if (residentId === '__LOAD_MORE__') {
    await loadNextResidentChunk();
    setResidentAddressSearch('');
    return;
  }

  setResidentAddressSearch(residentId);

  if (!residentId) {
    resetPartySearches();
    return;
  }

  loadResident(residentId);
};

  const handleVendorNameSearch = (event) => {
    const vendorId = event.target.value;

    setVendorNameSearch(vendorId);

    if (!vendorId) {
      resetPartySearches();
      return;
    }

    loadVendor(vendorId);
  };

  const handleVendorAccountSearch = (event) => {
    const vendorId = event.target.value;

    setVendorAccountSearch(vendorId);

    if (!vendorId) {
      resetPartySearches();
      return;
    }

    loadVendor(vendorId);
  };

  const handleHelperIdKeyDown = (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();

    const enteredId = helperEntityId.trim();

    const resident = residents.find(
      (item) => item.id === enteredId
    );

    if (resident) {
      loadResident(resident.id);
      return;
    }

    const vendor = vendors.find(
      (item) => item.id === enteredId
    );

    if (vendor) {
      loadVendor(vendor.id);
      return;
    }

    window.alert('Vendor or Resident ID was not found.');
  };

  const requiredFieldsComplete =
    Boolean(entityId) &&
    Boolean(bankId) &&
    Boolean(glCategory) &&
    parseMoney(checkAmount) > 0 &&
    Boolean(checkNumber || autoWithdrawal);

  const clearEntryForm = () => {
    setBankId('');
    setCheckAmount('');
    setEntityId('');
    setEntityName('');
    setResidentAddress('');
    setGLCategory('');
    setGLNumber('');
    setVendorInvoiceNo('');
    setVendorInvoiceDate('');
    setVendorInvoiceAmount('');
    setCheckNumber('');
    setCheckNotation('');
    setAutoWithdrawal(false);
    setResidentNameSearch('');
    setResidentAddressSearch('');
    setVendorNameSearch('');
    setVendorAccountSearch('');
    setHelperEntityId('');
  };

  const handleEntryChoice = async (choice) => {
  if (!pendingCheck) return;

  const newCheck = pendingCheck;

  try {
    const response = await fetch(
      `${API_BASE_URL}/check-register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          check_txn_num: newCheck.transactionNo,
          check_number: newCheck.checkNo,
          gl_name: newCheck.glAccount,
          amount: parseMoney(newCheck.amount),
          date_issued: newCheck.dateIssued || null,
          date_cleared: null,
          month_cleared: null,
          gl_number: newCheck.glNo,
          payee_id: newCheck.vendorOrResidentAcct,
          invoice_num: newCheck.vendorInvoiceNo,
          invoice_date: formatDateForDatabase(
            newCheck.vendorInvoiceDate
          ),
          invoice_amount: newCheck.vendorInvoiceAmount
            ? parseMoney(newCheck.vendorInvoiceAmount)
            : 0,
          note: newCheck.checkNotation,
          bank_account: newCheck.bankAccount,
          bank_account_id: bankId,
          check_allowed: newCheck.checkAllowed,
          escrow_flag: newCheck.escrowFlag
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.details ||
        result?.error ||
        `Server returned ${response.status}`
      );
    }

    if (typeof onAddCheck === 'function') {
      onAddCheck(newCheck);
    }

    setShowEntryChoice(false);
    setPendingCheck(null);

    if (choice === 'continue') {
      clearEntryForm();

      window.alert(
        'The check was saved. Enter the next check.'
      );

      return;
    }

    window.alert(
      'The check was saved to the Check Register.'
    );

    closeOverlay();

  } catch (error) {
    console.error(
      'Error saving check:',
      error
    );

    window.alert(
      'The check was NOT saved.\n\n' +
      error.message
    );
  }
};



const handleEnterCheck = async () => {
  if (!requiredFieldsComplete) return;

  const now = new Date();

  const newCheck = {
    checkNo: autoWithdrawal ? 'AW' : checkNumber,
    payeeName: entityName,
    amount: formatMoney(checkAmount),

    dateIssued: autoWithdrawal
  ? new Date().toISOString().slice(0, 10)
  : '',
    dateCleared: '',
    monthCleared: '',

    glAccount: glAccountName,
    vendorOrResidentAcct: entityId,

    vendorInvoiceNo,
    vendorInvoiceDate,
    vendorInvoiceAmount: vendorInvoiceAmount
      ? formatMoney(vendorInvoiceAmount)
      : '',

    checkNotation,

    bankAcct: selectedBank?.name || '',
    checkAllowed: 'Y',
    glNo: glNumber,

    transactionNo: formatDateForTransaction(now),

    escrowFlag:
      selectedBank?.id === '301' ? 'Y' : 'N',

    bankAccount: selectedBank?.name || ''
  };

  setPendingCheck(newCheck);
    setShowEntryChoice(true);
    return;

  
};

  return (
    <div className="enter-check-uf">
      {showGLSelectionUF && (
  <div className="enter-check-gl-overlay">
    <div className="enter-check-gl-box">

      <div className="enter-check-gl-title">
        SELECT CHECK G/L ACCOUNT
      </div>

      <div className="enter-check-gl-columns">

        <div className="enter-check-gl-column">
          <div className="enter-check-gl-column-title">
            Parent / Anchor GL Categories
          </div>

          <div className="enter-check-gl-list">
            {availableGLParents.map((gl) => (
              <button
                key={gl.glNumber}
                type="button"
                className={
                  selectedGLParent === gl.glNumber
                    ? 'enter-check-gl-option selected'
                    : 'enter-check-gl-option'
                }
                onClick={() => {
                  setSelectedGLParent(gl.glNumber);
                  setSelectedGLChild('');
                }}
              >
                {gl.glNumber} - {gl.category}
              </button>
            ))}
          </div>
        </div>

        <div className="enter-check-gl-column">
          <div className="enter-check-gl-column-title">
            Child GL Accounts
          </div>

          <div
              className="enter-check-gl-list"
              onScroll={() => {
                if (selectedGLChild) {
                  setSelectedGLChild('');
                }
              }}
            >
            {visibleGLChildren.map((gl) => (
              <button
                key={gl.glNumber}
                type="button"
                className={
                  selectedGLChild === gl.glNumber
                    ? 'enter-check-gl-option selected'
                    : 'enter-check-gl-option'
                }
                onClick={() =>
                  setSelectedGLChild(gl.glNumber)
                }
              >
                {gl.glNumber} - {gl.category}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="enter-check-gl-actions">
        <button
  type="button"
  disabled={!selectedGLChild}
  onClick={() => {
    const parent = availableGLParents.find(
      (gl) => gl.glNumber === selectedGLParent
    );

    const child = availableGLChildren.find(
      (gl) => gl.glNumber === selectedGLChild
    );

    if (!parent || !child) {
      return;
    }

    setGLCategory(child.category);
    setGLNumber(child.glNumber);
    setGLAccountName(child.category);

    setShowGLSelectionUF(false);
    setSelectedGLParent('');
    setSelectedGLChild('');
  }}
>
  Select GL
</button>

        <button
          type="button"
          onClick={() => {
            setShowGLSelectionUF(false);
            setSelectedGLParent('');
            setSelectedGLChild('');
          }}
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}
       {showEntryChoice && pendingCheck && (
  <div className="enter-check-choice-overlay">
    <div className="enter-check-choice-box">
      <div className="enter-check-choice-title">
        ENTER THIS CHECK?
      </div>

      <div className="enter-check-choice-details">
        <div>Payee: {pendingCheck.payeeName}</div>
        <div>Amount: {pendingCheck.amount}</div>
        <div>Bank: {pendingCheck.bankAccount}</div>
        <div>
          GL: {pendingCheck.glNo} - {pendingCheck.glAccount}
        </div>
      </div>

      <div className="enter-check-choice-buttons">
        <button
          type="button"
          onClick={() => handleEntryChoice('close')}
        >
          ENTER CHECK &amp; CLOSE
        </button>

        <button
          type="button"
          onClick={() => handleEntryChoice('continue')}
        >
          ENTER CHECK &amp; CONTINUE
        </button>

        <button
          type="button"
          onClick={() => {
            setShowEntryChoice(false);
            setPendingCheck(null);
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  </div>
)}


      <div className="enter-check-panel">
        <div className="enter-check-title">
          CHECK PAYMENT ENTRY:
        </div>

        <div className="enter-check-top-grid">
          <label className="enter-check-field">
            <span>BANK ACCOUNT:</span>

            <select
              value={bankId}
              onChange={handleBankChange}
            >
              <option value="">Select bank account</option>

              {banks.map((bank) => (
                <option
                  key={bank.id}
                  value={bank.id}
                >
                  {bank.name}
                </option>
              ))}
            </select>
          </label>

          <label className="enter-check-field">
            <span>CHECK $$</span>

            <div className="enter-check-money-wrap">
              <span className="enter-check-money-prefix">
                $
              </span>

              <input
                type="text"
                inputMode="decimal"
                value={checkAmount}
                onChange={(event) => {
                const value = event.target.value;

                setCheckAmount(value);

                setVendorInvoiceAmount((current) => {
                  if (
                    !current ||
                    current === checkAmount
                  ) {
                    return value;
                  }

                  return current;
                });
              }}
              />
            </div>
          </label>

          <label className="enter-check-field">
            <span>ACCT# ID</span>

            <input
              type="text"
              value={entityId}
              readOnly
            />
          </label>

<label className="enter-check-field">
  <span>CHECK G/L ACCOUNT CATEGORY</span>

  {!bankId ? (
    <select
      value=""
      onChange={() => {}}
      onMouseDown={(event) => {
        event.preventDefault();

        window.alert(
          'Please select a Bank Account before choosing a G/L Account Category.'
        );
      }}
    >
      <option value="">Select GL category</option>
    </select>
    ) : (
    <button
      type="button"
      onClick={() => {
        setSelectedGLParent('');
        setSelectedGLChild('');
        setShowGLSelectionUF(true);
      }}
    >
      {glCategory || 'Select GL category'}
    </button>
  )}


</label>

          <label className="enter-check-field">
            <span>Assigned GL#</span>

            <input
              type="text"
              value={glNumber}
              readOnly
            />
          </label>
        </div>

        <div className="enter-check-name-row">
          <label className="enter-check-field">
            <span>VENDOR / RESIDENT NAME</span>

            <input
              type="text"
              value={entityName}
              readOnly
            />
          </label>

          <label className="enter-check-field">
            <span>Resident Address</span>

            <input
              type="text"
              value={residentAddress}
              readOnly
            />
          </label>
        </div>

        <div className="enter-check-invoice-grid">
          <label className="enter-check-field">
            <span>VENDOR INV#</span>

            <input
              type="text"
              value={vendorInvoiceNo}
              onChange={(event) =>
                setVendorInvoiceNo(event.target.value)
              }
            />
          </label>

          <label className="enter-check-field">
            <span>VENDOR INV DATE</span>

            <input
              type="text"
              placeholder="MM/DD/YYYY"
              value={vendorInvoiceDate}
 onChange={(event) => {
  setVendorInvoiceDate(event.target.value);
}}

onBlur={(event) => {
  let value = event.target.value
    .trim()
    .replace(/-/g, '/');

  const parts = value.split('/');

  if (parts.length === 2) {
    const currentYear = new Date().getFullYear();

    const month = String(parts[0]).padStart(2, '0');
    const day = String(parts[1]).padStart(2, '0');

    value = `${month}/${day}/${currentYear}`;
  }

  if (value) {
    const enteredDate = new Date(value);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    enteredDate.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(enteredDate.getTime()) ||
      enteredDate > today
    ) {
      window.alert(
        'Vendor Invoice Date cannot be later than today.'
      );

      setVendorInvoiceDate('');
      return;
    }
  }

  setVendorInvoiceDate(value);
}}
            />
          </label>

          <label className="enter-check-field">
            <span>VENDOR INV $$</span>

            <div className="enter-check-money-wrap">
              <span className="enter-check-money-prefix">
                $
              </span>

              <input
                type="text"
                inputMode="decimal"
                value={vendorInvoiceAmount}
                onChange={(event) =>
                  setVendorInvoiceAmount(event.target.value)
                }
              />
            </div>
          </label>

          <label className="enter-check-field">
            <span>CHECK NUMBER</span>

            <input
              type="text"
              value={checkNumber}
              readOnly
            />
          </label>

          <label className="enter-check-field">
            <span>BANK ACCT BALANCE</span>

            <input
              type="text"
              value={bankBalance}
              readOnly
            />
          </label>

          <label className="enter-check-field">
            <span>
              BANK ACCT BALANCE
              <br />
              W/ OPEN CHECKS
            </span>

            <input
              type="text"
              value={balanceWithOpenChecks}
              readOnly
            />
          </label>
        </div>

        <div className="enter-check-balance-note-row">
          <div>(Including this check)</div>
        </div>

        <div className="enter-check-notation-row">
          <label htmlFor="checkNotation">
            CHECK NOTATION:
          </label>

          <input
            id="checkNotation"
            type="text"
            value={checkNotation}
            onChange={(event) =>
              setCheckNotation(event.target.value)
            }
          />
        </div>

        <div className="enter-check-action-row">
          <button
            type="button"
            className={
              requiredFieldsComplete
                ? 'enter-check-submit ready'
                : 'enter-check-submit'
            }
            disabled={!requiredFieldsComplete}
            onClick={handleEnterCheck}
          >
            ENTER CHECK DATA
          </button>

          <div className="enter-check-auto-wrap">
            <label className="enter-check-auto-label">
              <input
                type="checkbox"
                checked={autoWithdrawal}
                onChange={(event) =>
                  setAutoWithdrawal(event.target.checked)
                }
              />

              <span>BANK AUTO WITHDRAWAL</span>
            </label>

            <div className="enter-check-auto-note">
              Use Check Box to Classify Check Entry
              <br />
              as Bank Auto $ Withdrawal
            </div>
          </div>
        </div>

        <div className="enter-check-search-section">
          <div className="enter-check-search-title">
            Quick Resident / Vendor Acct# Search - 3 Way
          </div>

          <div className="enter-check-search-top">
            <label className="enter-check-field">
              <span>Resident Name</span>

              <div
                className="enter-check-resident-combo"
                ref={residentNameComboRef}
              >
  <input
    type="text"
    value={residentNameQuery}
    placeholder="Select resident"
    onFocus={() => setResidentNameDropdownOpen(true)}
    onChange={handleResidentNameQueryChange}
    autoComplete="off"
  />

  {residentNameDropdownOpen && (
    <div className="enter-check-resident-dropdown">
      {residents.map((resident) => (
        <button
          key={resident.id}
          type="button"
          className="enter-check-resident-option"
          onClick={() => selectResidentFromSearch(resident)}
        >
          {resident.lastName} | {resident.id} | {resident.address}
        </button>
      ))}

      {residentHasMore && (
        <button
          type="button"
          className="enter-check-resident-option enter-check-load-more"
          onClick={loadNextResidentChunk}
        >
          Load next 500 residents...
        </button>
      )}
    </div>
  )}
</div>

            </label>

            <label className="enter-check-field">
              <span>Vendor Name</span>

              <select
                value={vendorNameSearch}
                onChange={handleVendorNameSearch}
              >
                <option value="">Select vendor</option>

                {vendors.map((vendor) => (
                  <option
                    key={vendor.id}
                    value={vendor.id}
                  >
                    {vendor.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="enter-check-field">
              <span>Vendor Acct#</span>

              <select
                value={vendorAccountSearch}
                onChange={handleVendorAccountSearch}
              >
                <option value="">
                  Select vendor acct#
                </option>

                {vendors.map((vendor) => (
                  <option
                    key={vendor.id}
                    value={vendor.id}
                  >
                    {vendor.id}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="enter-check-search-bottom">
            <label className="enter-check-field">
              <span>Resident Address</span>

 

             <div
                className="enter-check-resident-combo"
                ref={residentAddressComboRef}
              >
  <input
    type="text"
    value={residentAddressQuery}
    placeholder="Select resident address"
    onFocus={async () => {
  setResidentAddressDropdownOpen(true);
  await searchResidents(residentAddressQuery, 'address');
}}
    onChange={handleResidentAddressQueryChange}
    autoComplete="off"
  />

  {residentAddressDropdownOpen && (
    <div className="enter-check-resident-dropdown">
      {residents.map((resident) => (
        <button
          key={resident.id}
          type="button"
          className="enter-check-resident-option"
          onClick={() =>
            selectResidentFromAddressSearch(resident)
          }
        >
          {resident.address} | {resident.lastName} | {resident.id}
        </button>
      ))}

      {residentHasMore && (
        <button
          type="button"
          className="enter-check-resident-option enter-check-load-more"
          onClick={loadNextResidentChunk}
        >
          Load next 500 residents...
        </button>
      )}
    </div>
  )}
</div>   


            </label>

            <label className="enter-check-field enter-check-helper-id">
              <span>Vendor/Resident ID:</span>
             
              <input
                type="text"
                value={helperEntityId}
                onChange={(event) =>
                  setHelperEntityId(event.target.value)
                }
                onKeyDown={handleHelperIdKeyDown}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnterCheckUF;
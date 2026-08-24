import { useEffect, useMemo, useRef, useState } from 'react';
import './EnterDepositUF.css';
import { API_BASE_URL } from '../../../../config/api';
import { closeOverlay } from '../../../../engines/overlay/overlay-engine';

function normalizeMoneyInput(value) {
  let normalized = String(value || '').replace(/[^0-9.]/g, '');
  const parts = normalized.split('.');

  if (parts.length > 2) {
    normalized = `${parts[0]}.${parts.slice(1).join('')}`;
  }

  if (normalized.includes('.')) {
    const [whole, decimals = ''] = normalized.split('.');
    normalized = `${whole}.${decimals.substring(0, 2)}`;
  }

  return normalized;
}

function parseMoney(value) {
  const amount = Number(
    String(value || '')
      .replace(/[$,]/g, '')
      .trim()
  );

  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(value) {
  return parseMoney(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
}

function formatDateForInput(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${month}/${day}/${year}`;
}

function formatDateForDatabase(dateText) {
  const value = String(dateText || '').trim();
  if (!value) return null;

  const parts = value.replace(/-/g, '/').split('/');
  if (parts.length !== 3) return null;

  const month = String(parts[0]).padStart(2, '0');
  const day = String(parts[1]).padStart(2, '0');
  const year = parts[2];
  return `${year}-${month}-${day}`;
}

function buildTransactionNumber(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear());
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `DP${month}${day}${year}-${hours}${minutes}${seconds}`;
}

function EnterDepositUF({ onAddDeposit }) {
  const [banks, setBanks] = useState([]);
  const [residents, setResidents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [serverGLAccounts, setServerGLAccounts] = useState([]);
  const [expenseGLAccounts, setExpenseGLAccounts] = useState([]);

  const [showGLSelectionUF, setShowGLSelectionUF] = useState(false);
  const [selectedGLParent, setSelectedGLParent] = useState('');
  const [selectedGLChild, setSelectedGLChild] = useState('');

  const [showEntryChoice, setShowEntryChoice] = useState(false);
  const [pendingDeposit, setPendingDeposit] = useState(null);
  const [depositSubmitInProgress, setDepositSubmitInProgress] = useState(false);


  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [entityName, setEntityName] = useState('');
  const [entityAddress, setEntityAddress] = useState('');

  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(
    formatDateForInput(new Date())
  );
  const [notation, setNotation] = useState('');
  const [checkNumber, setCheckNumber] = useState('');

  const [bankId, setBankId] = useState('');
  const [glCategory, setGLCategory] = useState('');
  const [glNumber, setGLNumber] = useState('');
  const [glAccountName, setGLAccountName] = useState('');
  const [glParentName, setGLParentName] = useState('');
  const [expenseRefundGLNumber, setExpenseRefundGLNumber] =
    useState('');

  const [residentNameQuery, setResidentNameQuery] = useState('');
  const [residentAddressQuery, setResidentAddressQuery] =
    useState('');
  const [residentNameDropdownOpen, setResidentNameDropdownOpen] =
    useState(false);
  const [residentAddressDropdownOpen, setResidentAddressDropdownOpen] =
    useState(false);
  const [vendorNameSearch, setVendorNameSearch] = useState('');
  const [helperEntityId, setHelperEntityId] = useState('');
  const [residentOffset, setResidentOffset] = useState(0);
  const [residentHasMore, setResidentHasMore] = useState(false);

  const residentNameComboRef = useRef(null);
  const residentAddressComboRef = useRef(null);

  const [remainingDeposit, setRemainingDeposit] = useState('');
  const [totalOwed, setTotalOwed] = useState('$0.00');
  const [totalPaid, setTotalPaid] = useState('$0.00');
  const [residentCredit, setResidentCredit] = useState('$0.00');
  const [useResidentCredit, setUseResidentCredit] = useState(false);
  const [creditUsed, setCreditUsed] = useState('$0.00');
  const [remainingCredit, setRemainingCredit] = useState('$0.00');

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
        setBanks([]);
      }
    }

    async function loadGLAccounts() {
      try {
        const [dpResponse, crResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/gl-options?screen=DP`),
          fetch(`${API_BASE_URL}/gl-options?screen=CR`)
        ]);

        if (!dpResponse.ok) {
          throw new Error(`DP GL server returned ${dpResponse.status}`);
        }

        if (!crResponse.ok) {
          throw new Error(`Expense GL server returned ${crResponse.status}`);
        }

        const dpData = await dpResponse.json();
        const crData = await crResponse.json();

        const mapRows = (data) => {
          const rows = Array.isArray(data.glAccounts)
            ? data.glAccounts
            : Array.isArray(data)
              ? data
              : [];

          return rows.map((gl) => ({
            bankId: String(gl.bankId || ''),
            category: gl.glName || '',
            glNumber: String(gl.glNumber || ''),
            pc: String(gl.pc || ''),
            parentGl: String(gl.parentGl || '')
          }));
        };

        setServerGLAccounts(mapRows(dpData));
        setExpenseGLAccounts(mapRows(crData));
      } catch (error) {
        console.error('Error loading Deposit Register GL options:', error);
        setServerGLAccounts([]);
        setExpenseGLAccounts([]);
      }
    }

    async function loadResidents() {
      try {
        const response = await fetch(`${API_BASE_URL}/residents?offset=0`);
        if (!response.ok) {
          throw new Error(`Residents server returned ${response.status}`);
        }

        const data = await response.json();
        const rows = data.residents || [];

        setResidentOffset(data.offset || 0);
        setResidentHasMore(Boolean(data.hasMore));
        setResidents(
          rows.map((resident) => ({
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
          }))
        );
      } catch (error) {
        console.error('Error loading residents:', error);
        setResidents([]);
      }
    }

    async function loadVendors() {
      try {
        const response = await fetch(`${API_BASE_URL}/vendors`);
        if (!response.ok) {
          throw new Error(`Vendors server returned ${response.status}`);
        }

        const rows = await response.json();
        setVendors(
          rows.map((vendor) => ({
            id: String(vendor.vendor_id),
            name: vendor.vendor_name || '',
            address: vendor.address || ''
          }))
        );
      } catch (error) {
        console.error('Error loading vendors:', error);
        setVendors([]);
      }
    }

    loadBanks();
    loadGLAccounts();
    loadResidents();
    loadVendors();
  }, []);

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

    document.addEventListener('mousedown', handleClickOutsideResidentLookups);
    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutsideResidentLookups
      );
    };
  }, []);

  const selectedBank = useMemo(
    () => banks.find((bank) => bank.id === bankId) || null,
    [banks, bankId]
  );

  const availableGLParents = useMemo(
    () =>
      serverGLAccounts.filter(
        (gl) => gl.pc === 'P' && /^\d+$/.test(gl.glNumber)
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
          String(gl.parentGl || '') === String(selectedGLParent || '')
      ),
    [availableGLChildren, selectedGLParent]
  );

  const expenseRefundChoices = useMemo(
    () =>
      expenseGLAccounts.filter(
        (gl) => gl.pc === 'C' && /^\d+$/.test(gl.glNumber)
      ),
    [expenseGLAccounts]
  );

  const expenseRefundSelected = /expense\s*credit\s*refund/i.test(
    `${glParentName} ${glCategory}`
  );

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

      setResidents((current) => [...current, ...nextResidents]);
      setResidentOffset(data.offset || nextOffset);
      setResidentHasMore(Boolean(data.hasMore));
    } catch (error) {
      console.error('Error loading next resident chunk:', error);
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
      console.error('Error searching residents:', error);
    }
  };

  const loadResident = (residentId) => {
    const resident = residents.find((item) => item.id === residentId);
    if (!resident) return;

    setEntityType('resident');
    setEntityId(resident.id);
    setEntityName(resident.fullName);
    setEntityAddress(resident.address);
    setHelperEntityId(resident.id);
    setResidentNameQuery(
      `${resident.lastName} | ${resident.id} | ${resident.address}`
    );
    setResidentAddressQuery(resident.address || '');
    setVendorNameSearch('');
  };

  const loadVendor = (vendorId) => {
    const vendor = vendors.find((item) => item.id === vendorId);
    if (!vendor) return;

    setEntityType('vendor');
    setEntityId(vendor.id);
    setEntityName(vendor.name);
    setEntityAddress(vendor.address || '');
    setHelperEntityId(vendor.id);
    setVendorNameSearch(vendor.id);
    setResidentNameQuery('');
    setResidentAddressQuery('');
  };

  const handleResidentNameQueryChange = async (event) => {
    const value = event.target.value;
    setResidentNameQuery(value);
    setResidentNameDropdownOpen(true);
    await searchResidents(value, 'name');
  };

  const handleResidentAddressQueryChange = async (event) => {
    const value = event.target.value;
    setResidentAddressQuery(value);
    setResidentAddressDropdownOpen(true);
    await searchResidents(value, 'address');
  };

  const handleVendorNameChange = (event) => {
    const vendorId = event.target.value;
    setVendorNameSearch(vendorId);

    if (!vendorId) return;
    loadVendor(vendorId);
  };

  const handleHelperIdKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();

    const enteredId = helperEntityId.trim();
    const resident = residents.find((item) => item.id === enteredId);
    if (resident) {
      loadResident(resident.id);
      return;
    }

    const vendor = vendors.find((item) => item.id === enteredId);
    if (vendor) {
      loadVendor(vendor.id);
      return;
    }

    window.alert('Vendor or Resident ID was not found.');
  };

  const handleAmountChange = (event) => {
    const normalized = normalizeMoneyInput(event.target.value);
    setDepositAmount(normalized);
    setRemainingDeposit(normalized ? formatMoney(normalized) : '');
  };

  const handleAmountBlur = () => {
    if (!depositAmount) return;
    setDepositAmount(parseMoney(depositAmount).toFixed(2));
  };

  const handleDepositDateBlur = (event) => {
    let value = event.target.value.trim().replace(/-/g, '/');
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
        window.alert('Deposit Date cannot be later than today.');
        setDepositDate('');
        return;
      }
    }

    setDepositDate(value);
  };

  const handleBankChange = (event) => {
    setBankId(event.target.value);
    setGLCategory('');
    setGLNumber('');
    setGLAccountName('');
    setGLParentName('');
    setExpenseRefundGLNumber('');
  };

  const requiredFieldsComplete =
    Boolean(entityId) &&
    Boolean(entityType) &&
    parseMoney(depositAmount) > 0 &&
    Boolean(depositDate.trim()) &&
    Boolean(bankId) &&
    Boolean(glNumber) &&
    Boolean(glAccountName) &&
    (!expenseRefundSelected || Boolean(expenseRefundGLNumber));

  const getMissingRequiredField = () => {
  if (!entityId) return 'Vendor / Resident';
  if (!entityType) return 'Vendor / Resident';
  if (!(parseMoney(depositAmount) > 0)) return 'Deposit Amount';
  if (!depositDate.trim()) return 'Deposit Date';
  if (!bankId) return 'Bank Account';
  if (!glNumber || !glAccountName) return 'G/L Account';
  if (expenseRefundSelected && !expenseRefundGLNumber) {
    return 'Expense Credit Refund G/L Account';
  }

  return '';
};






  const clearForm = () => {
    setEntityType('');
    setEntityId('');
    setEntityName('');
    setEntityAddress('');
    setDepositAmount('');
    setDepositDate(formatDateForInput(new Date()));
    setNotation('');
    setCheckNumber('');
    setBankId('');
    setGLCategory('');
    setGLNumber('');
    setGLAccountName('');
    setGLParentName('');
    setExpenseRefundGLNumber('');
    setResidentNameQuery('');
    setResidentAddressQuery('');
    setVendorNameSearch('');
    setHelperEntityId('');
    setRemainingDeposit('');
    setTotalOwed('$0.00');
    setTotalPaid('$0.00');
    setResidentCredit('$0.00');
    setUseResidentCredit(false);
    setCreditUsed('$0.00');
    setRemainingCredit('$0.00');
  };

  const handleEnterDeposit = () => {
    if (!requiredFieldsComplete) {
  const missingField = getMissingRequiredField();

  window.alert(
    `Please complete the required item: ${missingField}.`
  );

  return;
}

    const now = new Date();
    const newDeposit = {
      checkNumber,
      depositorName: entityName,
      amount: formatMoney(depositAmount),
      bankAccount: selectedBank?.name || '',
      bankAccountId: bankId,
      glAccount: glAccountName,
      depositDate,
      dateCleared: '',
      monthCleared: '',
      ownerAccount:
      entityType === 'resident'
        ? String(entityId).replace(/\D/g, '').padStart(6, '0')
        : '',
      depositorId: entityId,
      vendorId: entityType === 'vendor' ? entityId : '',
      invoiceNumber: '',
      expenseRefundGLCategory: expenseRefundSelected ? glCategory : '',
      expenseRefundGLNumber: expenseRefundSelected
        ? expenseRefundGLNumber
        : '',
      glNumber,
      transactionNumber: buildTransactionNumber(now),
      notation,
      arbFineAssigned: '$0.00',
      fineAssigned: '$0.00',
      paymentUploaded: 'YES',
      depositOverflow: remainingDeposit || '$0.00',
      escrowFlag:
        String(selectedBank?.bankType || '').toLowerCase() === 'escrow'
          ? 'Y'
          : 'N'
    };

    setPendingDeposit(newDeposit);
    setShowEntryChoice(true);
  };

  const handleEntryChoice = async (choice) => {
    if (!pendingDeposit) return;

    if (depositSubmitInProgress) return;
    setDepositSubmitInProgress(true);

    const newDeposit = pendingDeposit;

setShowEntryChoice(false);
setPendingDeposit(null);

try {
      const response = await fetch(`${API_BASE_URL}/deposit-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposit_txn_num: newDeposit.transactionNumber,
          payer_name: newDeposit.depositorName,
          amount: parseMoney(newDeposit.amount),
          bank_account_name: newDeposit.bankAccount,
          bank_account_id: newDeposit.bankAccountId,
          gl_name: newDeposit.glAccount,
          gl_number: newDeposit.glNumber,
          date_deposited: formatDateForDatabase(newDeposit.depositDate),
          date_cleared: null,
          month_cleared: null,
          resident_id: newDeposit.ownerAccount || '',
          vendor_id: newDeposit.vendorId || '',
          expense_refund_gl_category: newDeposit.expenseRefundGLCategory || '',
          expense_refund_gl_number: newDeposit.expenseRefundGLNumber || null,
          note: newDeposit.notation
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result?.details ||
            result?.error ||
            `Server returned ${response.status}`
        );
      }

      if (typeof onAddDeposit === 'function') {
        onAddDeposit(newDeposit);
      }

      
      if (choice === 'continue') {
        clearForm();
        window.alert('The deposit was saved. Enter the next deposit.');
        setDepositSubmitInProgress(false);
        return;
      }

      window.alert('The deposit was saved to the Deposit Register.');
      closeOverlay();
    } catch (error) {
      console.error('Error saving deposit:', error);
      window.alert(
        'The deposit was NOT saved.\n\n' + error.message
      );
      setDepositSubmitInProgress(false);

    }
  };

  return (
    <div className="enter-deposit-uf">
      {showGLSelectionUF && (
        <div className="enter-deposit-gl-overlay">
          <div className="enter-deposit-gl-box">
            <div className="enter-deposit-gl-title">
              SELECT DEPOSIT G/L ACCOUNT
            </div>

            <div className="enter-deposit-gl-columns">
              <div className="enter-deposit-gl-column">
                <div className="enter-deposit-gl-column-title">
                  Parent / Anchor GL Categories
                </div>

                <div className="enter-deposit-gl-list">
                  {availableGLParents.map((gl) => (
                    <button
                      key={gl.glNumber}
                      type="button"
                      className={
                        selectedGLParent === gl.glNumber
                          ? 'enter-deposit-gl-option selected'
                          : 'enter-deposit-gl-option'
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

              <div className="enter-deposit-gl-column">
                <div className="enter-deposit-gl-column-title">
                  Child GL Accounts
                </div>

                <div
                  className="enter-deposit-gl-list"
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
                          ? 'enter-deposit-gl-option selected'
                          : 'enter-deposit-gl-option'
                      }
                      onClick={() => setSelectedGLChild(gl.glNumber)}
                    >
                      {gl.glNumber} - {gl.category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="enter-deposit-gl-actions">
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

                  if (!parent || !child) return;

                  setGLCategory(child.category);
                  setGLNumber(child.glNumber);
                  setGLAccountName(child.category);
                  setGLParentName(parent.category);

                  if (
                    !/expense\s*credit\s*refund/i.test(
                      `${parent.category} ${child.category}`
                    )
                  ) {
                    setExpenseRefundGLNumber('');
                  }

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

      {showEntryChoice && pendingDeposit && (
        <div className="enter-deposit-choice-overlay">
          <div className="enter-deposit-choice-box">
            <div className="enter-deposit-choice-title">
              ENTER THIS DEPOSIT?
            </div>

            <div className="enter-deposit-choice-details">
              <div>Depositor: {pendingDeposit.depositorName}</div>
              <div>Amount: {pendingDeposit.amount}</div>
              <div>Bank: {pendingDeposit.bankAccount}</div>
              <div>
                GL: {pendingDeposit.glNumber} - {pendingDeposit.glAccount}
              </div>
            </div>

            <div className="enter-deposit-choice-buttons">
              <button
                type="button"
                disabled={depositSubmitInProgress}
                onClick={() => handleEntryChoice('close')}
              >
                ENTER DEPOSIT &amp; CLOSE
              </button>

              <button
                type="button"
                disabled={depositSubmitInProgress}
                onClick={() => handleEntryChoice('continue')}
              >
                ENTER DEPOSIT &amp; CONTINUE
              </button>

              <button
                type="button"
                disabled={depositSubmitInProgress}
                onClick={() => {
                  setShowEntryChoice(false);
                  setPendingDeposit(null);
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="enter-deposit-title">$$ DEPOSIT ENTRY:</div>

      <div className="enter-deposit-subtitle">
        (Use Assmt Paymt Register for Assessment Payments)
      </div>

      <div className="enter-deposit-grid">
        <div className="enter-deposit-column enter-deposit-left">
          <label className="enter-deposit-field">
            <span>Vendor/Resident ID</span>
            <input type="text" value={
            String(entityId || '').toUpperCase().startsWith('RES-')
              ? String(entityId).replace(/\D/g, '').padStart(6, '0')
              : String(entityId || '').replace(/\D/g, '').padStart(4, '0')
          } readOnly />
          </label>

          <label className="enter-deposit-field">
            <span>Vendor / Resident Name</span>
            <input type="text" value={entityName} readOnly />
          </label>

          <label className="enter-deposit-field">
            <span>Vendor / Resident Address</span>
            <input type="text" value={entityAddress} readOnly />
          </label>

          <div className="enter-deposit-amount-date-row">
            <label className="enter-deposit-field">
              <span>AMT $$</span>
              <input
                type="text"
                inputMode="decimal"
                value={depositAmount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
              />
            </label>

            <label className="enter-deposit-field enter-deposit-date-field">
              <span>DATE</span>
              <input
                type="text"
                placeholder="MM/DD/YYYY"
                value={depositDate}
                onChange={(event) => setDepositDate(event.target.value)}
                onBlur={handleDepositDateBlur}
              />
            </label>
          </div>

          <label className="enter-deposit-field">
            <span>Deposit Notation</span>
            <textarea
              value={notation}
              onChange={(event) => setNotation(event.target.value)}
            />
          </label>

          <div className="enter-deposit-check-submit-row">
            <label className="enter-deposit-field enter-deposit-check-field">
              <span>Check # Being Deposited</span>
              <input
                type="text"
                value={checkNumber}
                onChange={(event) => setCheckNumber(event.target.value)}
              />
            </label>

            <button
              type="button"
              className={
                requiredFieldsComplete
                  ? 'enter-deposit-submit ready'
                  : 'enter-deposit-submit'
              }
              // disabled={!requiredFieldsComplete}
              onClick={handleEnterDeposit}
            >
              ENTER DEPOSIT DATA
            </button>
          </div>
        </div>

        <div className="enter-deposit-column enter-deposit-middle">
          <label className="enter-deposit-field">
            <span>Bank Account</span>
            <select value={bankId} onChange={handleBankChange}>
              <option value="">-- Select Bank --</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name}
                </option>
              ))}
            </select>
          </label>

          <label className="enter-deposit-field">
            <span>G/L Account</span>
            {!bankId ? (
              <select
                value=""
                onChange={() => {}}
                onMouseDown={(event) => {
                  event.preventDefault();
                  window.alert(
                    'Please select a Bank Account before choosing a G/L Account.'
                  );
                }}
              >
                <option value="">-- Select GL --</option>
              </select>
            ) : (
              <button
                type="button"
                className="enter-deposit-gl-trigger"
                onClick={() => {
                  setSelectedGLParent('');
                  setSelectedGLChild('');
                  setShowGLSelectionUF(true);
                }}
              >
                {glCategory || '-- Select GL --'}
              </button>
            )}
          </label>

          <label className="enter-deposit-field">
            <span>Assigned GL#</span>
            <input type="text" value={glNumber} readOnly />
          </label>

          <label className="enter-deposit-field">
            <span>If Expense Credit Refund, Select Expense</span>
            <select
              value={expenseRefundGLNumber}
              onChange={(event) =>
                setExpenseRefundGLNumber(event.target.value)
              }
              disabled={!expenseRefundSelected}
            >
              <option value="">-- Select Expense --</option>
              {expenseRefundChoices.map((account) => (
                <option key={account.glNumber} value={account.glNumber}>
                  {account.glNumber} - {account.category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="enter-deposit-column enter-deposit-right">
          <div className="enter-deposit-right-heading">
            <div>
              <div className="enter-deposit-right-label">
                Resident Fine / Late Fee / ARB &amp; Const. Fine Inv#
              </div>
              <div className="enter-deposit-red-note">
                Select All Invoices That Apply
              </div>
            </div>

            <label className="enter-deposit-field">
              <span>
                $$ Remaining of this Deposit
                <br />
                <em>(See Note Below)</em>
              </span>
              <input type="text" value={remainingDeposit} readOnly />
            </label>
          </div>

          <div className="enter-deposit-invoice-head">
            <span>Inv#</span>
            <span>Amt $$</span>
            <span>Type Code</span>
            <span>Description</span>
          </div>

          <div className="enter-deposit-invoice-box" />

          <button type="button" className="enter-deposit-recalc">
            Recalculations OK!
          </button>

          <div className="enter-deposit-summary-row">
            <label className="enter-deposit-field">
              <span>Total Invoice $$ Owed</span>
              <input
                type="text"
                value={totalOwed}
                onChange={(event) => setTotalOwed(event.target.value)}
              />
            </label>

            <label className="enter-deposit-field">
              <span>Total Invoice $$ Paid</span>
              <input
                type="text"
                value={totalPaid}
                onChange={(event) => setTotalPaid(event.target.value)}
              />
            </label>
          </div>

          <div className="enter-deposit-credit-row">
            <label className="enter-deposit-field">
              <span>Resident Credit</span>
              <input
                type="text"
                value={residentCredit}
                onChange={(event) => setResidentCredit(event.target.value)}
              />
            </label>

            <label className="enter-deposit-use-credit">
              <input
                type="checkbox"
                checked={useResidentCredit}
                onChange={(event) => setUseResidentCredit(event.target.checked)}
              />
              <span>Use Resident Credit $ To Pay Fines &amp; Late Fees</span>
            </label>
          </div>

          <div className="enter-deposit-credit-line">
            <input
              type="text"
              value={creditUsed}
              onChange={(event) => setCreditUsed(event.target.value)}
            />
            <span>Credit Used to Pay Invoices</span>
          </div>

          <div className="enter-deposit-credit-line">
            <input
              type="text"
              value={remainingCredit}
              onChange={(event) => setRemainingCredit(event.target.value)}
            />
            <span>Credit Remaining After Invoice Payment</span>
          </div>

          <div className="enter-deposit-bottom-note">
            Note: Remaining $$ will be applied as Pre-Paid Credit to Resident Account
          </div>
        </div>
      </div>

      <div className="enter-deposit-search">
        <div className="enter-deposit-search-title">
          Quick Resident / Vendor Acct# Search - 3 Way
        </div>

        <div className="enter-deposit-search-top">
          <label className="enter-deposit-field">
            <span>Resident Name</span>
            <div
              className="enter-deposit-resident-combo"
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
                <div className="enter-deposit-resident-dropdown">
                  {residents.map((resident) => (
                    <button
                      key={resident.id}
                      type="button"
                      className="enter-deposit-resident-option"
                      onClick={() => {
                        loadResident(resident.id);
                        setResidentNameDropdownOpen(false);
                      }}
                    >
                      {resident.lastName} | {resident.id} | {resident.address}
                    </button>
                  ))}

                  {residentHasMore && (
                    <button
                      type="button"
                      className="enter-deposit-resident-option enter-deposit-load-more"
                      onClick={loadNextResidentChunk}
                    >
                      Load next 500 residents...
                    </button>
                  )}
                </div>
              )}
            </div>
          </label>

          <label className="enter-deposit-field">
            <span>Vendor Name</span>
            <select value={vendorNameSearch} onChange={handleVendorNameChange}>
              <option value="">-- Select Vendor --</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="enter-deposit-search-bottom">
          <label className="enter-deposit-field">
            <span>Resident Address</span>
            <div
              className="enter-deposit-resident-combo"
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
                <div className="enter-deposit-resident-dropdown">
                  {residents.map((resident) => (
                    <button
                      key={resident.id}
                      type="button"
                      className="enter-deposit-resident-option"
                      onClick={() => {
                        loadResident(resident.id);
                        setResidentAddressDropdownOpen(false);
                      }}
                    >
                      {resident.address} | {resident.lastName} | {resident.id}
                    </button>
                  ))}

                  {residentHasMore && (
                    <button
                      type="button"
                      className="enter-deposit-resident-option enter-deposit-load-more"
                      onClick={loadNextResidentChunk}
                    >
                      Load next 500 residents...
                    </button>
                  )}
                </div>
              )}
            </div>
          </label>

          <label className="enter-deposit-field enter-deposit-helper-id">
            <span>Vendor/Resident ID:</span>
            <input
              type="text"
              value={
                  String(helperEntityId || '').toUpperCase().startsWith('RES-')
                    ? String(helperEntityId).replace(/\D/g, '').padStart(6, '0')
                    : helperEntityId
                }
              onChange={(event) => setHelperEntityId(event.target.value)}
              onKeyDown={handleHelperIdKeyDown}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default EnterDepositUF;

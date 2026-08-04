


import { useMemo, useState } from 'react';
import './EnterCheckUF.css';

const banks = [
  {
    id: '101',
    name: '101 - Operating Account',
    balance: 25000,
    openChecks: 1900,
    checkMode: 'system',
    nextCheck: 1050
  },
  {
    id: '102',
    name: '102 - Operating Account 2',
    balance: 18000,
    openChecks: 600,
    checkMode: 'manual',
    nextCheck: 3401
  },
  {
    id: '201',
    name: '201 - Capital Account',
    balance: 100000,
    openChecks: 0,
    checkMode: 'system',
    nextCheck: 5001
  },
  {
    id: '301',
    name: '301 - Escrow Account',
    balance: 12000,
    openChecks: 250,
    checkMode: 'manual',
    nextCheck: 9001
  }
];

const glAccounts = [
  {
    bankId: '101',
    category: 'Water',
    glNumber: '7010'
  },
  {
    bankId: '101',
    category: 'Electric',
    glNumber: '7020'
  },
  {
    bankId: '101',
    category: 'Landscaping',
    glNumber: '7030'
  },
  {
    bankId: '102',
    category: 'Water',
    glNumber: '7110'
  },
  {
    bankId: '102',
    category: 'Electric',
    glNumber: '7120'
  },
  {
    bankId: '102',
    category: 'Repairs',
    glNumber: '7130'
  },
  {
    bankId: '201',
    category: 'Reserve Transfer',
    glNumber: '8010'
  },
  {
    bankId: '201',
    category: 'Capital Repair',
    glNumber: '8020'
  },
  {
    bankId: '301',
    category: 'Escrow Refund',
    glNumber: '9501'
  },
  {
    bankId: '301',
    category: 'Escrow Deposit',
    glNumber: '9500'
  }
];

const residents = [
  {
    id: '17770',
    lastName: 'Riccoboni',
    fullName: 'Rick Riccoboni',
    address: '12 Main St'
  },
  {
    id: '17769',
    lastName: 'Wenger',
    fullName: 'Paul Wenger',
    address: '14 Oak Ave'
  },
  {
    id: '17771',
    lastName: 'Bates',
    fullName: 'Linda Bates',
    address: '55 Pine Ln'
  }
];

const vendors = [
  {
    id: '101',
    name: 'ABC Landscaping'
  },
  {
    id: '102',
    name: 'City Water Dept'
  },
  {
    id: '103',
    name: 'HVAC Repair Co'
  }
];

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
  const [bankId, setBankId] = useState('');
  const [checkAmount, setCheckAmount] = useState('');
  const [entityId, setEntityId] = useState('');
  const [entityName, setEntityName] = useState('');
  const [residentAddress, setResidentAddress] = useState('');

  const [glCategory, setGLCategory] = useState('');
  const [glNumber, setGLNumber] = useState('');

  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('');
  const [vendorInvoiceDate, setVendorInvoiceDate] =
    useState('');
  const [vendorInvoiceAmount, setVendorInvoiceAmount] =
    useState('');

  const [checkNumber, setCheckNumber] = useState('');
  const [checkNotation, setCheckNotation] = useState('');
  const [autoWithdrawal, setAutoWithdrawal] = useState(false);

  const [residentNameSearch, setResidentNameSearch] =
    useState('');
  const [residentAddressSearch, setResidentAddressSearch] =
    useState('');
  const [vendorNameSearch, setVendorNameSearch] =
    useState('');
  const [vendorAccountSearch, setVendorAccountSearch] =
    useState('');
  const [helperEntityId, setHelperEntityId] = useState('');

  const selectedBank = useMemo(
    () => banks.find((bank) => bank.id === bankId) || null,
    [bankId]
  );

  const availableGLAccounts = useMemo(
    () => glAccounts.filter((gl) => gl.bankId === bankId),
    [bankId]
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

  const handleBankChange = (event) => {
    const newBankId = event.target.value;
    const bank =
      banks.find((item) => item.id === newBankId) || null;

    setBankId(newBankId);
    setGLCategory('');
    setGLNumber('');

    if (!bank) {
      setCheckNumber('');
      return;
    }

    if (bank.checkMode === 'system') {
      setCheckNumber(String(bank.nextCheck));
    } else {
      setCheckNumber('');
    }
  };

  const handleGLChange = (event) => {
    const category = event.target.value;

    setGLCategory(category);

    const gl = availableGLAccounts.find(
      (item) => item.category === category
    );

    setGLNumber(gl?.glNumber || '');
  };

  const handleResidentNameSearch = (event) => {
    const residentId = event.target.value;

    setResidentNameSearch(residentId);

    if (!residentId) {
      resetPartySearches();
      return;
    }

    loadResident(residentId);
  };

  const handleResidentAddressSearch = (event) => {
    const residentId = event.target.value;

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

  const handleEnterCheck = () => {
    if (!requiredFieldsComplete) return;

    const now = new Date();

    const newCheck = {
      checkNo: autoWithdrawal ? 'AW' : checkNumber,
      payeeName: entityName,
      amount: formatMoney(checkAmount),

      dateIssued: '',
      dateCleared: '',
      monthCleared: '',

      glAccount: glCategory,
      vendorOrResidentAcct: entityId,

      vendorInvoiceNo,
      vendorInvoiceDate,
      vendorInvoiceAmount: vendorInvoiceAmount
        ? formatMoney(vendorInvoiceAmount)
        : '',

      checkNotation,

      bankAcct: bankId,
      checkAllowed: 'Y',
      glNo: glNumber,

      transactionNo: formatDateForTransaction(now),

      escrowFlag:
        selectedBank?.id === '301' ? 'Y' : 'N',

      bankAccount: selectedBank?.name || ''
    };

    const confirmed = window.confirm(
      'Enter this new check?\n\n' +
        `Payee: ${newCheck.payeeName}\n` +
        `Amount: ${newCheck.amount}\n` +
        `Bank: ${newCheck.bankAccount}\n` +
        `GL: ${newCheck.glNo} - ${newCheck.glAccount}`
    );

    if (!confirmed) return;

    if (typeof onAddCheck === 'function') {
      onAddCheck(newCheck);
    }

    window.alert(
      'The check was added to the bottom of the Check Register.'
    );

    clearEntryForm();
  };

  return (
    <div className="enter-check-uf">
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
                onChange={(event) =>
                  setCheckAmount(event.target.value)
                }
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

            <select
              value={glCategory}
              onChange={handleGLChange}
              disabled={!bankId}
            >
              <option value="">Select GL category</option>

              {availableGLAccounts.map((gl) => (
                <option
                  key={`${gl.bankId}-${gl.glNumber}`}
                  value={gl.category}
                >
                  {gl.category}
                </option>
              ))}
            </select>
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
              onChange={(event) =>
                setVendorInvoiceDate(event.target.value)
              }
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
              onChange={(event) =>
                setCheckNumber(event.target.value)
              }
              readOnly={
                selectedBank?.checkMode === 'system'
              }
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
            className="enter-check-submit"
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

              <select
                value={residentNameSearch}
                onChange={handleResidentNameSearch}
              >
                <option value="">Select resident</option>

                {residents.map((resident) => (
                  <option
                    key={resident.id}
                    value={resident.id}
                  >
                    {resident.lastName} | {resident.id} |{' '}
                    {resident.address}
                  </option>
                ))}
              </select>
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

              <select
                value={residentAddressSearch}
                onChange={handleResidentAddressSearch}
              >
                <option value="">
                  Select resident address
                </option>

                {residents.map((resident) => (
                  <option
                    key={resident.id}
                    value={resident.id}
                  >
                    {resident.address}
                  </option>
                ))}
              </select>
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
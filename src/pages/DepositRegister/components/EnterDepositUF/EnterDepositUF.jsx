


import { useMemo, useState } from 'react';
import './EnterDepositUF.css';

const banks = [
  {
    value: 'Operating Acct',
    label: 'Operating Acct'
  },
  {
    value: 'Capital Acct',
    label: 'Capital Acct'
  },
  {
    value: 'Money Market',
    label: 'Money Market'
  },
  {
    value: 'Escrow Acct',
    label: 'Escrow Acct'
  }
];

const glAccounts = [
  {
    value: '123456',
    label: '123456',
    classification: '123456'
  },
  {
    value: '4300',
    label: '4300 - Monthly Ground Maintenance',
    classification: 'Monthly Ground Maintenance'
  },
  {
    value: '8001',
    label: '8001 - Management Fees',
    classification: 'Management Fees'
  },
  {
    value: 'ECR',
    label: 'Expense Credit Refund',
    classification: 'Expense Credit Refund'
  },
  {
    value: 'LATE',
    label: 'Late Fee / Fine',
    classification: 'Late Fee / Fine'
  }
];

const residents = [
  {
    id: '17770',
    name: 'Riccoboni',
    fullName: 'Rick Riccoboni',
    address: '101 Main St'
  },
  {
    id: '17769',
    name: 'Wenger',
    fullName: 'Paul Wenger',
    address: '55 Oak Ave'
  },
  {
    id: '17768',
    name: 'Smith',
    fullName: 'Linda Smith',
    address: '22 Pine Rd'
  }
];

const vendors = [
  {
    id: 'V1001',
    name: 'ABC Landscaping'
  },
  {
    id: 'V1002',
    name: 'City Water Dept'
  },
  {
    id: 'V1003',
    name: 'Electric Co'
  }
];

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
  const [entityId, setEntityId] = useState('');
  const [entityName, setEntityName] = useState('');
  const [entityAddress, setEntityAddress] = useState('');

  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(
    formatDateForInput(new Date())
  );

  const [notation, setNotation] = useState('');
  const [checkNumber, setCheckNumber] = useState('');

  const [bankAccount, setBankAccount] = useState('');
  const [glNumber, setGLNumber] = useState('');
  const [expenseRefundGLNumber, setExpenseRefundGLNumber] =
    useState('');

  const [residentNameSearch, setResidentNameSearch] =
    useState('');

  const [vendorNameSearch, setVendorNameSearch] =
    useState('');

  const [residentAddressSearch, setResidentAddressSearch] =
    useState('');

  const [helperEntityId, setHelperEntityId] = useState('');

  const [remainingDeposit, setRemainingDeposit] = useState('');
  const [totalOwed, setTotalOwed] = useState('$0.00');
  const [totalPaid, setTotalPaid] = useState('$0.00');

  const [residentCredit, setResidentCredit] =
    useState('$0.00');

  const [useResidentCredit, setUseResidentCredit] =
    useState(false);

  const [creditUsed, setCreditUsed] = useState('$0.00');
  const [remainingCredit, setRemainingCredit] =
    useState('$0.00');

  const selectedGL = useMemo(
    () =>
      glAccounts.find(
        (account) => account.value === glNumber
      ) || null,
    [glNumber]
  );

  const expenseRefundSelected =
    selectedGL?.classification === 'Expense Credit Refund';

  const loadResident = (residentId) => {
    const resident = residents.find(
      (item) => item.id === residentId
    );

    if (!resident) return;

    setEntityId(resident.id);
    setEntityName(resident.fullName);
    setEntityAddress(resident.address);
    setHelperEntityId(resident.id);

    setResidentNameSearch(resident.id);
    setResidentAddressSearch(resident.id);
    setVendorNameSearch('');
  };

  const loadVendor = (vendorId) => {
    const vendor = vendors.find(
      (item) => item.id === vendorId
    );

    if (!vendor) return;

    setEntityId(vendor.id);
    setEntityName(vendor.name);
    setEntityAddress('');
    setHelperEntityId(vendor.id);

    setVendorNameSearch(vendor.id);
    setResidentNameSearch('');
    setResidentAddressSearch('');
  };

  const handleResidentNameChange = (event) => {
    const residentId = event.target.value;

    setResidentNameSearch(residentId);

    if (!residentId) return;

    loadResident(residentId);
  };

  const handleResidentAddressChange = (event) => {
    const residentId = event.target.value;

    setResidentAddressSearch(residentId);

    if (!residentId) return;

    loadResident(residentId);
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

  const handleAmountChange = (event) => {
    const normalized = normalizeMoneyInput(
      event.target.value
    );

    setDepositAmount(normalized);
    setRemainingDeposit(
      normalized ? formatMoney(normalized) : ''
    );
  };

  const handleAmountBlur = () => {
    if (!depositAmount) return;

    setDepositAmount(
      parseMoney(depositAmount).toFixed(2)
    );
  };

  const handleGLChange = (event) => {
    const newGLNumber = event.target.value;

    setGLNumber(newGLNumber);

    const newGL = glAccounts.find(
      (account) => account.value === newGLNumber
    );

    if (
      newGL?.classification !== 'Expense Credit Refund'
    ) {
      setExpenseRefundGLNumber('');
    }
  };

  const requiredFieldsComplete =
    Boolean(entityId) &&
    Boolean(entityName) &&
    parseMoney(depositAmount) > 0 &&
    Boolean(depositDate.trim()) &&
    Boolean(bankAccount) &&
    Boolean(glNumber) &&
    (
      !expenseRefundSelected ||
      Boolean(expenseRefundGLNumber)
    );

  const clearForm = () => {
    setEntityId('');
    setEntityName('');
    setEntityAddress('');

    setDepositAmount('');
    setDepositDate(formatDateForInput(new Date()));
    setNotation('');
    setCheckNumber('');

    setBankAccount('');
    setGLNumber('');
    setExpenseRefundGLNumber('');

    setResidentNameSearch('');
    setVendorNameSearch('');
    setResidentAddressSearch('');
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
      window.alert(
        'Please complete all required fields before entering the deposit.'
      );

      return;
    }

    const now = new Date();

    const newDeposit = {
      checkNumber,
      depositorName: entityName,
      amount: formatMoney(depositAmount),

      bankAccount,

      glAccount:
        selectedGL?.classification ||
        selectedGL?.label ||
        '',

      depositDate,
      dateCleared: '',
      monthCleared: '',

      ownerAccount:
        entityId.startsWith('V') ? '' : entityId,

      depositorId: entityId,

      vendorId:
        entityId.startsWith('V') ? entityId : '',

      invoiceNumber: '',

      expenseRefundGLCategory:
        expenseRefundSelected
          ? 'Expense Credit Refund'
          : '',

      expenseRefundGLNumber:
        expenseRefundSelected
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
        bankAccount === 'Escrow Acct' ? 'Y' : 'N'
    };

    const confirmed = window.confirm(
      'Enter this new deposit?\n\n' +
        `Depositor: ${newDeposit.depositorName}\n` +
        `Amount: ${newDeposit.amount}\n` +
        `Bank: ${newDeposit.bankAccount}\n` +
        `GL: ${newDeposit.glNumber} - ${newDeposit.glAccount}`
    );

    if (!confirmed) return;

    if (typeof onAddDeposit === 'function') {
      onAddDeposit(newDeposit);
    }

    window.alert(
      'The deposit was added to the bottom of the Deposit Register.'
    );

    clearForm();
  };

  return (
    <div className="enter-deposit-uf">
      <div className="enter-deposit-title">
        $$ DEPOSIT ENTRY:
      </div>

      <div className="enter-deposit-subtitle">
        (Use Assmt Paymt Register for Assessment Payments)
      </div>

      <div className="enter-deposit-grid">
        <div className="enter-deposit-column enter-deposit-left">
          <label className="enter-deposit-field">
            <span>Vendor/Resident ID</span>

            <input
              type="text"
              value={entityId}
              readOnly
            />
          </label>

          <label className="enter-deposit-field">
            <span>Vendor / Resident Name</span>

            <input
              type="text"
              value={entityName}
              readOnly
            />
          </label>

          <label className="enter-deposit-field">
            <span>Vendor / Resident Address</span>

            <input
              type="text"
              value={entityAddress}
              readOnly
            />
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
                value={depositDate}
                onChange={(event) =>
                  setDepositDate(event.target.value)
                }
              />
            </label>
          </div>

          <label className="enter-deposit-field">
            <span>Deposit Notation</span>

            <textarea
              value={notation}
              onChange={(event) =>
                setNotation(event.target.value)
              }
            />
          </label>

          <div className="enter-deposit-check-submit-row">
            <label className="enter-deposit-field enter-deposit-check-field">
              <span>Check # Being Deposited</span>

              <input
                type="text"
                value={checkNumber}
                onChange={(event) =>
                  setCheckNumber(event.target.value)
                }
              />
            </label>

            <button
              type="button"
              className="enter-deposit-submit"
              disabled={!requiredFieldsComplete}
              onClick={handleEnterDeposit}
            >
              ENTER DEPOSIT DATA
            </button>
          </div>
        </div>

        <div className="enter-deposit-column enter-deposit-middle">
          <label className="enter-deposit-field">
            <span>Bank Account</span>

            <select
              value={bankAccount}
              onChange={(event) =>
                setBankAccount(event.target.value)
              }
            >
              <option value="">-- Select Bank --</option>

              {banks.map((bank) => (
                <option
                  key={bank.value}
                  value={bank.value}
                >
                  {bank.label}
                </option>
              ))}
            </select>
          </label>

          <label className="enter-deposit-field">
            <span>G/L Account</span>

            <select
              value={glNumber}
              onChange={handleGLChange}
            >
              <option value="">-- Select GL --</option>

              {glAccounts.map((account) => (
                <option
                  key={account.value}
                  value={account.value}
                >
                  {account.label}
                </option>
              ))}
            </select>
          </label>

          <label className="enter-deposit-field">
            <span>
              If Expense Credit Refund, Select Expense
            </span>

            <select
              value={expenseRefundGLNumber}
              onChange={(event) =>
                setExpenseRefundGLNumber(
                  event.target.value
                )
              }
              disabled={!expenseRefundSelected}
            >
              <option value="">
                -- Select Expense --
              </option>

              {glAccounts
                .filter(
                  (account) =>
                    account.classification !==
                    'Expense Credit Refund'
                )
                .map((account) => (
                  <option
                    key={account.value}
                    value={account.value}
                  >
                    {account.label}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <div className="enter-deposit-column enter-deposit-right">
          <div className="enter-deposit-right-heading">
            <div>
              <div className="enter-deposit-right-label">
                Resident Fine / Late Fee / ARB &amp; Const.
                Fine Inv#
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

              <input
                type="text"
                value={remainingDeposit}
                readOnly
              />
            </label>
          </div>

          <div className="enter-deposit-invoice-head">
            <span>Inv#</span>
            <span>Amt $$</span>
            <span>Type Code</span>
            <span>Description</span>
          </div>

          <div className="enter-deposit-invoice-box" />

          <button
            type="button"
            className="enter-deposit-recalc"
          >
            Recalculations OK!
          </button>

          <div className="enter-deposit-summary-row">
            <label className="enter-deposit-field">
              <span>Total Invoice $$ Owed</span>

              <input
                type="text"
                value={totalOwed}
                onChange={(event) =>
                  setTotalOwed(event.target.value)
                }
              />
            </label>

            <label className="enter-deposit-field">
              <span>Total Invoice $$ Paid</span>

              <input
                type="text"
                value={totalPaid}
                onChange={(event) =>
                  setTotalPaid(event.target.value)
                }
              />
            </label>
          </div>

          <div className="enter-deposit-credit-row">
            <label className="enter-deposit-field">
              <span>Resident Credit</span>

              <input
                type="text"
                value={residentCredit}
                onChange={(event) =>
                  setResidentCredit(event.target.value)
                }
              />
            </label>

            <label className="enter-deposit-use-credit">
              <input
                type="checkbox"
                checked={useResidentCredit}
                onChange={(event) =>
                  setUseResidentCredit(
                    event.target.checked
                  )
                }
              />

              <span>
                Use Resident Credit $ To Pay Fines &amp;
                Late Fees
              </span>
            </label>
          </div>

          <div className="enter-deposit-credit-line">
            <input
              type="text"
              value={creditUsed}
              onChange={(event) =>
                setCreditUsed(event.target.value)
              }
            />

            <span>Credit Used to Pay Invoices</span>
          </div>

          <div className="enter-deposit-credit-line">
            <input
              type="text"
              value={remainingCredit}
              onChange={(event) =>
                setRemainingCredit(event.target.value)
              }
            />

            <span>
              Credit Remaining After Invoice Payment
            </span>
          </div>

          <div className="enter-deposit-bottom-note">
            Note: Remaining $$ will be applied as Pre-Paid
            Credit to Resident Account
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

            <select
              value={residentNameSearch}
              onChange={handleResidentNameChange}
            >
              <option value="">
                -- Select Resident --
              </option>

              {residents.map((resident) => (
                <option
                  key={resident.id}
                  value={resident.id}
                >
                  {resident.name} - {resident.address}
                </option>
              ))}
            </select>
          </label>

          <label className="enter-deposit-field">
            <span>Vendor Name</span>

            <select
              value={vendorNameSearch}
              onChange={handleVendorNameChange}
            >
              <option value="">
                -- Select Vendor --
              </option>

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
        </div>

        <div className="enter-deposit-search-bottom">
          <label className="enter-deposit-field">
            <span>Resident Address</span>

            <select
              value={residentAddressSearch}
              onChange={handleResidentAddressChange}
            >
              <option value="">
                -- Select Address --
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

          <label className="enter-deposit-field enter-deposit-helper-id">
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
  );
}

export default EnterDepositUF;
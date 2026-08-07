const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3011;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const [result] = await db.query('SELECT 1 as alive');
    res.json({ status: 'ok', database: 'hoamanager26', alive: result[0].alive === 1 });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/* ===========================================================
   1. MAIN DIRECTORY (ResidentMaster)
   =========================================================== */

function parseDecimal(val, defaultVal = 0.00) {
  if (val === undefined || val === null) return defaultVal;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? defaultVal : num;
}

app.get('/api/residents', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ResidentAccountID as account_id,
        FirstName as first_name,
        MiddleName as middle_name,
        LastName as last_name,
        DisplayName as display_name,
        ResidenceAddress as residence_address,
        BillingAddress as billing_address,
        City as city,
        StateCode as state_code,
        ZipCode as zip_code,
        PrimaryPhone as primary_phone,
        PrimaryCell as primary_cell,
        SecondaryCell as secondary_cell,
        EmailAddress as email_address,
        MoveInDate as move_in_date,
        ResidentType as resident_type,
        ActiveResidentFlag as active_flag,
        ACHFlag as ach_flag,
        AdditionalOwnerFirstName as addl_first_name,
        AdditionalOwnerMiddleName as addl_middle_name,
        AdditionalOwnerLastName as addl_last_name,
        AdditionalOwnerEmail as addl_email,
        AnnualDuesRate as annual_dues_rate,
        AnnualDues as annual_dues,
        SpecialAssessmentRate as special_assessment_rate,
        SpecialAssessmentDues as special_assessment_dues,
        NextYearAnnualDues as next_year_annual_dues,
        NextYearSpecialAssmtDues as next_year_special_assmt_dues,
        ResidentNotes as resident_notes
      FROM ResidentMaster 
      WHERE DeletedFlag IS NULL OR DeletedFlag != 'Y'
      ORDER BY ResidentAccountID ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching residents:', err);
    res.status(500).json({ error: 'Failed to fetch residents', details: err.message });
  }
});

app.post('/api/residents', async (req, res) => {
  try {
    const r = req.body;
    const [result] = await db.query(`
      INSERT INTO ResidentMaster (
        ResidentAccountID, FirstName, MiddleName, LastName, DisplayName, ResidenceAddress, BillingAddress,
        City, StateCode, ZipCode, PrimaryPhone, PrimaryCell, SecondaryCell, EmailAddress, MoveInDate,
        ResidentType, ActiveResidentFlag, ACHFlag, AdditionalOwnerFirstName, AdditionalOwnerMiddleName,
        AdditionalOwnerLastName, AdditionalOwnerEmail, AnnualDuesRate, AnnualDues, SpecialAssessmentRate,
        SpecialAssessmentDues, NextYearAnnualDues, NextYearSpecialAssmtDues, ResidentNotes,
        MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW())
    `, [
      r.account_id || `RES-${Date.now()}`,
      r.first_name || null,
      r.middle_name || null,
      r.last_name || null,
      r.display_name || null,
      r.residence_address || null,
      r.billing_address || null,
      r.city || null,
      r.state_code || null,
      r.zip_code || null,
      r.primary_phone || null,
      r.primary_cell || null,
      r.secondary_cell || null,
      r.email_address || null,
      r.move_in_date || null,
      r.resident_type || null,
      r.active_flag || 'Y',
      r.ach_flag || null,
      r.addl_first_name || null,
      r.addl_middle_name || null,
      r.addl_last_name || null,
      r.addl_email || null,
      parseDecimal(r.annual_dues_rate),
      parseDecimal(r.annual_dues),
      parseDecimal(r.special_assessment_rate),
      parseDecimal(r.special_assessment_dues),
      parseDecimal(r.next_year_annual_dues),
      parseDecimal(r.next_year_special_assmt_dues),
      r.resident_notes || null
    ]);
    res.status(201).json({ success: true, insertedId: result.insertId, account_id: r.account_id });
  } catch (err) {
    console.error('Error inserting resident:', err);
    res.status(500).json({ error: 'Failed to insert resident', details: err.message });
  }
});

app.put('/api/residents/:account_id', async (req, res) => {
  try {
    const { account_id } = req.params;
    const r = req.body;
    await db.query(`
      UPDATE ResidentMaster SET
        FirstName = ?,
        MiddleName = ?,
        LastName = ?,
        DisplayName = ?,
        ResidenceAddress = ?,
        BillingAddress = ?,
        City = ?,
        StateCode = ?,
        ZipCode = ?,
        PrimaryPhone = ?,
        PrimaryCell = ?,
        SecondaryCell = ?,
        EmailAddress = ?,
        MoveInDate = ?,
        ResidentType = ?,
        ActiveResidentFlag = ?,
        ACHFlag = ?,
        AdditionalOwnerFirstName = ?,
        AdditionalOwnerMiddleName = ?,
        AdditionalOwnerLastName = ?,
        AdditionalOwnerEmail = ?,
        AnnualDuesRate = ?,
        AnnualDues = ?,
        SpecialAssessmentRate = ?,
        SpecialAssessmentDues = ?,
        NextYearAnnualDues = ?,
        NextYearSpecialAssmtDues = ?,
        ResidentNotes = ?,
        TimeStampUpdated = NOW()
      WHERE ResidentAccountID = ?
    `, [
      r.first_name || null,
      r.middle_name || null,
      r.last_name || null,
      r.display_name || null,
      r.residence_address || null,
      r.billing_address || null,
      r.city || null,
      r.state_code || null,
      r.zip_code || null,
      r.primary_phone || null,
      r.primary_cell || null,
      r.secondary_cell || null,
      r.email_address || null,
      r.move_in_date || null,
      r.resident_type || null,
      r.active_flag || 'Y',
      r.ach_flag || null,
      r.addl_first_name || null,
      r.addl_middle_name || null,
      r.addl_last_name || null,
      r.addl_email || null,
      parseDecimal(r.annual_dues_rate),
      parseDecimal(r.annual_dues),
      parseDecimal(r.special_assessment_rate),
      parseDecimal(r.special_assessment_dues),
      parseDecimal(r.next_year_annual_dues),
      parseDecimal(r.next_year_special_assmt_dues),
      r.resident_notes || null,
      account_id
    ]);
    res.json({ success: true, message: 'Resident updated successfully' });
  } catch (err) {
    console.error('Error updating resident:', err);
    res.status(500).json({ error: 'Failed to update resident', details: err.message });
  }
});

/* ===========================================================
   2. VENDOR ID LIST (VendorMaster)
   =========================================================== */

app.get('/api/vendors', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        VendorID as vendor_id,
        VendorName as vendor_name,
        CareOfAddressLine as co_address,
        AddressLine1 as address,
        AddressLine2 as address2,
        City as city,
        StateCode as state,
        ZipCode as zip,
        PrimaryPhone as phone,
        EmailAddress as email,
        ContactName as contact_name,
        VendorType as vendor_type,
        TaxID as tax_id,
        ElectronicCheckYN as electronic_check,
        ElectronicCheckAmount as electronic_check_amount,
        ElectronicCheckStartMonth as start_month,
        ElectronicCheckStartDay as start_day,
        BankAccount as bank_account,
        DefaultGLNumber as default_gl_number,
        DefaultGLAccountName as default_gl_name,
        CurrentTransactionNumber as current_txn,
        CheckNotation as default_check_note,
        VendorNotes as notes,
        ActiveFlag as active_flag
      FROM VendorMaster
      WHERE DeletedFlag IS NULL OR DeletedFlag != 'Y'
      ORDER BY VendorName ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ error: 'Failed to fetch vendors', details: err.message });
  }
});

app.post('/api/vendors', async (req, res) => {
  try {
    const v = req.body;
    const vendorId = v.vendor_id || `VEND-${Date.now().toString().slice(-4)}`;
    await db.query(`
      INSERT INTO VendorMaster (
        VendorID, VendorName, CareOfAddressLine, AddressLine1, AddressLine2, City, StateCode, ZipCode,
        PrimaryPhone, EmailAddress, ContactName, VendorType, TaxID,
        ElectronicCheckYN, ElectronicCheckAmount, ElectronicCheckStartMonth, ElectronicCheckStartDay, BankAccount,
        DefaultGLNumber, DefaultGLAccountName, CheckNotation, VendorNotes, ActiveFlag, MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW())
    `, [
      vendorId,
      v.vendor_name || '',
      v.co_address || '',
      v.address || '',
      v.address2 || '',
      v.city || 'Miami',
      v.state || 'FL',
      v.zip || '33101',
      v.phone || '',
      v.email || '',
      v.contact_name || '',
      v.vendor_type || 'General',
      v.tax_id || '',
      v.electronic_check || 'N',
      v.electronic_check_amount || null,
      v.start_month || null,
      v.start_day || null,
      v.bank_account || '',
      v.default_gl_number || 5000,
      v.default_gl_name || 'General Expense',
      v.default_check_note || '',
      v.notes || '',
      v.active_flag || 'Y'
    ]);
    res.status(201).json({ success: true, vendor_id: vendorId });
  } catch (err) {
    console.error('Error inserting vendor:', err);
    res.status(500).json({ error: 'Failed to insert vendor', details: err.message });
  }
});

app.put('/api/vendors/:vendor_id', async (req, res) => {
  try {
    const { vendor_id } = req.params;
    const v = req.body;
    await db.query(`
      UPDATE VendorMaster SET
        VendorName = ?,
        CareOfAddressLine = ?,
        AddressLine1 = ?,
        AddressLine2 = ?,
        City = ?,
        StateCode = ?,
        ZipCode = ?,
        PrimaryPhone = ?,
        EmailAddress = ?,
        ContactName = ?,
        VendorType = ?,
        TaxID = ?,
        ElectronicCheckYN = ?,
        ElectronicCheckAmount = ?,
        ElectronicCheckStartMonth = ?,
        ElectronicCheckStartDay = ?,
        BankAccount = ?,
        DefaultGLNumber = ?,
        DefaultGLAccountName = ?,
        CheckNotation = ?,
        VendorNotes = ?,
        ActiveFlag = ?,
        TimeStampUpdated = NOW()
      WHERE VendorID = ? AND (DeletedFlag IS NULL OR DeletedFlag != 'Y')
    `, [
      v.vendor_name || '',
      v.co_address || '',
      v.address || '',
      v.address2 || '',
      v.city || 'Miami',
      v.state || 'FL',
      v.zip || '33101',
      v.phone || '',
      v.email || '',
      v.contact_name || '',
      v.vendor_type || 'General',
      v.tax_id || '',
      v.electronic_check || 'N',
      v.electronic_check_amount || null,
      v.start_month || null,
      v.start_day || null,
      v.bank_account || '',
      v.default_gl_number || 5000,
      v.default_gl_name || 'General Expense',
      v.default_check_note || '',
      v.notes || '',
      v.active_flag || 'Y',
      vendor_id
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating vendor:', err);
    res.status(500).json({ error: 'Failed to update vendor', details: err.message });
  }
});

app.delete('/api/vendors/:vendor_id', async (req, res) => {
  try {
    const { vendor_id } = req.params;
    await db.query(`
      UPDATE VendorMaster SET
        DeletedFlag = 'Y',
        DeletedDate = NOW(),
        DeletedByOperatorID = 'SYSTEM'
      WHERE VendorID = ?
    `, [vendor_id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting vendor:', err);
    res.status(500).json({ error: 'Failed to delete vendor', details: err.message });
  }
});

/* ===========================================================
   3. CHECK REGISTER (CheckRegister)
   =========================================================== */

app.get('/api/check-register', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        CheckTransactionNumber as check_txn_num,
        CheckNumber as check_number,
        GLAccountName as gl_name,
        Amount as amount,
        DateCheckIssued as date_issued,
        DateCheckCleared as date_cleared,
        MonthCleared as month_cleared,
        GLNumber as gl_number,
        VendorResidentID as payee_id,
        VendorInvoiceNumber as invoice_num,
        VendorInvoiceDate as invoice_date,
        VendorInvoiceAmount as invoice_amount,
        CheckNotation as note,
        BankAccount as bank_account,
        BankAccountID as bank_account_id,
        Status as status
      FROM CheckRegister
      WHERE DeletedFlag IS NULL OR DeletedFlag != 'Y'
      ORDER BY DateCheckIssued DESC, CheckNumber DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching checks:', err);
    res.status(500).json({ error: 'Failed to fetch check register', details: err.message });
  }
});

app.post('/api/check-register', async (req, res) => {
  try {
    const c = req.body;
    const txnNum = `CHK-${Date.now()}`;
    await db.query(`
      INSERT INTO CheckRegister (
        CheckTransactionNumber, CheckNumber, GLAccountName, Amount, DateCheckIssued,
        DateCheckCleared, MonthCleared, GLNumber, VendorResidentID, VendorInvoiceNumber,
        VendorInvoiceDate, VendorInvoiceAmount, CheckNotation, BankAccount, BankAccountID, Status,
        MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Issued', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW())
    `, [
      txnNum,
      c.check_number || '',
      c.gl_name || '',
      c.amount || 0.00,
      c.date_issued || new Date().toISOString().slice(0, 10),
      c.date_cleared || null,
      c.month_cleared || null,
      c.gl_number || 5000,
      c.payee_id || '',
      c.invoice_num || '',
      c.invoice_date || null,
      c.invoice_amount || c.amount || 0.00,
      c.note || '',
      c.bank_account || 'Operating 101',
      c.bank_account_id || 1
    ]);
    res.status(201).json({ success: true, check_txn_num: txnNum });
  } catch (err) {
    console.error('Error inserting check:', err);
    res.status(500).json({ error: 'Failed to insert check', details: err.message });
  }
});

/* ===========================================================
   4. DEPOSIT REGISTER (DepositRegister)
   =========================================================== */

app.get('/api/deposit-register', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DepositTransactionNumber as deposit_txn_num,
        DepositorAccountName as payer_name,
        Amount as amount,
        BankAccountName as bank_account_name,
        BankAccountID as bank_account_id,
        GLAccountName as gl_name,
        GLNumber as gl_number,
        DateDeposited as date_deposited,
        DateCleared as date_cleared,
        MonthCleared as month_cleared,
        ResidentAccountID as resident_id,
        VendorID as vendor_id,
        DepositNotation as note,
        Status as status
      FROM DepositRegister
      WHERE DeletedFlag IS NULL OR DeletedFlag != 'Y'
      ORDER BY DateDeposited DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching deposits:', err);
    res.status(500).json({ error: 'Failed to fetch deposit register', details: err.message });
  }
});

app.post('/api/deposit-register', async (req, res) => {
  try {
    const d = req.body;
    const txnNum = `DEP-${Date.now()}`;
    await db.query(`
      INSERT INTO DepositRegister (
        DepositTransactionNumber, DepositorAccountName, Amount, BankAccountName,
        BankAccountID, GLAccountName, GLNumber, DateDeposited, DateCleared, MonthCleared,
        ResidentAccountID, DepositNotation, Status, MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Posted', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW())
    `, [
      txnNum,
      d.payer_name || '',
      d.amount || 0.00,
      d.bank_account_name || 'Operating 101',
      d.bank_account_id || 1,
      d.gl_name || 'Maintenance Dues Income',
      d.gl_number || 4010,
      d.date_deposited || new Date().toISOString().slice(0, 10),
      d.date_cleared || null,
      d.month_cleared || null,
      d.resident_id || '',
      d.note || ''
    ]);
    res.status(201).json({ success: true, deposit_txn_num: txnNum });
  } catch (err) {
    console.error('Error inserting deposit:', err);
    res.status(500).json({ error: 'Failed to insert deposit', details: err.message });
  }
});

/* ===========================================================
   5. SETTINGS: HOA PROFILE
   =========================================================== */

app.get('/api/settings/hoa-profile', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ProfileID,
        MgtCoClientID,
        HOALicenseNumber,
        HOAName,
        HOABillingName,
        HOALetterName,
        HOAAddress,
        HOAEmail,
        ContactName,
        ContactPhone,
        ContactEmail,
        HOANotes,
        LicenseStatus,
        SubscriptionRenewalDate,
        LicenseType,
        LicenseSize,
        ClientNotes,
        SelfManaged,
        MgtCoName,
        MgtCoAddress,
        MgtCoContactName,
        MgtCoContactTel,
        MgtCoContactEmail,
        ClientRepresentative,
        RepPhone,
        RepEmail,
        MgtCoLetterEmail,
        MgtCoLetterPhone,
        ManagementNotes
      FROM HOAProfile
      LIMIT 1
    `);
    
    if (rows.length === 0) {
      return res.json({
        hoaProfile: {},
        clientInfo: {},
        management: {}
      });
    }

    const r = rows[0];
    res.json({
      hoaProfile: {
        hoaCorporateName: r.HOAName || '',
        hoaBillingName: r.HOABillingName || '',
        hoaLetterName: r.HOALetterName || '',
        hoaAddress: r.HOAAddress || '',
        hoaEmail: r.HOAEmail || '',
        hoaContactName: r.ContactName || '',
        hoaContactTel: r.ContactPhone || '',
        hoaNotes: r.HOANotes || ''
      },
      clientInfo: {
        clientId: r.MgtCoClientID || '',
        licenseNumber: r.HOALicenseNumber || '',
        licenseStatus: r.LicenseStatus || 'Active',
        subscriptionRenewalDate: r.SubscriptionRenewalDate || '2026-12-31',
        licenseType: r.LicenseType || 'Standard',
        licenseSize: r.LicenseSize || '100',
        clientNotes: r.ClientNotes || ''
      },
      management: {
        selfManaged: r.SelfManaged || 'N',
        mgtCoName: r.MgtCoName || '',
        mgtCoAddress: r.MgtCoAddress || '',
        mgtCoContactName: r.MgtCoContactName || '',
        mgtCoContactTel: r.MgtCoContactTel || '',
        mgtCoContactEmail: r.MgtCoContactEmail || '',
        clientRepresentative: r.ClientRepresentative || '',
        repTel: r.RepPhone || '',
        repEmail: r.RepEmail || '',
        mgtCoLetterEmail: r.MgtCoLetterEmail || '',
        mgtCoLetterTel: r.MgtCoLetterPhone || '',
        managementNotes: r.ManagementNotes || ''
      }
    });
  } catch (err) {
    console.error('Error fetching HOA profile:', err);
    res.status(500).json({ error: 'Failed to fetch HOA profile', details: err.message });
  }
});

app.put('/api/settings/hoa-profile', async (req, res) => {
  try {
    const data = req.body;
    const hp = data.hoaProfile || {};
    const ci = data.clientInfo || {};
    const mgt = data.management || {};

    await db.query(`
      UPDATE HOAProfile SET
        HOAName = ?,
        HOABillingName = ?,
        HOALetterName = ?,
        HOAAddress = ?,
        HOAEmail = ?,
        ContactName = ?,
        ContactPhone = ?,
        ContactEmail = ?,
        HOANotes = ?,
        MgtCoClientID = ?,
        HOALicenseNumber = ?,
        LicenseStatus = ?,
        SubscriptionRenewalDate = ?,
        LicenseType = ?,
        LicenseSize = ?,
        ClientNotes = ?,
        SelfManaged = ?,
        MgtCoName = ?,
        MgtCoAddress = ?,
        MgtCoContactName = ?,
        MgtCoContactTel = ?,
        MgtCoContactEmail = ?,
        ClientRepresentative = ?,
        RepPhone = ?,
        RepEmail = ?,
        MgtCoLetterEmail = ?,
        MgtCoLetterPhone = ?,
        ManagementNotes = ?,
        TimeStampUpdated = NOW()
      WHERE ProfileID = 1 OR MgtCoClientID = ?
    `, [
      hp.hoaCorporateName || '',
      hp.hoaBillingName || '',
      hp.hoaLetterName || '',
      hp.hoaAddress || '',
      hp.hoaEmail || '',
      hp.hoaContactName || '',
      hp.hoaContactTel || '',
      hp.hoaEmail || '',
      hp.hoaNotes || '',
      ci.clientId || '',
      ci.licenseNumber || '',
      ci.licenseStatus || 'Active',
      ci.subscriptionRenewalDate || '',
      ci.licenseType || '',
      ci.licenseSize || '',
      ci.clientNotes || '',
      mgt.selfManaged || 'N',
      mgt.mgtCoName || '',
      mgt.mgtCoAddress || '',
      mgt.mgtCoContactName || '',
      mgt.mgtCoContactTel || '',
      mgt.mgtCoContactEmail || '',
      mgt.clientRepresentative || '',
      mgt.repTel || '',
      mgt.repEmail || '',
      mgt.mgtCoLetterEmail || '',
      mgt.mgtCoLetterTel || '',
      mgt.managementNotes || '',
      ci.clientId || 'MGTCO-001'
    ]);

    res.json({ success: true, message: 'HOA Profile updated successfully' });
  } catch (err) {
    console.error('Error updating HOA profile:', err);
    res.status(500).json({ error: 'Failed to update HOA profile', details: err.message });
  }
});



/* ===========================================================
   7. AUTO-REFRESH & GITHUB WEBHOOK (Flashback & CI/CD)
   =========================================================== */

let lastCommit = {
  flashback: { hash: `init-${Date.now()}`, updatedAt: new Date().toISOString() },
  backend: { hash: `init-${Date.now()}`, updatedAt: new Date().toISOString() },
  main: { hash: `init-${Date.now()}`, updatedAt: new Date().toISOString() }
};

app.get('/api/version', (req, res) => {
  const target = req.query.target || 'flashback';
  res.json(lastCommit[target] || lastCommit.flashback);
});

app.post('/api/webhook/github', (req, res) => {
  const payload = req.body || {};
  const ref = payload.ref || '';
  let branch = 'flashback';
  if (ref.includes('main')) branch = 'main';
  else if (ref.includes('backend')) branch = 'backend';
  else if (ref.includes('flashback')) branch = 'flashback';
  else if (ref.includes('frontend')) branch = 'frontend';

  const newHash = payload.after || `commit-${Date.now()}`;
  lastCommit[branch] = {
    hash: newHash,
    updatedAt: new Date().toISOString(),
    message: payload.head_commit?.message || 'Updated via GitHub Push'
  };

  console.log(`[GitHub Webhook] Push event for branch '${branch}': commit ${newHash}`);
  res.json({ success: true, branch, commit: newHash });
});

/* ===========================================================
   8. OPENROUTER AI FILTER API
   =========================================================== */

app.post('/api/ai-filter', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt string is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || '';
    const model = process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';

    const systemMessage = `You are a database AI query parser. Translate natural language queries into a SQL WHERE clause compatible with the following MySQL database table schema for the "ResidentMaster" table. Do not make assumptions about data not defined in the schema.

Table: ResidentMaster
Schema Fields:
- ResidentAccountID (VARCHAR, Primary Key - Unique resident account identifier e.g., "RES-001")
- LastName (VARCHAR - Last name of the resident e.g., "Mitchell")
- FirstName (VARCHAR - First name of the resident e.g., "James")
- ResidenceAddress (VARCHAR - Street address of the resident's home/residence e.g., "8901 Palm Vista Cir")
- City (VARCHAR - City where the resident lives e.g., "Miami")
- StateCode (VARCHAR - 2-letter state code of the resident e.g., "FL", "NY", "CA", "TX")
- ZipCode (VARCHAR - Zip or postal code of the resident e.g., "33156")
- AnnualDuesRate (DECIMAL - Annual dues rate code or amount due per year e.g., 3600.00)
- EmailAddress (VARCHAR - Email address of the resident e.g., "james@email.com")
- PrimaryPhone (VARCHAR - Primary phone number of the resident e.g., "305-555-3001")
- ActiveResidentFlag (VARCHAR - Active/Inactive resident flag: "Y" for Active or "N" for Inactive)
- AnnualDuesBalance (DECIMAL - Outstanding dues balance or debt. A positive value means the resident owes money/debt, e.g. 150.00)

Rules:
1. Output ONLY a raw JSON object with a single "whereClause" string key.
2. The "whereClause" must be a valid SQL expression that can be appended directly to "SELECT * FROM ResidentMaster WHERE ".
3. Translate "estado de [Nombre]" (e.g., "estado de florida") to StateCode = 'FL'.
4. Translate "estado activo" or "activo" to ActiveResidentFlag = 'Y'. Translate "estado inactivo" or "inactivo" to ActiveResidentFlag = 'N'.
5. Use LIKE for substring matches (e.g. EmailAddress LIKE '%mitchell%' or PrimaryPhone LIKE '%305%').
6. Use LIKE 'prefix%' for starting letters (e.g. LastName LIKE 'C%').
7. Use standard comparison operators (=, !=, <, >, <=, >=).
8. For "mayores deudores" or similar ordering requests, you can append "ORDER BY AnnualDuesBalance DESC" or similar to the whereClause, but it MUST still be valid SQL syntactically (e.g., "AnnualDuesBalance > 0 ORDER BY AnnualDuesBalance DESC LIMIT 10").
9. Do not include markdown formatting, code blocks, or comments in your response.

Output Example:
{"whereClause":"StateCode = 'FL' AND AnnualDuesRate > 1000"}`;

    function conditionsToSql(conditions) {
      if (!conditions || conditions.length === 0) return '1=1';
      return conditions.map(c => {
        const escapedValue = String(c.value).replace(/'/g, "''");
        if (c.operator === 'contains') {
          return `${c.field} LIKE '%${escapedValue}%'`;
        }
        const isNumeric = !isNaN(c.value) && (c.field === 'AnnualDuesRate' || c.field === 'AnnualDuesBalance');
        const quote = isNumeric ? '' : "'";
        return `${c.field} ${c.operator} ${quote}${escapedValue}${quote}`;
      }).join(' AND ');
    }

    let whereClause = '1=1';
    let source = 'openrouter';

    if (!apiKey) {
      console.warn('[AI Filter] OPENROUTER_API_KEY not set. Using enhanced local fallback parser.');
      let conditions = [];
      const lower = prompt.toLowerCase().trim();

      const FULL_STATES = {
        'florida': 'FL', 'california': 'CA', 'new york': 'NY', 'texas': 'TX',
        'georgia': 'GA', 'illinois': 'IL', 'north carolina': 'NC', 'nevada': 'NV',
        'arizona': 'AZ', 'colorado': 'CO', 'washington': 'WA'
      };

      const STATE_CODES = ['FL', 'CA', 'NY', 'TX', 'GA', 'IL', 'NC', 'NV', 'AZ', 'CO', 'WA'];

      const KNOWN_CITIES = [
        'miami', 'orlando', 'tampa', 'fort lauderdale', 'new york', 'buffalo',
        'los angeles', 'san francisco', 'san diego', 'houston', 'dallas', 'austin',
        'atlanta', 'chicago', 'charlotte', 'las vegas', 'phoenix', 'denver', 'seattle'
      ];

      const cleanPrompt = prompt.replace(/["']/g, '').trim();

      // 1. Last Name check ("last name = Chen", "apellido Chen", "last name Chen", "apellido = Chen")
      const lastNameMatch = cleanPrompt.match(/(?:last\s*name|apellido)\s*(?:=|is|igual a|:)?\s*([a-zA-Z\s]+)/i);
      if (lastNameMatch && lastNameMatch[1]) {
        const val = lastNameMatch[1].trim();
        if (val) {
          conditions.push({ field: 'LastName', operator: '=', value: val });
        }
      }

      // 2. First Name check ("first name = James", "nombre James", "first name James")
      const firstNameMatch = cleanPrompt.match(/(?:first\s*name|nombre)\s*(?:=|is|igual a|:)?\s*([a-zA-Z\s]+)/i);
      if (firstNameMatch && firstNameMatch[1] && !cleanPrompt.toLowerCase().includes('last name')) {
        const val = firstNameMatch[1].trim();
        if (val) {
          conditions.push({ field: 'FirstName', operator: '=', value: val });
        }
      }

      // 3. Account Number check ("acctNo = RES-001", "account = RES-001", "cuenta RES-001")
      const acctMatch = cleanPrompt.match(/(?:acct|account|cuenta|res)\s*(?:no|number|#)?\s*(?:=|is|igual a|:)?\s*(RES-?\d+|\d+)/i);
      if (acctMatch && acctMatch[1]) {
        let val = acctMatch[1].trim();
        if (!val.toUpperCase().startsWith('RES-')) val = `RES-${val.padStart(3, '0')}`;
        conditions.push({ field: 'ResidentAccountID', operator: '=', value: val.toUpperCase() });
      }

      // 4. Phone Number check ("phone = 305-555-3001", "telefono 305")
      const phoneMatch = cleanPrompt.match(/(?:phone|telefono|cell|celular)\s*(?:=|is|igual a|:)?\s*([\d\-\(\)\s]+)/i);
      if (phoneMatch && phoneMatch[1]) {
        const val = phoneMatch[1].trim();
        if (val.length >= 3) {
          conditions.push({ field: 'PrimaryPhone', operator: 'contains', value: val });
        }
      }

      // 5. Email check ("email = mitchell", "correo mitchell@example.com")
      const emailMatch = cleanPrompt.match(/(?:email|correo)\s*(?:=|is|igual a|:)?\s*([a-zA-Z0-9\.\@\_]+)/i);
      if (emailMatch && emailMatch[1]) {
        const val = emailMatch[1].trim();
        if (val) {
          conditions.push({ field: 'EmailAddress', operator: 'contains', value: val });
        }
      }

      // 6. State check
      let stateMatched = false;
      for (const [name, code] of Object.entries(FULL_STATES)) {
        if (lower.includes(name)) {
          conditions.push({ field: 'StateCode', operator: '=', value: code });
          stateMatched = true;
          break;
        }
      }
      if (!stateMatched) {
        for (const code of STATE_CODES) {
          const regex = new RegExp(`\\b${code.toLowerCase()}\\b`, 'i');
          if (regex.test(lower)) {
            conditions.push({ field: 'StateCode', operator: '=', value: code });
            break;
          }
        }
      }

      // 7. City check
      for (const c of KNOWN_CITIES) {
        if (lower.includes(c)) {
          const capitalized = c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          conditions.push({ field: 'City', operator: 'contains', value: capitalized });
          break;
        }
      }

      // 8. Status check
      if (lower.includes('inactivo') || lower.includes('inactivos') || lower.includes('inactive')) {
        conditions.push({ field: 'ActiveResidentFlag', operator: '=', value: 'N' });
      } else if (lower.includes('activo') || lower.includes('activos') || lower.includes('active')) {
        conditions.push({ field: 'ActiveResidentFlag', operator: '=', value: 'Y' });
      }

      // 9. Annual Dues check
      if (lower.includes('dues') || lower.includes('rate') || lower.includes('cuota') || lower.includes('annual')) {
        if (lower.includes('mayor que') || lower.includes('>') || lower.includes('greater')) {
          const match = lower.match(/\d+(\.\d+)?/);
          const val = match ? parseFloat(match[0]) : 0;
          conditions.push({ field: 'AnnualDuesRate', operator: '>', value: val });
        }
      }

      // 10. Debtors check ("deudores", "deuda", "deben")
      if (lower.includes('deudor') || lower.includes('deudores') || lower.includes('deuda') || lower.includes('deben') || lower.includes('debt')) {
        conditions.push({ field: 'AnnualDuesBalance', operator: '>', value: 0 });
      }

      whereClause = conditionsToSql(conditions);
      // For debtors in fallback, also add ordering
      if (lower.includes('deudor') || lower.includes('deudores') || lower.includes('deuda') || lower.includes('deben') || lower.includes('debt')) {
        whereClause += ' ORDER BY AnnualDuesBalance DESC';
        if (lower.includes('10') || lower.includes('diez')) {
          whereClause += ' LIMIT 10';
        }
      }

      source = 'fallback';
    } else {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3011',
          'X-Title': 'WM Plus Management'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[OpenRouter API Error]', errText);
        return res.status(502).json({ error: 'Failed to communicate with OpenRouter API', details: errText });
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || '{}';
      const cleanedJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);
      whereClause = parsed.whereClause || '1=1';
    }

    // Safety check: prevent destructive keywords
    const unsafeSqlPattern = /\b(drop|delete|update|insert|alter|replace|truncate|grant|revoke|union|create|exec)\b|;/i;
    if (unsafeSqlPattern.test(whereClause)) {
      console.error('[AI Filter Security] Unsafe SQL detected:', whereClause);
      return res.status(400).json({ error: 'Unsafe SQL query detected by security layer' });
    }

    console.log(`[AI Filter SQL] Executing query via ${source}: SELECT * FROM ResidentMaster WHERE ${whereClause}`);
    const [rows] = await db.readOnlyPool.query(`SELECT * FROM ResidentMaster WHERE ${whereClause}`);

    // Map database keys to frontend schema format
    const mappedResidents = rows.map(r => ({
      acctNo: r.ResidentAccountID,
      acct: r.ResidentAccountID,
      firstName: r.FirstName || '',
      middleName: r.MiddleName || '',
      lastName: r.LastName || '',
      prefix: r.prefix || '',
      name: r.DisplayName || `${r.FirstName || ''} ${r.LastName || ''}`.trim(),
      residence: r.ResidenceAddress || '',
      address: r.ResidenceAddress || '',
      billingAddress: r.BillingAddress || '',
      city: r.City || '',
      state: r.StateCode || '',
      st: r.StateCode || '',
      zip: r.ZipCode || '',
      phone: r.PrimaryPhone || '',
      email: r.EmailAddress || '',
      primaryCell: r.PrimaryCell || '',
      secondaryCell: r.SecondaryCell || '',
      moveInDate: r.MoveInDate || '',
      type: r.ResidentType || '',
      active: r.ActiveResidentFlag || 'Y',
      activeFlag: r.ActiveResidentFlag || 'Y',
      ach: r.ACHFlag || '',
      addlFirst: r.AdditionalOwnerFirstName || '',
      addlMiddle: r.AdditionalOwnerMiddleName || '',
      addlLast: r.AdditionalOwnerLastName || '',
      addlEmail: r.AdditionalOwnerEmail || '',
      bothFirst: `${r.FirstName || ''}${r.AdditionalOwnerFirstName ? ' & ' + r.AdditionalOwnerFirstName : ''}`.trim(),
      annualRate: r.AnnualDuesRate || 'Rate Code A',
      annualDues: r.AnnualDues !== null && r.AnnualDues !== undefined ? String(r.AnnualDues) : '',
      dues: r.AnnualDues || 0.00,
      specialRate: r.SpecialAssessmentRate || 'Rate Code A',
      specialDues: r.SpecialAssessmentDues !== null && r.SpecialAssessmentDues !== undefined ? String(r.SpecialAssessmentDues) : '',
      nextAnnual: r.NextYearAnnualDues !== null && r.NextYearAnnualDues !== undefined ? String(r.NextYearAnnualDues) : '',
      nextSpecial: r.NextYearSpecialAssmtDues !== null && r.NextYearSpecialAssmtDues !== undefined ? String(r.NextYearSpecialAssmtDues) : '',
      notes: r.ResidentNotes || '',
      proRata: r.pro_rata || ''
    }));

    return res.json({
      success: true,
      residents: mappedResidents,
      whereClause,
      source
    });

  } catch (err) {
    console.error('Error in /api/ai-filter:', err);
    return res.status(500).json({ error: 'AI Filter processing failed', details: err.message });
  }
});

/* ===========================================================
   6. SETTINGS: BANKING & FISCAL YEAR
   =========================================================== */

app.get('/api/settings/banking', async (req, res) => {
  try {
    const [bankRows] = await db.query(`SELECT * FROM BankAccount ORDER BY BankAccountID ASC`);
    const [fiscalRows] = await db.query(`SELECT * FROM FiscalYearSetup LIMIT 1`);

    const banks = bankRows.map(b => ({
      id: b.BankAccountID,
      bankType: b.BankType || '',
      bankName: b.BankName || '',
      bankId: b.BankID || '',
      active: b.ActiveFlag || 'Y',
      checkMode: b.CheckMode || 'None',
      startCheck: b.StartCheckNumber || '',
      glCashAccount: b.GLCashAccount || '',
      accountNumber: b.AccountNumber || '',
      routingNumber: b.RoutingNumber || '',
      startingBalance: b.StartingBalance || 0.00,
      startingMonth: b.StartingMonth || 'January',
      contactPerson: b.ContactPerson || '',
      contactTel: b.ContactTel || '',
      contactEmail: b.ContactEmail || '',
      coMingled: b.CoMingled || 'N',
      coMingledWith: b.CoMingledWith || '',
      notes: b.Notes || ''
    }));

    const f = fiscalRows[0] || {};
    const fiscalSetup = {
      openingRetainedEarnings: f.OpeningRetainedEarnings || 0.00,
      endingRetainedEarnings: f.EndingRetainedEarnings || 0.00,
      currentFiscalYearIncome: f.CurrentFiscalYearIncome || 0.00,
      accountsReceivable: f.AccountsReceivable || 0.00,
      accountsPayable: f.AccountsPayable || 0.00,
      interestEarned: f.InterestEarned || 0.00,
      previousYearsEndingIncome: f.PreviousYearsEndingIncome || 0.00,
      miscAssetEntry: f.MiscAssetEntry || 0.00,
      miscLiabilityEntry: f.MiscLiabilityEntry || 0.00,
      notes: f.Notes || ''
    };

    res.json({ success: true, banks, fiscalSetup });
  } catch (err) {
    console.error('Error fetching banking settings:', err);
    res.status(500).json({ error: 'Failed to fetch banking settings', details: err.message });
  }
});

app.put('/api/settings/banking', async (req, res) => {
  try {
    const { banks, fiscalSetup } = req.body;

    if (Array.isArray(banks)) {
      for (const b of banks) {
        if (b.id) {
          await db.query(`
            UPDATE BankAccount SET
              BankType=?, BankName=?, BankID=?, ActiveFlag=?, CheckMode=?,
              StartCheckNumber=?, GLCashAccount=?, AccountNumber=?, RoutingNumber=?,
              StartingBalance=?, StartingMonth=?, ContactPerson=?, ContactTel=?,
              ContactEmail=?, CoMingled=?, CoMingledWith=?, Notes=?, TimeStampUpdated=NOW()
            WHERE BankAccountID=?
          `, [
            b.bankType||'', b.bankName||'', b.bankId||'', b.active||'Y', b.checkMode||'None',
            b.startCheck||'', b.glCashAccount||'', b.accountNumber||'', b.routingNumber||'',
            b.startingBalance||0.00, b.startingMonth||'January', b.contactPerson||'', b.contactTel||'',
            b.contactEmail||'', b.coMingled||'N', b.coMingledWith||'', b.notes||'', b.id
          ]);
        }
      }
    }

    if (fiscalSetup) {
      const f = fiscalSetup;
      await db.query(`
        UPDATE FiscalYearSetup SET
          OpeningRetainedEarnings=?, EndingRetainedEarnings=?, CurrentFiscalYearIncome=?,
          AccountsReceivable=?, AccountsPayable=?, InterestEarned=?,
          PreviousYearsEndingIncome=?, MiscAssetEntry=?, MiscLiabilityEntry=?,
          Notes=?, TimeStampUpdated=NOW()
        WHERE FiscalYearSetupID=1
      `, [
        f.openingRetainedEarnings||0, f.endingRetainedEarnings||0, f.currentFiscalYearIncome||0,
        f.accountsReceivable||0, f.accountsPayable||0, f.interestEarned||0,
        f.previousYearsEndingIncome||0, f.miscAssetEntry||0, f.miscLiabilityEntry||0,
        f.notes||''
      ]);
    }

    res.json({ success: true, message: 'Banking settings saved successfully' });
  } catch (err) {
    console.error('Error saving banking settings:', err);
    res.status(500).json({ error: 'Failed to save banking settings', details: err.message });
  }
});

/* ===========================================================
   7. SETTINGS: GENERAL SYSTEM PROGRAMMING
   =========================================================== */

app.get('/api/settings/system', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM SystemSettings LIMIT 1`);
    if (rows.length === 0) {
      return res.json({ success: true, systemSettings: {} });
    }
    const r = rows[0];
    res.json({
      success: true,
      printing: {
        printingMode: r.PrintingMode || 'Local',
        printerName: r.PrinterName || '',
        webPrinterId: r.WebPrinterID || '',
        networkAddress: r.NetworkAddress || '',
        notes: r.PrintingNotes || ''
      },
      numbering: {
        residentStartingAcct: r.ResidentStartingAcct || '',
        vendorStartingAcct: r.VendorStartingAcct || '',
        notes: r.NumberingNotes || ''
      },
      streetNames: {
        streetNames: r.StreetNamesList || '',
        defaultCity: r.DefaultCity || '',
        defaultState: r.DefaultState || '',
        defaultZip: r.DefaultZip || '',
        notes: r.StreetNamesNotes || ''
      },
      webPlus: {
        webPlusActive: r.WebPlusActive || 'N',
        webPageIpName: r.WebPageIPName || '',
        webPageManager: r.WebPageManager || '',
        webManagerContact: r.WebManagerContact || '',
        notes: r.WebPlusNotes || ''
      },
      cfoManage: {
        cfoActive: r.CFOActive || 'N',
        cfoCompanyName: r.CFOCompanyName || '',
        cfoAddress: r.CFOAddress || '',
        cfoTel: r.CFOTel || '',
        cfoRepName: r.CFORepName || '',
        cfoRepTel: r.CFORepTel || '',
        cfoRepEmail: r.CFORepEmail || '',
        cfoVendorId: r.CFOVendorID || '',
        notes: r.CFONotes || ''
      },
      easyPay: {
        easyPayActive: r.EasyPayActive || 'N',
        finesPaidFirst: r.FinesPaidFirst || 'N',
        residentPaysCharges: r.ResidentPaysCharges || 'N',
        achActive: r.ACHActive || 'N',
        notes: r.EasyPayNotes || ''
      },
      estoppel: {
        residentEstoppelFee: r.ResidentEstoppelFee || 300.00,
        letterCode: r.EstoppelLetterCode || '99',
        paidDirectlyToMgtCo: r.PaidDirectlyToMgtCo || 'NO',
        payableToHoaSentToMgt: r.PayableToHoaSentToMgt || 'NO',
        transferWorkingCapitalFee: r.TransferWorkingCapitalFee || 63.00,
        notes: r.EstoppelNotes || ''
      }
    });
  } catch (err) {
    console.error('Error fetching system settings:', err);
    res.status(500).json({ error: 'Failed to fetch system settings', details: err.message });
  }
});

app.put('/api/settings/system', async (req, res) => {
  try {
    const { printing={}, numbering={}, streetNames={}, webPlus={}, cfoManage={}, easyPay={}, estoppel={} } = req.body;

    await db.query(`
      UPDATE SystemSettings SET
        PrintingMode=?, PrinterName=?, WebPrinterID=?, NetworkAddress=?, PrintingNotes=?,
        ResidentStartingAcct=?, VendorStartingAcct=?, NumberingNotes=?,
        StreetNamesList=?, DefaultCity=?, DefaultState=?, DefaultZip=?, StreetNamesNotes=?,
        WebPlusActive=?, WebPageIPName=?, WebPageManager=?, WebManagerContact=?, WebPlusNotes=?,
        CFOActive=?, CFOCompanyName=?, CFOAddress=?, CFOTel=?, CFORepName=?, CFORepTel=?, CFORepEmail=?, CFOVendorID=?, CFONotes=?,
        EasyPayActive=?, FinesPaidFirst=?, ResidentPaysCharges=?, ACHActive=?, EasyPayNotes=?,
        ResidentEstoppelFee=?, EstoppelLetterCode=?, PaidDirectlyToMgtCo=?, PayableToHoaSentToMgt=?, TransferWorkingCapitalFee=?, EstoppelNotes=?,
        TimeStampUpdated=NOW()
      WHERE SystemSettingsID=1
    `, [
      printing.printingMode||'Local', printing.printerName||'', printing.webPrinterId||'', printing.networkAddress||'', printing.notes||'',
      numbering.residentStartingAcct||'', numbering.vendorStartingAcct||'', numbering.notes||'',
      streetNames.streetNames||'', streetNames.defaultCity||'', streetNames.defaultState||'', streetNames.defaultZip||'', streetNames.notes||'',
      webPlus.webPlusActive||'N', webPlus.webPageIpName||'', webPlus.webPageManager||'', webPlus.webManagerContact||'', webPlus.notes||'',
      cfoManage.cfoActive||'N', cfoManage.cfoCompanyName||'', cfoManage.cfoAddress||'', cfoManage.cfoTel||'', cfoManage.cfoRepName||'', cfoManage.cfoRepTel||'', cfoManage.cfoRepEmail||'', cfoManage.cfoVendorId||'', cfoManage.notes||'',
      easyPay.easyPayActive||'N', easyPay.finesPaidFirst||'N', easyPay.residentPaysCharges||'N', easyPay.achActive||'N', easyPay.notes||'',
      estoppel.residentEstoppelFee||300.00, estoppel.letterCode||'99', estoppel.paidDirectlyToMgtCo||'NO', estoppel.payableToHoaSentToMgt||'NO', estoppel.transferWorkingCapitalFee||63.00, estoppel.notes||''
    ]);

    res.json({ success: true, message: 'System settings saved successfully' });
  } catch (err) {
    console.error('Error saving system settings:', err);
    res.status(500).json({ error: 'Failed to save system settings', details: err.message });
  }
});

/* ===========================================================
   8. SETTINGS: DUES PROGRAMMING
   =========================================================== */

app.get('/api/settings/dues', async (req, res) => {
  try {
    const [progRows] = await db.query(`SELECT * FROM DuesProgramming`);
    const [rateRows] = await db.query(`SELECT * FROM DuesRates`);

    const annualProg = progRows.find(p => p.SectionType === 'annualDues') || {};
    const specialProg = progRows.find(p => p.SectionType === 'specialAssessment') || {};

    const buildRatesObj = (section) => {
      const filtered = rateRows.filter(r => r.SectionType === section);
      const result = {};
      for (const r of filtered) {
        result[r.RateType] = { current: r.CurrentRate, next: r.NextRate };
      }
      return result;
    };

    res.json({
      success: true,
      annualDues: {
        paymentFrequency: annualProg.PaymentFrequency || 'Annually',
        dueDate: annualProg.DueDate || '',
        rates: buildRatesObj('annualDues')
      },
      specialAssessment: {
        paymentFrequency: specialProg.PaymentFrequency || 'Annually',
        dueDate: specialProg.DueDate || '',
        rates: buildRatesObj('specialAssessment')
      }
    });
  } catch (err) {
    console.error('Error fetching dues settings:', err);
    res.status(500).json({ error: 'Failed to fetch dues settings', details: err.message });
  }
});

app.put('/api/settings/dues', async (req, res) => {
  try {
    const { annualDues={}, specialAssessment={} } = req.body;

    if (annualDues.paymentFrequency || annualDues.dueDate) {
      await db.query(`UPDATE DuesProgramming SET PaymentFrequency=?, DueDate=?, TimeStampUpdated=NOW() WHERE SectionType='annualDues'`,
        [annualDues.paymentFrequency||'Annually', annualDues.dueDate||'']);
    }
    if (specialAssessment.paymentFrequency || specialAssessment.dueDate) {
      await db.query(`UPDATE DuesProgramming SET PaymentFrequency=?, DueDate=?, TimeStampUpdated=NOW() WHERE SectionType='specialAssessment'`,
        [specialAssessment.paymentFrequency||'Annually', specialAssessment.dueDate||'']);
    }

    if (annualDues.rates) {
      for (const [rateType, vals] of Object.entries(annualDues.rates)) {
        await db.query(`UPDATE DuesRates SET CurrentRate=?, NextRate=? WHERE SectionType='annualDues' AND RateType=?`,
          [vals.current||0, vals.next||0, rateType]);
      }
    }
    if (specialAssessment.rates) {
      for (const [rateType, vals] of Object.entries(specialAssessment.rates)) {
        await db.query(`UPDATE DuesRates SET CurrentRate=?, NextRate=? WHERE SectionType='specialAssessment' AND RateType=?`,
          [vals.current||0, vals.next||0, rateType]);
      }
    }

    res.json({ success: true, message: 'Dues programming saved successfully' });
  } catch (err) {
    console.error('Error saving dues settings:', err);
    res.status(500).json({ error: 'Failed to save dues settings', details: err.message });
  }
});

/* ===========================================================
   9. SETTINGS: FINES & LATE FEES
   =========================================================== */

app.get('/api/settings/fines', async (req, res) => {
  try {
    const [cfgRows] = await db.query(`SELECT * FROM FinesConfig LIMIT 1`);
    const [typeRows] = await db.query(`SELECT * FROM FineTypesList ORDER BY SortOrder ASC`);
    const [ruleRows] = await db.query(`SELECT * FROM LetterRules`);
    const [timeRows] = await db.query(`SELECT * FROM TimingSchedule LIMIT 1`);

    const cfg = cfgRows[0] || {};
    const timing = timeRows[0] || {};

    const mapRule = (type) => {
      const r = ruleRows.find(item => item.RuleType === type) || {};
      return {
        letter1Amount: r.Letter1Amount || 0,
        letter1PercentYN: r.Letter1PercentYN || 'N',
        letter1Percent: r.Letter1Percent || 0,
        letter1GL: r.Letter1GL || '',
        letter2Amount: r.Letter2Amount || 0,
        letter2PercentYN: r.Letter2PercentYN || 'N',
        letter2Percent: r.Letter2Percent || 0,
        letter2GL: r.Letter2GL || '',
        finalAmount: r.FinalAmount || 0,
        finalGL: r.FinalGL || ''
      };
    };

    const timedRows = typeRows.filter(r => r.FineCategory === 'timed').map(r => [
      r.LetterCode, r.ViolationType, r.GLCode, String(r.FineAmount), r.ActiveFlag
    ]);
    const immediateRows = typeRows.filter(r => r.FineCategory === 'immediate').map(r => [
      r.LetterCode, r.ViolationType, r.GLCode, String(r.FineAmount), r.ActiveFlag
    ]);

    res.json({
      success: true,
      restartDays: cfg.RestartDays || 0,
      fineAmount: cfg.FineAmount || 0,
      timedRows,
      immediateRows,
      arrearsRules: mapRule('arrearsRules'),
      annualDuesRules: mapRule('annualDuesLateFees'),
      specialAssmtRules: mapRule('specialAssessmentLateFees'),
      timingSchedule: {
        warning1Days: timing.Warning1Days || 30,
        warning2Days: timing.Warning2Days || 60,
        collection1Days: timing.Collection1Days || 90,
        collection2Days: timing.Collection2Days || 120,
        finalDays: timing.FinalDays || 150
      }
    });
  } catch (err) {
    console.error('Error fetching fines settings:', err);
    res.status(500).json({ error: 'Failed to fetch fines settings', details: err.message });
  }
});

app.put('/api/settings/fines', async (req, res) => {
  try {
    const data = req.body;

    if (data.restartDays !== undefined || data.fineAmount !== undefined) {
      await db.query(`UPDATE FinesConfig SET RestartDays=?, FineAmount=?, TimeStampUpdated=NOW() WHERE FinesConfigID=1`,
        [data.restartDays||0, data.fineAmount||0]);
    }

    if (data.timingSchedule) {
      const t = data.timingSchedule;
      await db.query(`UPDATE TimingSchedule SET Warning1Days=?, Warning2Days=?, Collection1Days=?, Collection2Days=?, FinalDays=?, TimeStampUpdated=NOW() WHERE TimingScheduleID=1`,
        [t.warning1Days||30, t.warning2Days||60, t.collection1Days||90, t.collection2Days||120, t.finalDays||150]);
    }

    const saveRules = async (ruleType, rulesObj) => {
      if (!rulesObj) return;
      await db.query(`
        UPDATE LetterRules SET
          Letter1Amount=?, Letter1PercentYN=?, Letter1Percent=?, Letter1GL=?,
          Letter2Amount=?, Letter2PercentYN=?, Letter2Percent=?, Letter2GL=?,
          FinalAmount=?, FinalGL=?, TimeStampUpdated=NOW()
        WHERE RuleType=?
      `, [
        rulesObj.letter1Amount||0, rulesObj.letter1PercentYN||'N', rulesObj.letter1Percent||0, rulesObj.letter1GL||'',
        rulesObj.letter2Amount||0, rulesObj.letter2PercentYN||'N', rulesObj.letter2Percent||0, rulesObj.letter2GL||'',
        rulesObj.finalAmount||0, rulesObj.finalGL||'', ruleType
      ]);
    };

    await saveRules('arrearsRules', data.arrearsRules);
    await saveRules('annualDuesLateFees', data.annualDuesRules);
    await saveRules('specialAssessmentLateFees', data.specialAssmtRules);

    res.json({ success: true, message: 'Fines and late fees settings saved successfully' });
  } catch (err) {
    console.error('Error saving fines settings:', err);
    res.status(500).json({ error: 'Failed to save fines settings', details: err.message });
  }
});

/* ===========================================================
   10. SETTINGS: GL MAPPING
   =========================================================== */

app.get('/api/settings/gl-mapping', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM GLAccounts WHERE ActiveFlag='Y' ORDER BY SortOrder ASC`);
    const mapped = rows.map(r => ({
      id: r.GLAccountID,
      glNumber: r.GLNumber,
      glName: r.GLName,
      sourceTable: r.SourceTable,
      description: r.Description,
      bankType: r.BankType,
      bankId: r.BankID,
      pc: r.PC,
      parentGl: r.ParentGL,
      consolidatedParentGl: r.ConsolidatedParentGL,
      dc: r.DC,
      ar: r.AR,
      effectiveDate: r.EffectiveDate,
      createdBy: r.CreatedBy,
      createdDate: r.CreatedDate,
      lastEditedBy: r.LastEditedBy,
      systemLocked: Boolean(r.SystemLocked)
    }));
    res.json({ success: true, glAccounts: mapped });
  } catch (err) {
    console.error('Error fetching GL mapping:', err);
    res.status(500).json({ error: 'Failed to fetch GL mapping', details: err.message });
  }
});

app.put('/api/settings/gl-mapping', async (req, res) => {
  try {
    const { glAccounts } = req.body;
    if (Array.isArray(glAccounts)) {
      for (const [idx, r] of glAccounts.entries()) {
        if (r.id) {
          await db.query(`
            UPDATE GLAccounts SET
              GLNumber=?, GLName=?, SourceTable=?, Description=?, BankType=?, BankID=?,
              PC=?, ParentGL=?, ConsolidatedParentGL=?, DC=?, AR=?, EffectiveDate=?,
              LastEditedBy=?, SystemLocked=?, SortOrder=?, TimeStampUpdated=NOW()
            WHERE GLAccountID=?
          `, [
            r.glNumber||'', r.glName||'', r.sourceTable||'', r.description||'', r.bankType||'', r.bankId||'',
            r.pc||'P', r.parentGl||'', r.consolidatedParentGl||'', r.dc||'D', r.ar||'A', r.effectiveDate||'',
            r.lastEditedBy||'SYSTEM', r.systemLocked ? 1 : 0, idx, r.id
          ]);
        }
      }
    }
    res.json({ success: true, message: 'GL Accounts updated successfully' });
  } catch (err) {
    console.error('Error updating GL mapping:', err);
    res.status(500).json({ error: 'Failed to update GL mapping', details: err.message });
  }
});

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 W M+ Express Backend API running on port ${PORT}`);
});

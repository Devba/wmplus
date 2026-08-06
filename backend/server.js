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
        ProfileID as id,
        HOAName as hoaName,
        HOALicenseNumber as hoaLicense,
        AddressLine1 as address1,
        AddressLine2 as address2,
        City as city,
        StateCode as state,
        ZipCode as zip,
        ContactName as contactName,
        ContactPhone as contactPhone,
        ContactEmail as contactEmail
      FROM HOAProfile
      LIMIT 1
    `);
    res.json(rows[0] || {});
  } catch (err) {
    console.error('Error fetching HOA profile:', err);
    res.status(500).json({ error: 'Failed to fetch HOA profile', details: err.message });
  }
});

app.put('/api/settings/hoa-profile', async (req, res) => {
  try {
    const p = req.body;
    await db.query(`
      UPDATE HOAProfile SET
        HOAName = ?,
        AddressLine1 = ?,
        AddressLine2 = ?,
        City = ?,
        StateCode = ?,
        ZipCode = ?,
        ContactName = ?,
        ContactPhone = ?,
        ContactEmail = ?,
        TimeStampUpdated = NOW()
      WHERE ProfileID = 1 OR MgtCoClientID = 'MGTCO-001'
    `, [
      p.hoaName || '',
      p.address1 || '',
      p.address2 || '',
      p.city || '',
      p.state || '',
      p.zip || '',
      p.contactName || '',
      p.contactPhone || '',
      p.contactEmail || ''
    ]);
    res.json({ success: true, message: 'HOA Profile updated successfully' });
  } catch (err) {
    console.error('Error updating HOA profile:', err);
    res.status(500).json({ error: 'Failed to update HOA profile', details: err.message });
  }
});

/* ===========================================================
   6. SETTINGS: BANKING
   =========================================================== */

app.get('/api/settings/banking', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        BankAccountID as id,
        BankType as type,
        BankIDLabel as label,
        BankName as name,
        BankAccountNumber as accountNumber,
        RoutingNumber as routingNumber,
        StartingCheckNumber as startingCheckNumber,
        MinimumBankBalance as minimumBalance
      FROM BankAccountMaster
      WHERE ActiveFlag = 'Y'
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching bank accounts:', err);
    res.status(500).json({ error: 'Failed to fetch bank accounts', details: err.message });
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

    const systemMessage = `You are an AI data assistant. Convert the user's natural language request into filter conditions for a list of resident objects.
The available fields on each resident object are:
- acctNo (string/number, Account Number)
- lastName (string, Last Name)
- firstName (string, First Name)
- residence (string, Residence / Street Address)
- city (string, City name, e.g. Miami)
- state (string, State code, e.g. FL)
- zip (string, Zip Code)
- annualDuesRate (number, Annual Dues Rate amount/code)
- dues (number, Annual Dues Amount)
- email (string, Email Address)
- phone (string, Telephone Number)
- status (string, Active/Inactive)

Return strictly a JSON object with a "conditions" array. Each condition object must have:
- "field": exact field name from above (e.g. "city", "annualDuesRate", "lastName", "acctNo", "residence")
- "operator": one of [">", "<", ">=", "<=", "=", "!=", "contains"]
- "value": string or number value to compare against

Example output format for "filtra por ciudad igual a miami":
{"conditions":[{"field":"city","operator":"=","value":"Miami"}]}

Example output format for "filtra los registros en los que 'annual dues rate' sea mayor que cero":
{"conditions":[{"field":"annualDuesRate","operator":">","value":0}]}

DO NOT include markdown block markers like \`\`\`json. Output ONLY raw valid JSON.`;

    if (!apiKey) {
      console.warn('[AI Filter] OPENROUTER_API_KEY not set. Using local fallback parser.');
      // Local fallback parser for basic queries
      let conditions = [];
      const lower = prompt.toLowerCase();
      if (lower.includes('annual dues rate') || lower.includes('annualduesrate') || lower.includes('dues')) {
        if (lower.includes('mayor que') || lower.includes('>') || lower.includes('greater than')) {
          const match = lower.match(/\d+(\.\d+)?/);
          const val = match ? parseFloat(match[0]) : 0;
          conditions.push({ field: 'annualDuesRate', operator: '>', value: val });
        }
      } else if (lower.includes('ciudad') || lower.includes('city')) {
        if (lower.includes('miami')) {
          conditions.push({ field: 'city', operator: 'contains', value: 'Miami' });
        } else {
          const words = prompt.split(/\s+/);
          const lastWord = words[words.length - 1];
          conditions.push({ field: 'city', operator: 'contains', value: lastWord });
        }
      } else if (lower.includes('estado') || lower.includes('status')) {
        if (lower.includes('active') || lower.includes('activo')) {
          conditions.push({ field: 'status', operator: 'contains', value: 'Active' });
        }
      }
      return res.json({ success: true, conditions, warning: 'OPENROUTER_API_KEY is not configured in .env. Used local heuristic fallback.' });
    }

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

    return res.json({
      success: true,
      conditions: parsed.conditions || [],
      raw: rawContent
    });
  } catch (err) {
    console.error('Error in /api/ai-filter:', err);
    return res.status(500).json({ error: 'AI Filter processing failed', details: err.message });
  }
});

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 W M+ Express Backend API running on port ${PORT}`);
});

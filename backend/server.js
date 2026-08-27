const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3011;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
    const limit = 1000;

    const offset = Math.max(
      Number.parseInt(req.query.offset, 10) || 0,
      0
    );

    const search = String(req.query.search || '').trim();

    const sort =
      String(req.query.sort || 'name').toLowerCase() === 'address'
        ? 'address'
        : 'name';

    let whereClause = `
      (DeletedFlag IS NULL OR DeletedFlag != 'Y')
    `;

    const params = [];

    if (search) {
      const searchValue = `%${search}%`;

      if (sort === 'address') {
        whereClause += `
          AND ResidenceAddress LIKE ?
        `;

        params.push(searchValue);
      } else {
        whereClause += `
          AND (
            LastName LIKE ?
            OR FirstName LIKE ?
            OR DisplayName LIKE ?
            OR ResidentAccountID LIKE ?
            OR ResidenceAddress LIKE ?
          )
        `;

        params.push(
          searchValue,
          searchValue,
          searchValue,
          searchValue,
          searchValue
        );
      }
    }

    const orderBy =
      sort === 'address'
        ? `
          ORDER BY
            CASE
              WHEN TRIM(ResidenceAddress) REGEXP '^[0-9]+'
              THEN CAST(
                SUBSTRING_INDEX(
                  TRIM(ResidenceAddress),
                  ' ',
                  1
                ) AS UNSIGNED
              )
              ELSE 999999999
            END ASC,
            ResidenceAddress ASC,
            ResidentAccountID ASC
        `
        : `
          ORDER BY
            LastName ASC,
            FirstName ASC,
            ResidentAccountID ASC
        `;

    params.push(limit, offset);

    const [rows] = await db.query(
      `
        SELECT
          ResidentAccountID as account_id,
          FirstName as first_name,
          LastName as last_name,
          ResidenceAddress as residence_address
     FROM ResidentMaster
        WHERE ${whereClause}
        ${orderBy}
        LIMIT ? OFFSET ?
      `,
      params
    );

    res.json({
      residents: rows,
      offset,
      limit,
      hasMore: rows.length === limit,
      search,
      sort
    });

  } catch (err) {
    console.error('Error fetching residents:', err);

    res.status(500).json({
      error: 'Failed to fetch residents',
      details: err.message
    });
  }
});


app.get('/api/residents/:account_id/current', async (req, res) => {
  try {
    const accountId =
      String(req.params.account_id || '').trim();

    if (!accountId) {
      return res.status(400).json({
        ok: false,
        code: 'RESIDENT_ID_REQUIRED',
        message: 'Resident Account ID is required.'
      });
    }

    const [rows] = await db.query(
      `
        SELECT *
        FROM ResidentMaster
        WHERE ResidentAccountID = ?
          AND (DeletedFlag IS NULL OR DeletedFlag != 'Y')
        LIMIT 1
      `,
      [accountId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        code: 'RESIDENT_NOT_FOUND',
        message:
          'This resident record is no longer current. Please select the current resident.'
      });
    }

    return res.json({
      ok: true,
      resident: rows[0]
    });

  } catch (err) {
    console.error(
      'Error fetching current resident:',
      err
    );

    return res.status(500).json({
      ok: false,
      code: 'RESIDENT_LOOKUP_ERROR',
      message:
        'Unable to retrieve the current resident record.'
    });
  }
});

app.get('/api/main-directory/residents', async (req, res) => {
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
      ORDER BY
        LastName ASC,
        FirstName ASC,
        ResidentAccountID ASC
    `);

    res.json({
      residents: rows
    });
  } catch (err) {
    console.error(
      'Error fetching Main Directory residents:',
      err
    );

    res.status(500).json({
      error: 'Failed to fetch Main Directory residents',
      details: err.message
    });
  }
});



app.get('/api/residents/check-address', async (req, res) => {
  try {
    const residenceAddress =
      String(req.query.address || '')
        .trim()
        .replace(/\s+/g, ' ');

    const excludeAccount =
      String(req.query.excludeAccount || '').trim();

    if (!residenceAddress) {
      return res.json({ duplicate: false });
    }

    let sql = `
      SELECT ResidentAccountID
      FROM ResidentMaster
      WHERE LOWER(TRIM(ResidenceAddress)) = LOWER(?)
        AND (DeletedFlag IS NULL OR DeletedFlag <> 'Y')
    `;

    const params = [residenceAddress];

    if (excludeAccount) {
      sql += ` AND ResidentAccountID <> ?`;
      params.push(excludeAccount);
    }

    sql += ` LIMIT 1`;

    const [rows] = await db.query(sql, params);

    res.json({
      duplicate: rows.length > 0
    });
  } catch (err) {
    console.error('Error checking residence address:', err);

    res.status(500).json({
      error: 'Unable to check residence address.'
    });
  }
});



app.post('/api/residents', async (req, res) => {
  try {
    const r = req.body;
    const residenceAddress =
  String(r.residence_address || '')
    .trim()
    .replace(/\s+/g, ' ');

const [duplicateAddressRows] = await db.query(
  `
    SELECT ResidentAccountID
    FROM ResidentMaster
    WHERE LOWER(TRIM(ResidenceAddress)) = LOWER(?)
      AND (DeletedFlag IS NULL OR DeletedFlag <> 'Y')
    LIMIT 1
  `,
  [residenceAddress]
);

if (duplicateAddressRows.length > 0) {
  return res.status(409).json({
    error: 'That residence address is already assigned to another resident.'
  });
}
    const normalizeDateForDatabase = (value) => {
  if (!value) return null;

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parts = text.split('/');

  if (parts.length === 3) {
    const month = String(parts[0]).padStart(2, '0');
    const day = String(parts[1]).padStart(2, '0');
    const year = String(parts[2]);

    return `${year}-${month}-${day}`;
  }

  return null;
};







const [existingResidentRows] = await db.query(`
  SELECT MAX(
    CASE
      WHEN ResidentAccountID REGEXP '^[0-9]{1,6}$'
        THEN CAST(ResidentAccountID AS UNSIGNED)

      WHEN ResidentAccountID REGEXP '^RES-[0-9]{1,6}$'
        THEN CAST(
          SUBSTRING(ResidentAccountID, 5)
          AS UNSIGNED
        )

      ELSE 0
    END
  ) AS maxResidentNumber
  FROM ResidentMaster
`);
const maxResidentNumber =
  Number(existingResidentRows[0]?.maxResidentNumber) || 0;

const nextResidentNumber = maxResidentNumber + 1;

if (nextResidentNumber > 999999) {
  return res.status(409).json({
    error: 'No available Resident Account numbers remain.'
  });
}

    const residentAccountId =
      String(nextResidentNumber).padStart(6, '0');
    const result = await db.withTransaction(async (conn) => {
      const [insRes] = await conn.query(`
        INSERT INTO ResidentMaster (
          ResidentAccountID, FirstName, MiddleName, LastName, DisplayName, ResidenceAddress, BillingAddress,
          City, StateCode, ZipCode, PrimaryPhone, PrimaryCell, SecondaryCell, EmailAddress, MoveInDate,
          ResidentType, ActiveResidentFlag, ACHFlag, AdditionalOwnerFirstName, AdditionalOwnerMiddleName,
          AdditionalOwnerLastName, AdditionalOwnerEmail, AnnualDuesRate, AnnualDues, SpecialAssessmentRate,
          SpecialAssessmentDues, NextYearAnnualDues, NextYearSpecialAssmtDues, ResidentNotes,
          MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW())
      `, [
        residentAccountId,
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
        normalizeDateForDatabase(r.move_in_date),
        r.resident_type || null,
        r.active_flag || 'Y',
        r.ach_flag || null,
        r.addl_first_name || null,
        r.addl_middle_name || null,
        r.addl_last_name || null,
        r.addl_email || null,
        r.annual_dues_rate || null,
        parseDecimal(r.annual_dues),
        r.special_assessment_rate || null,
        parseDecimal(r.special_assessment_dues),
        parseDecimal(r.next_year_annual_dues),
        parseDecimal(r.next_year_special_assmt_dues),
        r.resident_notes || null
      ]);
      await initializeAssessmentRegister(conn, {
        residentAccountId,
        lastName: r.last_name,
        address: r.residence_address,
        annualRateCode: r.annual_dues_rate,
        specialRateCode: r.special_assessment_rate,
        operatorId: 'SYSTEM'
      });
      return insRes;
    });
    res.status(201).json({
      success: true,
      insertedId: result.insertId,
      account_id: residentAccountId
    });
  } catch (err) {
    console.error('Error inserting resident:', err);
    res.status(500).json({ error: 'Failed to insert resident', details: err.message });
  }
});

app.put('/api/residents/:account_id', async (req, res) => {
  try {
    const { account_id } = req.params;
    const r = req.body;
    const residenceAddress =
  String(r.residence_address || '')
    .trim()
    .replace(/\s+/g, ' ');

const [duplicateAddressRows] = await db.query(
  `
    SELECT ResidentAccountID
    FROM ResidentMaster
    WHERE LOWER(TRIM(ResidenceAddress)) = LOWER(?)
      AND ResidentAccountID <> ?
      AND (DeletedFlag IS NULL OR DeletedFlag <> 'Y')
    LIMIT 1
  `,
  [residenceAddress, account_id]
);

if (duplicateAddressRows.length > 0) {
  return res.status(409).json({
    error: 'That residence address is already assigned to another resident.'
  });
}
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
      r.annual_dues_rate || null,
      parseDecimal(r.annual_dues),
      r.special_assessment_rate || null,
      parseDecimal(r.special_assessment_dues),
      r.next_year_annual_dues_rate || null,
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
      ORDER BY
        CASE
          WHEN VendorID REGEXP '^[0-9]{1,4}$' THEN 0
          ELSE 1
        END ASC,
        CAST(VendorID AS UNSIGNED) ASC,
        VendorName ASC
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
    const [[settingsRow]] = await db.query(`
  SELECT VendorStartingAcct
  FROM SystemSettings
  WHERE SystemSettingsID = 1
  LIMIT 1
`);

const startingVendorNumber = Math.max(
  1,
  parseInt(settingsRow?.VendorStartingAcct, 10) || 1
);

const [existingVendorRows] = await db.query(`
  SELECT VendorID
  FROM VendorMaster
  WHERE VendorID REGEXP '^[0-9]{1,4}$'
`);

const usedVendorNumbers = new Set(
  existingVendorRows.map((row) =>
    parseInt(row.VendorID, 10)
  )
);

let nextVendorNumber = startingVendorNumber;

while (
  nextVendorNumber <= 9999 &&
  usedVendorNumbers.has(nextVendorNumber)
) {
  nextVendorNumber += 1;
}

if (nextVendorNumber > 9999) {
  return res.status(409).json({
    error: 'No available Vendor ID numbers remain.'
  });
}

const vendorId =
  String(nextVendorNumber).padStart(4, '0');
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
   3. CHECK REGISTER (CheckRegister) & ACID TRANSACTION POSTING
   =========================================================== */

app.get('/api/check-register', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        cr.CheckTransactionNumber AS check_txn_num,
        cr.CheckNumber AS check_number,

        COALESCE(
          v.VendorName,
          r.DisplayName,
          mc.ManagementCompanyName,
          cr.VendorResidentID
        ) AS payee_name,

        cr.GLAccountName AS gl_name,
        cr.Amount AS amount,
        cr.DateCheckIssued AS date_issued,
        cr.DateCheckCleared AS date_cleared,
        cr.MonthCleared AS month_cleared,
        cr.GLNumber AS gl_number,
        cr.VendorResidentID AS payee_id,
        cr.VendorInvoiceNumber AS invoice_num,
        cr.VendorInvoiceDate AS invoice_date,
        cr.VendorInvoiceAmount AS invoice_amount,
        cr.CheckNotation AS note,
        cr.BankAccount AS bank_account,
        cr.BankAccountID AS bank_account_id,
        cr.CheckAllowedYN AS check_allowed,
        cr.EscrowFlag AS escrow_flag,
        CONCAT(
          ba.BankName,
          ' - ',
          ba.BankType,
          ' - ',
          ba.BankID
        ) AS bank_account_display,

        cr.Status AS status

      FROM CheckRegister cr

      LEFT JOIN VendorMaster v
        ON v.VendorID = cr.VendorResidentID

      LEFT JOIN ResidentMaster r
        ON r.ResidentAccountID = cr.VendorResidentID

      LEFT JOIN ManagementCompanyClient mc
        ON mc.MgtCoClientID = cr.VendorResidentID

      LEFT JOIN BankAccount ba
        ON ba.BankAccountID = cr.BankAccountID

      WHERE cr.DeletedFlag IS NULL
         OR cr.DeletedFlag != 'Y'


  ORDER BY
  cr.CheckTransactionNumber ASC
    `);

    res.json(rows);

  } catch (err) {
    console.error('Error fetching checks:', err);

    res.status(500).json({
      error: 'Failed to fetch check register',
      details: err.message
    });
  }
});

app.get('/api/check-register/next-check-number', async (req, res) => {
  try {
    const bankAccountId = Number(req.query.bankAccountId);

    if (!bankAccountId) {
      return res.status(400).json({
        error: 'bankAccountId is required'
      });
    }

    const [bankRows] = await db.query(
      `
        SELECT
          BankAccountID,
          CheckMode,
          StartCheckNumber
        FROM BankAccount
        WHERE BankAccountID = ?
        LIMIT 1
      `,
      [bankAccountId]
    );

    if (bankRows.length === 0) {
      return res.status(404).json({
        error: 'Bank account not found'
      });
    }

    const bank = bankRows[0];

    if (String(bank.CheckMode || '').toLowerCase() !== 'system') {
      return res.json({
        checkMode: bank.CheckMode || 'None',
        nextCheckNumber: ''
      });
    }

    const [checkRows] = await db.query(
      `
        SELECT MAX(CAST(CheckNumber AS UNSIGNED)) AS maxCheckNumber
        FROM CheckRegister
        WHERE BankAccountID = ?
          AND CheckNumber REGEXP '^[0-9]+$'
      `,
      [bankAccountId]
    );

    const startCheckNumber =
      Number(bank.StartCheckNumber) || 1;

    const maxCheckNumber =
      Number(checkRows[0]?.maxCheckNumber) || 0;

    const nextCheckNumber =
      maxCheckNumber >= startCheckNumber
        ? maxCheckNumber + 1
        : startCheckNumber;

    res.json({
      checkMode: bank.CheckMode,
      nextCheckNumber: String(nextCheckNumber)
    });
  } catch (err) {
    console.error(
      'Error determining next check number:',
      err
    );

    res.status(500).json({
      error: 'Failed to determine next check number',
      details: err.message
    });
  }
});

app.get('/api/check-register/next-check-number', async (req, res) => {
  try {
    const bankAccountId = req.query.bankAccountId || 1;
    const [bankRows] = await db.query('SELECT StartCheckNumber FROM BankAccount WHERE BankAccountID = ?', [bankAccountId]);
    const [checkRows] = await db.query('SELECT MAX(CAST(CheckNumber AS UNSIGNED)) as maxCheck FROM CheckRegister WHERE BankAccountID = ?', [bankAccountId]);

    const startCheck = bankRows[0]?.StartCheckNumber ? parseInt(bankRows[0].StartCheckNumber, 10) : 1001;
    const maxCheck = checkRows[0]?.maxCheck ? parseInt(checkRows[0].maxCheck, 10) : 0;

    const nextCheck = Math.max(startCheck, maxCheck + 1);
    res.json({ success: true, nextCheckNumber: String(nextCheck) });
  } catch (err) {
    console.error('Error getting next check number:', err);
    res.status(500).json({ error: 'Failed to get next check number', details: err.message });
  }
});

app.post('/api/check-register', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const c = req.body;
    const txnNum = c.check_txn_num || `CHK-${Date.now()}`;
    const bankAccountId = c.bank_account_id || 1;
    const amount = parseFloat(c.amount) || 0.00;

    await connection.query(`
      INSERT INTO CheckRegister (
        CheckTransactionNumber, CheckNumber, GLAccountName, Amount, DateCheckIssued,
        DateCheckCleared, MonthCleared, GLNumber, VendorResidentID, VendorInvoiceNumber,
        VendorInvoiceDate, VendorInvoiceAmount, CheckNotation, BankAccount, BankAccountID, CheckAllowedYN, EscrowFlag, Status,
        DeletedFlag, MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, 'Issued', 'N', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW())
    `, [
      txnNum,
      c.check_number || '',
      c.gl_name || '',
      amount,
      c.date_issued || null,
      c.date_cleared || null,
      c.month_cleared || null,
      c.gl_number || 5000,
      c.payee_id || '',
      c.invoice_num || '',
      c.invoice_date || null,
      c.invoice_amount || amount,
      c.note || '',
      c.bank_account || 'Operating 101',
      bankAccountId,
      c.check_allowed || 'Y',
      c.escrow_flag || 'N'
    ]);

    // Real-time Bank Cash Flow update (decrease balance)
    await connection.query(`
      UPDATE BankAccount 
      SET StartingBalance = StartingBalance - ?, TimeStampUpdated = NOW()
      WHERE BankAccountID = ?
    `, [amount, bankAccountId]);

    await connection.commit();
    res.status(201).json({
      success: true,
      check_txn_num: txnNum,
      message: 'Check posted and Bank Cash Flow updated successfully'
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error posting check transaction:', err);
    res.status(500).json({ error: 'Failed to post check transaction', details: err.message });
  } finally {
    connection.release();
  }
});


app.post('/api/modify-gl/submit', async (req, res) => {
  try {
    const {
      page,
      transactionNo,
      newGLNo,
      newGLClassification
    } = req.body;

    if (page === 'DP') {
  if (!transactionNo || !newGLNo || !newGLClassification) {
    return res.status(400).json({
      error:
        'Transaction #, new GL#, and new GL classification are required.'
    });
  }

  const {
    newExpenseRefundGLNo
  } = req.body;

  const expenseRefundNumber =
    newGLClassification === 'Expense Credit Refund'
      ? newExpenseRefundGLNo || null
      : null;

  const expenseRefundCategory =
    newGLClassification === 'Expense Credit Refund'
      ? 'Expense Credit Refund'
      : null;

  const [result] = await db.query(`
    UPDATE DepositRegister
    SET
      GLNumber = ?,
      GLAccountName = ?,
      ExpenseRefundGLNumber = ?,
      ExpenseRefundGLCategory = ?,
      TimeStampUpdated = NOW()
    WHERE DepositTransactionNumber = ?
      AND (DeletedFlag IS NULL OR DeletedFlag != 'Y')
  `, [
    newGLNo,
    newGLClassification,
    expenseRefundNumber,
    expenseRefundCategory,
    transactionNo
  ]);

  if (result.affectedRows === 0) {
    return res.status(404).json({
      error: 'Deposit Register transaction was not found.'
    });
  }

  return res.json({
    success: true,
    transactionNo,
    glNumber: newGLNo,
    glClassification: newGLClassification,
    expenseRefundGLNumber: expenseRefundNumber
  });
}

if (page !== 'CR') {
  return res.status(400).json({
    error: 'Invalid page for Modify GL.'
  });
}

    if (!transactionNo || !newGLNo || !newGLClassification) {
      return res.status(400).json({
        error: 'Transaction #, new GL#, and new GL classification are required.'
      });
    }

    const [result] = await db.query(`
      UPDATE CheckRegister
      SET
        GLNumber = ?,
        GLAccountName = ?
      WHERE CheckTransactionNumber = ?
        AND (DeletedFlag IS NULL OR DeletedFlag != 'Y')
    `, [
      newGLNo,
      newGLClassification,
      transactionNo
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Check Register transaction was not found.'
      });
    }

    res.json({
      success: true,
      transactionNo,
      glNumber: newGLNo,
      glClassification: newGLClassification
    });

  } catch (err) {
    console.error('Error modifying Check Register GL:', err);

    res.status(500).json({
      error: 'Failed to modify Check Register GL',
      details: err.message
    });
  }
});




/* ===========================================================
   4. DEPOSIT REGISTER (DepositRegister) & ACID TRANSACTION POSTING
   =========================================================== */

app.get('/api/deposit-register', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        dr.DepositTransactionNumber AS deposit_txn_num,
        dr.DepositorAccountName AS depositor_account_name,
        dr.Amount AS amount,

        COALESCE(
          r.DisplayName,
          v.VendorName,
          dr.DepositorAccountName,
          dr.ResidentAccountID,
          dr.VendorID
        ) AS payer_name,

        dr.BankAccountName AS bank_account,
        dr.BankAccountID AS bank_account_id,

        CONCAT(
          ba.BankName,
          ' - ',
          ba.BankType,
          ' - ',
          ba.BankID
        ) AS bank_account_display,

        dr.GLAccountName AS gl_name,
        dr.GLNumber AS gl_number,
        dr.DateDeposited AS date_deposited,
        dr.DateCleared AS date_cleared,
        dr.MonthCleared AS month_cleared,
        dr.ResidentAccountID AS resident_id,
        dr.VendorID AS vendor_id,
        dr.ExpenseRefundGLCategory AS expense_refund_gl_category,
        dr.ExpenseRefundGLNumber AS expense_refund_gl_number,
        dr.DepositNotation AS note,
        dr.Status AS status

      FROM DepositRegister dr

      LEFT JOIN ResidentMaster r
        ON r.ResidentAccountID = dr.ResidentAccountID

      LEFT JOIN VendorMaster v
        ON v.VendorID = dr.VendorID

      LEFT JOIN BankAccount ba
        ON ba.BankAccountID = dr.BankAccountID

      WHERE dr.DeletedFlag IS NULL
         OR dr.DeletedFlag != 'Y'

      ORDER BY
        dr.DateDeposited ASC,
        dr.DepositTransactionNumber ASC
    `);

    res.json(rows);

  } catch (err) {
    console.error('Error fetching deposits:', err);

    res.status(500).json({
      error: 'Failed to fetch deposit register',
      details: err.message
    });
  }
});

app.post('/api/deposit-register', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const d = req.body;
    const txnNum = d.deposit_txn_num || `DEP-${Date.now()}`;
    const bankAccountId = d.bank_account_id || 1;
    const amount = parseFloat(d.amount) || 0.00;

    await connection.query(`
      INSERT INTO DepositRegister (
        DepositTransactionNumber, DepositorAccountName, Amount, BankAccountName,
        BankAccountID, GLAccountName, GLNumber, DateDeposited, DateCleared,
        MonthCleared, ResidentAccountID, VendorID, ExpenseRefundGLCategory,
        ExpenseRefundGLNumber, DepositNotation, Status,
        DeletedFlag, MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?, 'Posted', 'N', 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM', NOW())
    `, [
      txnNum,
      d.payer_name || '',
      amount,
      d.bank_account_name || 'Operating 101',
      bankAccountId,
      d.gl_name || '',
      d.gl_number || 4000,
      d.date_deposited || new Date().toISOString().slice(0, 10),
      d.date_cleared || null,
      d.month_cleared || null,
      d.resident_id || '',
      d.vendor_id || '',
      d.expense_refund_gl_category || '',
      d.expense_refund_gl_number || null,
      d.note || ''
    ]);

    // Real-time Bank Cash Flow update (increase balance)
    await connection.query(`
      UPDATE BankAccount 
      SET StartingBalance = StartingBalance + ?, TimeStampUpdated = NOW()
      WHERE BankAccountID = ?
    `, [amount, bankAccountId]);

    await connection.commit();
    res.status(201).json({
      success: true,
      deposit_txn_num: txnNum,
      message: 'Deposit posted and Bank Cash Flow updated successfully'
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error posting deposit transaction:', err);
    res.status(500).json({ error: 'Failed to post deposit transaction', details: err.message });
  } finally {
    connection.release();
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

    const opencodeCliPath = process.env.OPENCODE_CLI_PATH || 'opencode';
    const opencodeModel = process.env.OPENCODE_AI_MODEL || 'opencode-go/deepseek-v4-flash';

    const systemMessage = `You are a database AI query engine for an HOA (homeowners association) management system. Translate natural language queries into safe SQL against the MySQL database.

Tables and columns:

ResidentMaster (one row per resident/account):
- ResidentAccountID (VARCHAR, PK, e.g. "RES-001")
- FirstName, MiddleName, LastName, DisplayName
- ResidenceAddress, BillingAddress, City, StateCode, ZipCode
- PrimaryPhone, PrimaryCell, SecondaryCell, EmailAddress
- MoveInDate, MoveOutDate (DATE)
- ResidentType, OwnerFlag, ActiveResidentFlag ('Y'/'N'), Status
- AnnualDuesRate, AnnualDues, AnnualDuesPaidYTD, AnnualDuesBalance (DECIMAL)
- SpecialAssessmentRate, SpecialAssessmentDues, SpecialAssessmentPaidYTD, SpecialAssessmentBalance (DECIMAL)
- FinesFeesBalance, PriorYearCredit (DECIMAL)
- DeletedFlag ('N' = not deleted)

ViolationRegister (one row per violation/fine issued to a resident):
- ResidentAccountID (FK to ResidentMaster), ResidentName, Address
- ViolationDescription, WarningOrFineFlag ('Fine' or 'Warning'), FineAmount (DECIMAL)
- InspectionDate, LetterIssueDate, InvoiceStatus, InvoiceBalance

Rules:
1. Output ONLY a raw JSON object, no markdown, no code fences, no comments.
2. Filter queries (list/filter residents in the table) use:
   {"mode":"filter","whereClause":"<SQL WHERE expression>","orderBy":"<optional ORDER BY clause>","limit":<optional integer>}
   The whereClause is appended directly to "SELECT * FROM ResidentMaster WHERE ".
3. Count/aggregate queries (how many, counts, totals) use:
   {"mode":"answer","answerSql":"<single aggregate SELECT>","answerLabel":"<short human label in Spanish>"}
   answerSql must be a SELECT that returns a single row (COUNT(*), COUNT(DISTINCT ...), SUM(...), etc.).
4. "activo/activos/inactivos" -> ActiveResidentFlag='Y'/'N'. Always add DeletedFlag='N' to ResidentMaster filters.
5. "estado de florida" -> StateCode='FL'. Use LIKE for partial text (EmailAddress LIKE '%x%', PrimaryPhone LIKE '%305%'). Starting letters -> LastName LIKE 'A%'.
6. Real debt = AnnualDuesBalance>0 OR SpecialAssessmentBalance>0. "deudores/mayores deudores" -> that plus ORDER BY (AnnualDuesBalance+SpecialAssessmentBalance) DESC, LIMIT 10 when asked for "los 10".
7. Fines/violations ("multas", "multa", "violaciones", "fines"): to list residents with fines use
   ResidentAccountID IN (SELECT ResidentAccountID FROM ViolationRegister WHERE WarningOrFineFlag='Fine' AND FineAmount>0)
   For counts ("cuantos han tenido multas") use SELECT COUNT(DISTINCT ResidentAccountID) FROM ViolationRegister WHERE WarningOrFineFlag='Fine' AND FineAmount>0.
8. "cuantos residentes hay" -> SELECT COUNT(*) FROM ResidentMaster WHERE ActiveResidentFlag='Y' AND DeletedFlag='N'.
9. Never use destructive keywords (DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE, GRANT, REVOKE, UNION, CREATE, EXEC) and no semicolons.

Examples:
Input: "residentes de florida activos" -> {"mode":"filter","whereClause":"StateCode='FL' AND ActiveResidentFlag='Y' AND DeletedFlag='N'"}
Input: "cuantos residentes tienen deudas" -> {"mode":"answer","answerSql":"SELECT COUNT(*) AS total FROM ResidentMaster WHERE ActiveResidentFlag='Y' AND DeletedFlag='N' AND (AnnualDuesBalance>0 OR SpecialAssessmentBalance>0)","answerLabel":"Residentes con deuda"}
Input: "los 10 mayores deudores" -> {"mode":"filter","whereClause":"(AnnualDuesBalance>0 OR SpecialAssessmentBalance>0) AND DeletedFlag='N'","orderBy":"(AnnualDuesBalance+SpecialAssessmentBalance) DESC","limit":10}`;

    function conditionsToSql(conditions) {
      if (!conditions || conditions.length === 0) return '1=1';
      return conditions.map(c => {
        if (c.raw) return c.raw;
        const escapedValue = String(c.value).replace(/'/g, "''");
        if (c.operator === 'contains') {
          return `${c.field} LIKE '%${escapedValue}%'`;
        }
        if (c.operator === 'like') {
          return `${c.field} LIKE '${escapedValue}'`;
        }
        const isNumeric = !isNaN(c.value) && (c.field === 'AnnualDuesRate' || c.field === 'AnnualDuesBalance' || c.field === 'SpecialAssessmentBalance');
        const quote = isNumeric ? '' : "'";
        return `${c.field} ${c.operator} ${quote}${escapedValue}${quote}`;
      }).join(' AND ');
    }

    function buildFallbackResult(promptText) {
      const lower = promptText.toLowerCase().trim();
      const cleanPrompt = promptText.replace(/["']/g, '').trim();

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

      const isCount = /\b(cu[áa]ntos?|cu[áa]ntas?|how many|total de|n[úu]mero de)\b/.test(lower);
      const isDebt = /deudor|deuda|deben|debt/.test(lower);
      const isFine = /multa|violaci|fine|infracci/.test(lower);

      // ANSWER MODE: count/aggregate questions
      if (isCount) {
        if (isFine) {
          return {
            mode: 'answer',
            answerSql: "SELECT COUNT(DISTINCT ResidentAccountID) AS total FROM ViolationRegister WHERE WarningOrFineFlag='Fine' AND FineAmount>0",
            answerLabel: 'Residentes con multas'
          };
        }
        if (isDebt) {
          return {
            mode: 'answer',
            answerSql: "SELECT COUNT(*) AS total FROM ResidentMaster WHERE ActiveResidentFlag='Y' AND DeletedFlag='N' AND (AnnualDuesBalance>0 OR SpecialAssessmentBalance>0)",
            answerLabel: 'Residentes con deuda'
          };
        }
        return {
          mode: 'answer',
          answerSql: "SELECT COUNT(*) AS total FROM ResidentMaster WHERE ActiveResidentFlag='Y' AND DeletedFlag='N'",
          answerLabel: 'Residentes'
        };
      }

      // FILTER MODE
      const conditions = [];

      // Fines / violations
      if (isFine) {
        conditions.push({ raw: "ResidentAccountID IN (SELECT ResidentAccountID FROM ViolationRegister WHERE WarningOrFineFlag='Fine' AND FineAmount>0)" });
      }

      // Debt (real debt = dues + special assessment)
      if (isDebt) {
        conditions.push({ raw: "(AnnualDuesBalance>0 OR SpecialAssessmentBalance>0) AND ActiveResidentFlag='Y' AND DeletedFlag='N'" });
      }

      // Names starting with a letter ("nombres que empiecen con a", "empiezan con la letra m")
      const startsWithMatch = lower.match(/(?:empiezan?|empiecen|empieza|empieze|comiencen?|empezando|inician?)\s+(?:con\s+)?(?:la\s+letra\s+)?["']?([a-z])/i);
      const matchedStartsWith = !!(startsWithMatch && startsWithMatch[1]);
      if (matchedStartsWith) {
        const letter = startsWithMatch[1].toUpperCase();
        conditions.push({ raw: `(LastName LIKE '${letter}%' OR FirstName LIKE '${letter}%' OR DisplayName LIKE '${letter}%')` });
      }

      // Last Name check ("last name = Chen", "apellido Chen")
      const lastNameMatch = cleanPrompt.match(/(?:last\s*name|apellido)\s*(?:=|is|igual a|:)?\s*([a-zA-Z\s]+)/i);
      if (!matchedStartsWith && lastNameMatch && lastNameMatch[1]) {
        const val = lastNameMatch[1].trim();
        if (val) {
          conditions.push({ field: 'LastName', operator: '=', value: val });
        }
      }

      // First Name check ("first name = James", "nombre James")
      const firstNameMatch = cleanPrompt.match(/(?:first\s*name|nombre)\s*(?:=|is|igual a|:)?\s*([a-zA-Z\s]+)/i);
      if (!matchedStartsWith && firstNameMatch && firstNameMatch[1] && !cleanPrompt.toLowerCase().includes('last name')) {
        const val = firstNameMatch[1].trim();
        if (val) {
          conditions.push({ field: 'FirstName', operator: '=', value: val });
        }
      }

      // Account Number check ("acctNo = RES-001", "cuenta RES-001")
      const acctMatch = cleanPrompt.match(/(?:acct|account|cuenta|res)\s*(?:no|number|#)?\s*(?:=|is|igual a|:)?\s*(RES-?\d+|\d+)/i);
      if (acctMatch && acctMatch[1]) {
        let val = acctMatch[1].trim();
        if (!val.toUpperCase().startsWith('RES-')) val = `RES-${val.padStart(3, '0')}`;
        conditions.push({ field: 'ResidentAccountID', operator: '=', value: val.toUpperCase() });
      }

      // Phone Number check ("phone = 305-555-3001", "telefono 305")
      const phoneMatch = cleanPrompt.match(/(?:phone|telefono|cell|celular)\s*(?:=|is|igual a|:)?\s*([\d\-\(\)\s]+)/i);
      if (phoneMatch && phoneMatch[1]) {
        const val = phoneMatch[1].trim();
        if (val.length >= 3) {
          conditions.push({ field: 'PrimaryPhone', operator: 'contains', value: val });
        }
      }

      // Email check ("email = mitchell", "correo mitchell@example.com")
      const emailMatch = cleanPrompt.match(/(?:email|correo)\s*(?:=|is|igual a|:)?\s*([a-zA-Z0-9\.\@\_]+)/i);
      if (emailMatch && emailMatch[1]) {
        const val = emailMatch[1].trim();
        if (val) {
          conditions.push({ field: 'EmailAddress', operator: 'contains', value: val });
        }
      }

      // State check
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

      // City check
      for (const c of KNOWN_CITIES) {
        if (lower.includes(c)) {
          const capitalized = c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          conditions.push({ field: 'City', operator: 'contains', value: capitalized });
          break;
        }
      }

      // Status check
      if (lower.includes('inactivo') || lower.includes('inactivos') || lower.includes('inactive')) {
        conditions.push({ field: 'ActiveResidentFlag', operator: '=', value: 'N' });
      } else if (lower.includes('activo') || lower.includes('activos') || lower.includes('active')) {
        conditions.push({ field: 'ActiveResidentFlag', operator: '=', value: 'Y' });
      }

      // Annual Dues rate check
      if (lower.includes('dues') || lower.includes('rate') || lower.includes('cuota') || lower.includes('annual')) {
        if (lower.includes('mayor que') || lower.includes('>') || lower.includes('greater')) {
          const match = lower.match(/\d+(\.\d+)?/);
          const val = match ? parseFloat(match[0]) : 0;
          conditions.push({ field: 'AnnualDuesRate', operator: '>', value: val });
        }
      }

      let whereClause = conditionsToSql(conditions);
      if (whereClause === '1=1') whereClause = '1=1';
      let orderBy = '';
      let limit = null;

      // Ordering for debtors
      if (isDebt) {
        orderBy = '(AnnualDuesBalance+SpecialAssessmentBalance) DESC';
        if (lower.includes('10') || lower.includes('diez')) limit = 10;
      }

      return { mode: 'filter', whereClause, orderBy, limit, answerSql: '', answerLabel: '' };
    }

    function runOpencodeTranslate(promptText) {
      return new Promise((resolve, reject) => {
        const fullPrompt = `${systemMessage}\n\nUser query: ${promptText}\n\nOutput ONLY the raw JSON described above. No markdown, no extra text.`;
        const args = ['run', '--title', 'wmplus-ai-query', '-m', opencodeModel, fullPrompt];
        const proc = spawn(opencodeCliPath, args, {
          cwd: __dirname,
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true
        });
        let stdout = '';
        let stderr = '';
        const timer = setTimeout(() => {
          proc.kill('SIGTERM');
        }, 90000);
        proc.stdout.on('data', (d) => { stdout += d; });
        proc.stderr.on('data', (d) => { stderr += d; });
        proc.on('error', (err) => { clearTimeout(timer); reject(err); });
        proc.on('close', (code, signal) => {
          clearTimeout(timer);
          if (code !== 0) {
            return reject(new Error(`opencode run exited code ${code}${signal ? ' signal ' + signal : ''}: ${stderr.slice(0, 300)}`));
          }
          resolve(stdout);
        });
      });
    }

    function extractJsonObject(text) {
      const cleaned = String(text).replace(/```json/gi, '').replace(/```/g, '').trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start === -1 || end <= start) return null;
      try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (e) { return null; }
    }

    let result = null;
    let source = 'fallback';

    try {
      const stdout = await runOpencodeTranslate(prompt);
      const parsed = extractJsonObject(stdout);
      if (parsed && (parsed.whereClause || parsed.answerSql || parsed.mode)) {
        result = {
          mode: parsed.mode === 'answer' ? 'answer' : 'filter',
          whereClause: parsed.whereClause || '1=1',
          orderBy: parsed.orderBy || '',
          limit: parsed.limit || null,
          answerSql: parsed.answerSql || '',
          answerLabel: parsed.answerLabel || 'Resultado'
        };
        source = 'opencode';
      } else {
        console.warn('[AI Filter] opencode run no devolvió un JSON válido. Usando fallback local.');
      }
    } catch (err) {
      console.warn('[AI Filter] opencode run falló, usando fallback local:', err.message);
    }

    if (!result) {
      result = buildFallbackResult(prompt);
      source = 'fallback';
    }

    // Safety check: prevent destructive keywords
    const unsafeSqlPattern = /\b(drop|delete|update|insert|alter|replace|truncate|grant|revoke|union|create|exec)\b|;/i;

    const mode = result.mode === 'answer' ? 'answer' : 'filter';

    // ANSWER MODE: run a safe aggregate SELECT and return a human-readable value
    if (mode === 'answer') {
      const trimmed = (result.answerSql || '').trim();
      if (!/^select\s/i.test(trimmed) || unsafeSqlPattern.test(trimmed)) {
        console.error('[AI Filter Security] Unsafe aggregate SQL detected:', result.answerSql);
        return res.status(400).json({ error: 'Unsafe aggregate SQL query detected by security layer' });
      }
      console.log(`[AI Filter SQL] Executing ${source} answer: ${trimmed}`);
      const [rows] = await db.readOnlyPool.query(trimmed);
      const row = rows && rows[0] ? rows[0] : {};
      const values = Object.values(row);
      const value = values[0] != null && values[0] !== '' ? values[0] : '0';
      return res.json({
        success: true,
        mode,
        answer: `${result.answerLabel}: ${value}`,
        answerLabel: result.answerLabel,
        answerValue: value,
        answerSql: trimmed,
        source
      });
    }

    const whereClause = result.whereClause || '1=1';
    if (unsafeSqlPattern.test(whereClause)) {
      console.error('[AI Filter Security] Unsafe SQL detected:', whereClause);
      return res.status(400).json({ error: 'Unsafe SQL query detected by security layer' });
    }

    const orderByClause = result.orderBy ? ` ORDER BY ${String(result.orderBy).replace(/^order\s+by\s+/i, '').trim()}` : '';
    const limitClause = result.limit ? ` LIMIT ${parseInt(result.limit, 10)}` : '';
    const fullQuery = `SELECT * FROM ResidentMaster WHERE ${whereClause}${orderByClause}${limitClause}`;

    console.log(`[AI Filter SQL] Executing query via ${source}: ${fullQuery}`);
    const [rows] = await db.readOnlyPool.query(fullQuery);

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
      mode: 'filter',
      residents: mappedResidents,
      whereClause,
      source
    });

  } catch (err) {
    console.error('Error in /api/ai-filter:', err);
    return res.status(500).json({ error: 'AI Filter processing failed', details: err.message });
  }
});

/* =============================================================
   OCR CHECK: extract check data from an image via OpenRouter vision model
   (default: google/gemini-2.5-flash-lite).
   ============================================================= */

app.post('/api/ocr/check', express.json({ limit: '10mb' }), async (req, res) => {
  const systemMessage = `You are an OCR assistant for a bank deposit entry form. Analyze the provided check image and return ONLY a JSON object with the following keys:
{
  "checkNumber": string or null,
  "amount": string or null (US dollar amount, numbers only, e.g. "1234.56"),
  "date": string or null (format MM/DD/YYYY),
  "payeeName": string or null (name on the "Pay to the order of" line),
  "bankAccount": string or null (bank name or account memo if visible),
  "glNumber": string or null (GL/account number if visible)
}
Rules:
- Return raw JSON only, no markdown, no code fences, no comments.
- If a field is not visible or not legible, set it to null.
- If several fields could match, prefer the most legible/central value.`;

  function parseOcrJson(text) {
    const cleaned = String(text).replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start === -1 || end <= start) return null;

    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch (err) {
      return null;
    }
  }

  function mapResult(parsed, rawContent) {
    return {
      success: true,
      checkNumber: parsed.checkNumber || null,
      amount: parsed.amount || null,
      date: parsed.date || null,
      payeeName: parsed.payeeName || null,
      bankAccount: parsed.bankAccount || null,
      glNumber: parsed.glNumber || null,
      raw: String(rawContent || '').slice(0, 500)
    };
  }

  function runOpencodeOcr(promptText, tmpFile) {
    return new Promise((resolve, reject) => {
      const cliPath = process.env.OPENCODE_CLI_PATH || 'opencode';
      const model = process.env.OPENCODE_OCR_MODEL || 'opencode-go/mimo-v2.5';
      const args = ['run', '--title', 'wmplus-ocr', '-m', model, promptText, '--file', tmpFile];
      const proc = spawn(cliPath, args, {
        cwd: __dirname,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });
      let stdout = '';
      let stderr = '';
      const timer = setTimeout(() => proc.kill('SIGTERM'), 90000);

      proc.stdout.on('data', (d) => { stdout += d; });
      proc.stderr.on('data', (d) => { stderr += d; });
      proc.on('error', (err) => { clearTimeout(timer); reject(err); });
      proc.on('close', (code, signal) => {
        clearTimeout(timer);
        if (code !== 0) {
          return reject(new Error(`opencode run exited code ${code}${signal ? ' signal ' + signal : ''}: ${stderr.slice(0, 300)}`));
        }
        resolve(stdout);
      });
    });
  }

  async function runOpenRouterOcr(imageData) {
    const apiKey = process.env.OPENROUTER_API_KEY || '';
    const model = process.env.OPENROUTER_OCR_MODEL || 'google/gemini-2.5-flash-lite';

    if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3011',
        'X-Title': 'WM Plus Management'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemMessage },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract the check data from this image.' },
              { type: 'image_url', image_url: { url: imageData } }
            ]
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OCR provider error ${response.status}: ${errText.slice(0, 300)}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    const parsed = parseOcrJson(rawContent) || {};
    return { parsed, rawContent };
  }

  try {
    const { image } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const base64 = String(image).includes('base64,')
      ? String(image).split(',')[1]
      : String(image);

    const ext = String(image).startsWith('data:image/png') ? 'png' : 'jpg';
    const tmpFile = path.join(os.tmpdir(), `ocr_input_${Date.now()}.${ext}`);
    fs.writeFileSync(tmpFile, Buffer.from(base64, 'base64'));

    let parsed = null;
    let rawContent = '';

    const fallback = await runOpenRouterOcr(image);
    parsed = fallback.parsed;
    rawContent = fallback.rawContent;

    fs.unlinkSync(tmpFile);
    return res.json(mapResult(parsed, rawContent));
  } catch (err) {
    console.error('Error in /api/ocr/check:', err);
    return res.status(500).json({ error: 'OCR processing failed', details: err.message });
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
   VOID TRANSACTION
   Deposit & Check Register persistence
   =========================================================== */

app.post('/api/void/execute', async (req, res) => {
  try {
    const transactionNumber =
      req.body?.payload?.transaction_no;

    const page =
      req.body?.payload?.page || '';

    if (!transactionNumber) {
      return res.status(400).json({
        ok: false,
        status: {
          message: 'Transaction # is required.'
        }
      });
    }

    if (page === 'DP') {
  const [rows] = await db.query(`
    SELECT
      DepositTransactionNumber,
      Status,
      DateCleared,
      MonthCleared
    FROM DepositRegister
    WHERE DepositTransactionNumber = ?
    LIMIT 1
  `, [transactionNumber]);

  if (rows.length === 0) {
    return res.status(404).json({
      ok: false,
      status: {
        message: 'Deposit transaction not found.'
      }
    });
  }

  const deposit = rows[0];

  if (
    deposit.Status === 'Cleared' ||
    deposit.DateCleared !== null ||
    deposit.MonthCleared !== null
  ) {
    return res.status(400).json({
      ok: false,
      status: {
        message:
          'This deposit already cleared the bank and cannot be voided.'
      }
    });
  }

  if (deposit.Status === 'Voided') {
    return res.status(400).json({
      ok: false,
      status: {
        message: 'Transaction already voided.'
      }
    });
  }

  await db.query(`
    UPDATE DepositRegister
    SET
      Status = 'Voided',
      DateCleared = NULL,
      MonthCleared = NULL,
      TimeStampUpdated = NOW()
    WHERE DepositTransactionNumber = ?
  `, [transactionNumber]);

  return res.json({
    ok: true,
    status: {
      message: 'VOID successful.'
    }
  });
}





    if (page !== 'CR') {
      return res.status(400).json({
        ok: false,
        status: {
          message:
            'Only Check Register void is enabled at this time.'
        }
      });
    }

    const [rows] = await db.query(`
      SELECT
        CheckTransactionNumber,
        Status,
        DateCheckCleared,
        MonthCleared
      FROM CheckRegister
      WHERE CheckTransactionNumber = ?
      LIMIT 1
    `, [transactionNumber]);

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        status: {
          message: 'Check transaction not found.'
        }
      });
    }

    const check = rows[0];

    if (
      check.Status === 'Cleared' ||
      check.DateCheckCleared !== null ||
      check.MonthCleared !== null
    ) {
      return res.status(400).json({
        ok: false,
        status: {
          message:
            'This check already cleared the bank and cannot be voided.'
        }
      });
    }

    if (check.Status === 'Voided') {
      return res.status(400).json({
        ok: false,
        status: {
          message: 'Transaction already voided.'
        }
      });
    }

    await db.query(`
      UPDATE CheckRegister
      SET
        Status = 'Voided',
        DateCheckCleared = NULL,
        MonthCleared = NULL,
        TimeStampUpdated = NOW()
      WHERE CheckTransactionNumber = ?
    `, [transactionNumber]);

    return res.json({
      ok: true,
      status: {
        message: 'VOID successful.'
      }
    });
  } catch (err) {
    console.error(
      'Error voiding Check Register transaction:',
      err
    );

    return res.status(500).json({
      ok: false,
      status: {
        message: 'Unable to void check.'
      },
      details: err.message
    });
  }
});


/* ===========================================================
   SETTINGS: FINES / LATE FEES PROGRAMMING
   =========================================================== */

app.get('/api/settings/fines-late-fees', async (req, res) => {
  try {
    const [[configRow]] = await db.query(`
      SELECT *
      FROM FinesConfig
      WHERE FinesConfigID = 1
      LIMIT 1
    `);

    const [fineTypeRows] = await db.query(`
      SELECT
        FineCategory,
        SortOrder,
        LetterCode,
        ViolationType,
        GLCode,
        FineAmount,
        ActiveFlag
      FROM FineTypesList
      ORDER BY FineCategory, SortOrder
    `);

    const [letterRows] = await db.query(`
      SELECT *
      FROM LetterRules
      ORDER BY LetterRulesID
    `);

    const [[timingRow]] = await db.query(`
      SELECT *
      FROM TimingSchedule
      WHERE TimingScheduleID = 1
      LIMIT 1
    `);

    function buildFineTypeList(category) {
      return fineTypeRows
        .filter((row) => row.FineCategory === category)
        .map((row) => [
          row.LetterCode || '',
          row.ViolationType || '',
          row.GLCode || '',
          Number(row.FineAmount || 0).toFixed(2),
          row.ActiveFlag || 'Y'
        ]);
    }

    function buildLetterRule(ruleType) {
      const row =
        letterRows.find(
          (r) => r.RuleType === ruleType
        ) || {};

      return {
        letter1Amount:
          Number(row.Letter1Amount || 0).toFixed(2),
        letter1PercentYN:
          row.Letter1PercentYN || 'N',
        letter1Percent:
          Number(row.Letter1Percent || 0).toFixed(2),
        letter1GL:
          row.Letter1GL || '',
        letter2Amount:
          Number(row.Letter2Amount || 0).toFixed(2),
        letter2PercentYN:
          row.Letter2PercentYN || 'N',
        letter2Percent:
          Number(row.Letter2Percent || 0).toFixed(2),
        letter2GL:
          row.Letter2GL || '',
        finalAmount:
          Number(row.FinalAmount || 0).toFixed(2),
        finalGL:
          row.FinalGL || ''
      };
    }

    res.json({
      success: true,

      violationFineRules: {
        restartDays:
          configRow?.RestartDays !== undefined
            ? String(configRow.RestartDays)
            : '',
        fineAmount:
          configRow?.FineAmount !== undefined
            ? Number(configRow.FineAmount).toFixed(2)
            : ''
      },

      fineTypesList: {
        timed: buildFineTypeList('timed'),
        immediate: buildFineTypeList('immediate')
      },

      arrearsRules:
        buildLetterRule('arrearsRules'),

      annualDuesLateFees:
        buildLetterRule('annualDuesLateFees'),

      specialAssessmentLateFees:
        buildLetterRule('specialAssessmentLateFees'),

      timingSchedule: {
        warning1Days:
          timingRow?.Warning1Days !== undefined
            ? String(timingRow.Warning1Days)
            : '30',
        warning2Days:
          timingRow?.Warning2Days !== undefined
            ? String(timingRow.Warning2Days)
            : '60',
        collection1Days:
          timingRow?.Collection1Days !== undefined
            ? String(timingRow.Collection1Days)
            : '90',
        collection2Days:
          timingRow?.Collection2Days !== undefined
            ? String(timingRow.Collection2Days)
            : '120',
        finalDays:
          timingRow?.FinalDays !== undefined
            ? String(timingRow.FinalDays)
            : '150'
      }
    });
  } catch (err) {
    console.error(
      'Error fetching Fines / Late Fees settings:',
      err
    );

    res.status(500).json({
      error:
        'Failed to fetch Fines / Late Fees settings',
      details: err.message
    });
  }
});


app.put('/api/settings/fines-late-fees', async (req, res) => {
  try {
    const {
      violationFineRules = {},
      fineTypesList = {},
      arrearsRules = {},
      annualDuesLateFees = {},
      specialAssessmentLateFees = {},
      timingSchedule = {}
    } = req.body;

    await db.query(`
      UPDATE FinesConfig
      SET
        RestartDays = ?,
        FineAmount = ?,
        TimeStampUpdated = NOW()
      WHERE FinesConfigID = 1
    `, [
      Number(violationFineRules.restartDays || 0),
      Number(violationFineRules.fineAmount || 0)
    ]);

    async function saveFineTypeCategory(
      category,
      rows
    ) {
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];

        await db.query(`
          UPDATE FineTypesList
          SET
            SortOrder = ?,
            LetterCode = ?,
            ViolationType = ?,
            GLCode = ?,
            FineAmount = ?,
            ActiveFlag = ?
          WHERE FineCategory = ?
            AND SortOrder = ?
        `, [
          i,
          row[0] || '',
          row[1] || '',
          row[2] || '',
          Number(row[3] || 0),
          row[4] || 'Y',
          category,
          i
        ]);
      }
    }

    await saveFineTypeCategory(
      'timed',
      fineTypesList.timed || []
    );

    await saveFineTypeCategory(
      'immediate',
      fineTypesList.immediate || []
    );

    async function saveLetterRule(
      ruleType,
      rule
    ) {
      await db.query(`
        UPDATE LetterRules
        SET
          Letter1Amount = ?,
          Letter1PercentYN = ?,
          Letter1Percent = ?,
          Letter1GL = ?,
          Letter2Amount = ?,
          Letter2PercentYN = ?,
          Letter2Percent = ?,
          Letter2GL = ?,
          FinalAmount = ?,
          FinalGL = ?,
          TimeStampUpdated = NOW()
        WHERE RuleType = ?
      `, [
        Number(rule.letter1Amount || 0),
        rule.letter1PercentYN || 'N',
        Number(rule.letter1Percent || 0),
        rule.letter1GL || '',
        Number(rule.letter2Amount || 0),
        rule.letter2PercentYN || 'N',
        Number(rule.letter2Percent || 0),
        rule.letter2GL || '',
        Number(rule.finalAmount || 0),
        rule.finalGL || '',
        ruleType
      ]);
    }

    await saveLetterRule(
      'arrearsRules',
      arrearsRules
    );

    await saveLetterRule(
      'annualDuesLateFees',
      annualDuesLateFees
    );

    await saveLetterRule(
      'specialAssessmentLateFees',
      specialAssessmentLateFees
    );

    await db.query(`
      UPDATE TimingSchedule
      SET
        Warning1Days = ?,
        Warning2Days = ?,
        Collection1Days = ?,
        Collection2Days = ?,
        FinalDays = ?,
        TimeStampUpdated = NOW()
      WHERE TimingScheduleID = 1
    `, [
      Number(timingSchedule.warning1Days || 30),
      Number(timingSchedule.warning2Days || 60),
      Number(timingSchedule.collection1Days || 90),
      Number(timingSchedule.collection2Days || 120),
      Number(timingSchedule.finalDays || 150)
    ]);

    res.json({
      success: true,
      message:
        'Fines / Late Fees settings saved successfully'
    });
  } catch (err) {
    console.error(
      'Error saving Fines / Late Fees settings:',
      err
    );

    res.status(500).json({
      error:
        'Failed to save Fines / Late Fees settings',
      details: err.message
    });
  }
});








/* ===========================================================
   SETTINGS: ANNUAL / SPECIAL DUES PROGRAMMING
   =========================================================== */

app.get('/api/settings/dues-programming', async (req, res) => {
  try {
    const [programRows] = await db.query(`
      SELECT
        DuesType,
        AssessmentFrequency,
        DATE_FORMAT(PaymentDueDate, '%m/%d/%Y') AS PaymentDueDate
      FROM DuesProgramming
      WHERE MgtCoClientID = 'MGTCO-001'
        AND HOALicenseNumber = 'HOA-FL-2024-001'
        AND ActiveFlag = 'Y'
    `);

    const [rateRows] = await db.query(`
      SELECT
        SectionType,
        RateType,
        CurrentRate,
        NextRate
      FROM DuesRates
      ORDER BY DuesRateID
    `);

    function buildSection(sectionType) {
      const program =
        programRows.find(
          (row) => row.DuesType === sectionType
        ) || {};

      const rates = {};

      rateRows
        .filter(
          (row) => row.SectionType === sectionType
        )
        .forEach((row) => {
          rates[row.RateType] = {
            currentRate:
              Number(row.CurrentRate || 0).toFixed(2),
            nextRate:
              Number(row.NextRate || 0).toFixed(2)
          };
        });

      return {
        paymentFrequency:
          program.AssessmentFrequency || 'Annually',

        dueDate:
          program.PaymentDueDate || '',

        rates
      };
    }

    res.json({
      success: true,
      annualDues: buildSection('annualDues'),
      specialAssessment:
        buildSection('specialAssessment'),
      activeSection: 'annual-dues'
    });
  } catch (err) {
    console.error(
      'Error fetching Dues Programming settings:',
      err
    );

    res.status(500).json({
      error:
        'Failed to fetch Dues Programming settings',
      details: err.message
    });
  }
});


app.put('/api/settings/dues-programming', async (req, res) => {
  try {
    const {
      annualDues = {},
      specialAssessment = {}
    } = req.body;

    function sqlDate(mmddyyyy) {
      if (!mmddyyyy) {
        return null;
      }

      const parts = mmddyyyy.split('/');

      if (parts.length !== 3) {
        return null;
      }

      return `${parts[2]}-${parts[0]}-${parts[1]}`;
    }

    async function saveProgrammingRow(
      duesType,
      section
    ) {
      const [existing] = await db.query(`
        SELECT DuesProgrammingID
        FROM DuesProgramming
        WHERE MgtCoClientID = 'MGTCO-001'
          AND HOALicenseNumber = 'HOA-FL-2024-001'
          AND DuesType = ?
        LIMIT 1
      `, [duesType]);

      if (existing.length > 0) {
        await db.query(`
          UPDATE DuesProgramming
          SET
            AssessmentFrequency = ?,
            PaymentDueDate = ?,
            ActiveFlag = 'Y',
            OperatorID = 'USER',
            TimeStampUpdated = NOW()
          WHERE DuesProgrammingID = ?
        `, [
          section.paymentFrequency || 'Annually',
          sqlDate(section.dueDate),
          existing[0].DuesProgrammingID
        ]);
      } else {
        await db.query(`
          INSERT INTO DuesProgramming (
            MgtCoClientID,
            HOALicenseNumber,
            DuesType,
            AssessmentFrequency,
            PaymentDueDate,
            ActiveFlag,
            OperatorID
          )
          VALUES (?, ?, ?, ?, ?, 'Y', 'USER')
        `, [
          'MGTCO-001',
          'HOA-FL-2024-001',
          duesType,
          section.paymentFrequency || 'Annually',
          sqlDate(section.dueDate)
        ]);
      }
    }

    async function saveRates(
      sectionType,
      rates
    ) {
      const rateTypes =
        Object.keys(rates || {});

      if (rateTypes.length === 0) {
        return;
      }

      const currentCases = [];
      const nextCases = [];
      const params = [];

      for (const rateType of rateTypes) {
        currentCases.push(
          'WHEN RateType = ? THEN ?'
        );

        params.push(
          rateType,
          Number(rates[rateType]?.currentRate || 0)
        );
      }

      for (const rateType of rateTypes) {
        nextCases.push(
          'WHEN RateType = ? THEN ?'
        );

        params.push(
          rateType,
          Number(rates[rateType]?.nextRate || 0)
        );
      }

      const placeholders =
        rateTypes.map(() => '?').join(',');

      params.push(
        sectionType,
        ...rateTypes
      );

      await db.query(`
        UPDATE DuesRates
        SET
          CurrentRate =
            CASE
              ${currentCases.join('\n')}
              ELSE CurrentRate
            END,
          NextRate =
            CASE
              ${nextCases.join('\n')}
              ELSE NextRate
            END
        WHERE SectionType = ?
          AND RateType IN (${placeholders})
      `, params);
    }

    await saveProgrammingRow(
      'annualDues',
      annualDues
    );

    await saveProgrammingRow(
      'specialAssessment',
      specialAssessment
    );

    await saveRates(
      'annualDues',
      annualDues.rates
    );

    await saveRates(
      'specialAssessment',
      specialAssessment.rates
    );

    res.json({
      success: true,
      message:
        'Dues Programming settings saved successfully'
    });
  } catch (err) {
    console.error(
      'Error saving Dues Programming settings:',
      err
    );

    res.status(500).json({
      error:
        'Failed to save Dues Programming settings',
      details: err.message
    });
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
     const [rows] = await db.query(`
  SELECT
    child.*
  FROM GLAccounts child
  LEFT JOIN GLAccounts parent
    ON child.PC = 'C'
   AND child.ParentGL = parent.GLNumber
   AND parent.PC = 'P'
   AND parent.ActiveFlag = 'Y'
  WHERE child.ActiveFlag = 'Y'
  ORDER BY
  CASE
    /* Normal child: use its parent's GL# as the section anchor */
    WHEN child.PC = 'C'
         AND TRIM(child.ParentGL) <> ''
    THEN CAST(
      TRIM(SUBSTRING_INDEX(child.ParentGL, '-', 1))
      AS UNSIGNED
    )

    /* Top-level reserved range: place it at the END of its range */
    WHEN child.PC = 'P'
         AND child.GLNumber LIKE '%-%'
    THEN CAST(
      TRIM(SUBSTRING_INDEX(child.GLNumber, '-', -1))
      AS UNSIGNED
    )

    /* Normal parent anchor: order by its own GL# */
    ELSE CAST(
      TRIM(SUBSTRING_INDEX(child.GLNumber, '-', 1))
      AS UNSIGNED
    )
  END ASC,

  CASE
    WHEN child.PC = 'P' THEN 0
    WHEN UPPER(child.GLName) LIKE '%FUTURE%' THEN 2
    ELSE 1
  END ASC,

  child.SortOrder ASC,
  child.GLAccountID ASC
`);
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
      systemLocked: Boolean(r.SystemLocked),
      useInCR: r.UseInCR || 'N',
      useInDP: r.UseInDP || 'N',
      useInAPR: r.UseInAPR || 'N',
      useInBDC: r.UseInBDC || 'N',
      useInXFER: r.UseInXFER || 'N'
    }));
    res.json({ success: true, glAccounts: mapped });
  } catch (err) {
    console.error('Error fetching GL mapping:', err);
    res.status(500).json({ error: 'Failed to fetch GL mapping', details: err.message });
  }
});

app.put('/api/settings/gl-mapping', async (req, res) => {
  const { glAccounts, structuralSave } = req.body;

  if (!Array.isArray(glAccounts)) {
    return res.status(400).json({
      error: 'glAccounts must be an array'
    });
  }

  // -----------------------------------------------------------
  // STRUCTURAL SAVE
  // Add / Delete / Move Up / Move Down / Move To Parent.
  // The array order received from React is the source of truth.
  // -----------------------------------------------------------
  if (structuralSave === true) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const submittedIds = [];

      for (const [idx, r] of glAccounts.entries()) {
        if (r.id) {
          await connection.query(`
            UPDATE GLAccounts SET
              GLNumber=?,
              GLName=?,
              SourceTable=?,
              Description=?,
              BankType=?,
              BankID=?,
              PC=?,
              ParentGL=?,
              ConsolidatedParentGL=?,
              DC=?,
              AR=?,
              EffectiveDate=?,
              LastEditedBy=?,
              SystemLocked=?,
              ActiveFlag='Y',
              SortOrder=?,
              UseInCR=?,
              UseInDP=?,
              UseInAPR=?,
              UseInBDC=?,
              UseInXFER=?,
              TimeStampUpdated=NOW()
            WHERE GLAccountID=?
          `, [
            r.glNumber || '',
            r.glName || '',
            r.sourceTable || '',
            r.description || '',
            r.bankType || '',
            r.bankId || '',
            r.pc || 'P',
            r.parentGl || '',
            r.consolidatedParentGl || '',
            r.dc || 'D',
            r.ar || 'A',
            r.effectiveDate || '',
            r.lastEditedBy || 'SYSTEM',
            r.systemLocked ? 1 : 0,
            idx,
            r.useInCR || 'N',
            r.useInDP || 'N',
            r.useInAPR || 'N',
            r.useInBDC || 'N',
            r.useInXFER || r.useInXfer || 'N',
            r.id
          ]);

          submittedIds.push(Number(r.id));
        } else {
          const [result] = await connection.query(`
            INSERT INTO GLAccounts (
              GLNumber,
              GLName,
              SourceTable,
              Description,
              BankType,
              BankID,
              PC,
              ParentGL,
              ConsolidatedParentGL,
              DC,
              AR,
              EffectiveDate,
              CreatedBy,
              CreatedDate,
              LastEditedBy,
              SystemLocked,
              ActiveFlag,
              SortOrder,
              UseInCR,
              UseInDP,
              UseInAPR,
              UseInBDC,
              UseInXFER
            )
            VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, 'Y', ?, ?, ?, ?, ?, ?
            )
          `, [
            r.glNumber || '',
            r.glName || '',
            r.sourceTable || '',
            r.description || '',
            r.bankType || '',
            r.bankId || '',
            r.pc || 'C',
            r.parentGl || '',
            r.consolidatedParentGl || '',
            r.dc || 'D',
            r.ar || 'A',
            r.effectiveDate || '',
            r.createdBy || 'USER',
            r.createdDate || '',
            r.lastEditedBy || 'USER',
            r.systemLocked ? 1 : 0,
            idx,
            r.useInCR || 'N',
            r.useInDP || 'N',
            r.useInAPR || 'N',
            r.useInBDC || 'N',
            r.useInXFER || r.useInXfer || 'N'
          ]);

          submittedIds.push(Number(result.insertId));
        }
      }

      // A structural save contains the complete active mapping.
      // Any unlocked active row omitted from that complete array
      // was deleted by the user and is retired rather than erased.
      if (submittedIds.length > 0) {
        const placeholders = submittedIds.map(() => '?').join(',');

        await connection.query(`
          UPDATE GLAccounts
          SET ActiveFlag='N',
              TimeStampUpdated=NOW()
          WHERE ActiveFlag='Y'
            AND SystemLocked=0
            AND GLAccountID NOT IN (${placeholders})
        `, submittedIds);
      }

      await connection.commit();

      return res.json({
        success: true,
        message: 'GL Accounts structure updated successfully'
      });
    } catch (err) {
      await connection.rollback();
      console.error('Error updating GL mapping structure:', err);

      return res.status(500).json({
        error: 'Failed to update GL mapping structure',
        details: err.message
      });
    } finally {
      connection.release();
    }
  }

  // -----------------------------------------------------------
  // SINGLE-ROW SAVE
  // Ordinary field edit. SortOrder is intentionally untouched.
  // -----------------------------------------------------------
  try {
    for (const r of glAccounts) {
      if (!r.id) {
        // Fast new-row save: insert only this P or C row.
        // P display order is calculated by the GET query from GLNumber.
        // C rows receive the next SortOrder within their ParentGL group.
        const [sortRows] = await db.query(
          r.pc === 'C' && String(r.parentGl || '').trim() !== ''
            ? `SELECT COALESCE(MAX(SortOrder), -1) + 1 AS nextSortOrder
                 FROM GLAccounts
                WHERE ActiveFlag='Y' AND PC='C' AND ParentGL=?`
            : `SELECT COALESCE(MAX(SortOrder), -1) + 1 AS nextSortOrder
                 FROM GLAccounts
                WHERE ActiveFlag='Y' AND PC='P'`,
          r.pc === 'C' && String(r.parentGl || '').trim() !== ''
            ? [r.parentGl]
            : []
        );

        const nextSortOrder = Number(sortRows[0]?.nextSortOrder) || 0;

        await db.query(`
          INSERT INTO GLAccounts (
            GLNumber, GLName, SourceTable, Description, BankType, BankID,
            PC, ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate,
            CreatedBy, CreatedDate, LastEditedBy, SystemLocked, ActiveFlag,
            SortOrder, UseInCR, UseInDP, UseInAPR, UseInBDC, UseInXFER
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Y',
            ?, ?, ?, ?, ?, ?
          )
        `, [
          r.glNumber || '',
          r.glName || '',
          r.sourceTable || '',
          r.description || '',
          r.bankType || '',
          r.bankId || '',
          r.pc || 'C',
          r.parentGl || '',
          r.consolidatedParentGl || '',
          r.dc || 'D',
          r.ar || 'A',
          r.effectiveDate || '',
          r.createdBy || 'USER',
          r.createdDate || '',
          r.lastEditedBy || 'USER',
          r.systemLocked ? 1 : 0,
          nextSortOrder,
          r.useInCR || 'N',
          r.useInDP || 'N',
          r.useInAPR || 'N',
          r.useInBDC || 'N',
          r.useInXFER || r.useInXfer || 'N'
        ]);

        continue;
      }

      await db.query(`
        UPDATE GLAccounts SET
          GLNumber=?,
          GLName=?,
          SourceTable=?,
          Description=?,
          BankType=?,
          BankID=?,
          PC=?,
          ParentGL=?,
          ConsolidatedParentGL=?,
          DC=?,
          AR=?,
          EffectiveDate=?,
          LastEditedBy=?,
          SystemLocked=?,
          UseInCR=?,
          UseInDP=?,
          UseInAPR=?,
          UseInBDC=?,
          UseInXFER=?,
          TimeStampUpdated=NOW()
        WHERE GLAccountID=?
      `, [
        r.glNumber || '',
        r.glName || '',
        r.sourceTable || '',
        r.description || '',
        r.bankType || '',
        r.bankId || '',
        r.pc || 'P',
        r.parentGl || '',
        r.consolidatedParentGl || '',
        r.dc || 'D',
        r.ar || 'A',
        r.effectiveDate || '',
        r.lastEditedBy || 'SYSTEM',
        r.systemLocked ? 1 : 0,
        r.useInCR || 'N',
        r.useInDP || 'N',
        r.useInAPR || 'N',
        r.useInBDC || 'N',
        r.useInXFER || r.useInXfer || 'N',
        r.id
      ]);
    }

    return res.json({
      success: true,
      message: 'GL Account updated successfully'
    });
  } catch (err) {
    console.error('Error updating GL mapping:', err);

    return res.status(500).json({
      error: 'Failed to update GL mapping',
      details: err.message
    });
  }
});

/* ============================================================
   GL OPTIONS FOR TRANSACTION ENTRY
=========================================================== */

app.get('/api/gl-options', async (req, res) => {
  try {
    // 'screen' is the standard param. 'page' is accepted temporarily
    // for backward compatibility with older frontend calls.
    const screen = String(
      req.query.screen || req.query.page || ''
    ).toUpperCase().trim();
    const bankId = req.query.bankId ? String(req.query.bankId).trim() : '';

    const fieldMap = {
      CR: 'UseInCR',
      DP: 'UseInDP',
      APR: 'UseInAPR',
      BDC: 'UseInBDC',
      XFER: 'UseInXFER'
    };

    const useField = fieldMap[screen];

    if (!useField) {
      return res.status(400).json({
        error: 'Invalid screen. Use CR, DP, APR, BDC, or XFER.'
      });
    }

    const [rows] = await db.query(`
  SELECT
    GLAccountID,
    GLNumber,
    GLName,
    SourceTable,
    BankType,
    BankID,
    PC,
    ParentGL
  FROM GLAccounts
  WHERE ActiveFlag = 'Y'
    AND ${useField} = 'Y'
  ORDER BY SortOrder ASC, GLAccountID ASC
`);

const glAccounts = rows.map((row) => ({
  id: row.GLAccountID,
  glNumber: row.GLNumber,
  glName: row.GLName,
  sourceTable: row.SourceTable,
  bankType: row.BankType,
  bankId: row.BankID,
  pc: row.PC,
  parentGl: row.ParentGL
}));

    // If a bank was selected, prefer GLs configured for that bank;
    // keep the rest as fallback since server-side matching rule is not finalized yet.
    let options = glAccounts;
    if (bankId) {
      const forBank = glAccounts.filter(g => g.bankId === bankId);
      if (forBank.length > 0) {
        options = forBank;
      }
    }

    res.json({
      success: true,
      screen,
      bankId,
      count: options.length,
      glAccounts: options
    });
  } catch (err) {
    console.error('Error fetching GL options:', err);

    res.status(500).json({
      error: 'Failed to fetch GL options',
      details: err.message
    });
  }
});

/* ===========================================================
   APR ASSESSMENT PAYMENT REGISTER (V3 Fase 1)
   Tablas PERSISTIDAS, MANTENIDAS INCREMENTALMENTE.
   Un APR posting actualiza SOLO el residente afectado.
   Recalculate/Rebuild = utilidad de excepción.
   Identidad: (MgtCoClientID, HOALicenseNumber, ResidentAccountID,
               CurrentFiscalYearBegins, Frequency)
   DDL: backend/migrations/001_apr_unified_register.sql
        docs/APR_DDL_draft.sql (requiere CREATE/ALTER — Ricktest no tiene permiso;
        ejecutar como admin en www.1mag1na.xyz)
   =========================================================== */

// Helper: APR transaction number (server-assigned, V3 §2b) — APR-YYMMDD-SEQ, FOR UPDATE safe
async function generateAprTransactionNumber(conn) {
  const [rows] = await conn.query(
    "SELECT TransactionNumber FROM AssessmentPaymentRegister WHERE TransactionNumber LIKE CONCAT('APR-', DATE_FORMAT(CURDATE(), '%y%m%d'), '-%') ORDER BY TransactionNumber DESC LIMIT 1 FOR UPDATE"
  );
  const prefix = `APR-${new Date().toISOString().slice(2,10).replace(/-/g,'')}-`;
  const maxSeq = rows && rows[0] ? parseInt(String(rows[0].TransactionNumber).slice(-4), 10) || 0 : 0;
  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
}

function deriveFiscalYearBegins(paymentDate, fiscalYearBegins) {
  if (fiscalYearBegins) {
    const d = new Date(fiscalYearBegins);
    if (!isNaN(d)) return d.toISOString().slice(0,10);
  }
  const pd = paymentDate ? new Date(paymentDate) : new Date();
  const y = isNaN(pd) ? new Date().getFullYear() : pd.getFullYear();
  return `${y}-01-01`;
}

function derivePeriodNumber(paymentDate, frequency) {
  const pd = paymentDate ? new Date(paymentDate) : new Date();
  if (isNaN(pd)) return 1;
  const m = pd.getMonth() + 1;
  if (frequency === 'Monthly') return m;
  if (frequency === 'Quarterly') return Math.ceil(m/3);
  if (frequency === 'Semi-Annually') return m <= 6 ? 1 : 2;
  return 1;
}

async function getHoaIdentity(conn) {
  const [rows] = await conn.query("SELECT MgtCoClientID, HOALicenseNumber FROM HOAProfile LIMIT 1");
  return rows[0] || { MgtCoClientID: 'MGTCO-001', HOALicenseNumber: 'HOA-FL-2024-001' };
}

async function getFrequency(conn, paymentType) {
  const duesType = paymentType === 'SpecialAssessment' ? 'specialAssessment' : 'annualDues';
  const [rows] = await conn.query("SELECT AssessmentFrequency FROM DuesProgramming WHERE DuesType=? LIMIT 1", [duesType]);
  return rows[0]?.AssessmentFrequency || 'Annually';
}

// B1: inicializa AssessmentRegister + AssessmentRegisterPeriod al crear residente (importes 100% desde DuesRates)
async function resolveFiscalYearBegins(conn) {
  try {
    const [rows] = await conn.query("SELECT FiscalYearStartDate FROM FiscalYearSetup WHERE CurrentFiscalYearFlag='Y' LIMIT 1");
    if (rows && rows[0] && rows[0].FiscalYearStartDate) return String(rows[0].FiscalYearStartDate);
  } catch (e) { /* FiscalYearSetup puede no existir aún */ }
  console.warn('[APR init] FiscalYearSetup sin fila actual; usando default año-01-01');
  return deriveFiscalYearBegins(null, null);
}

async function initializeAssessmentRegister(conn, ctx) {
  const { residentAccountId, lastName, address, annualRateCode, specialRateCode, operatorId } = ctx;
  const hoa = await getHoaIdentity(conn);
  const frequency = await getFrequency(conn, 'AnnualDues');
  const [annual] = await conn.query("SELECT CurrentRate FROM DuesRates WHERE SectionType='annualDues' AND RateType=? LIMIT 1", [annualRateCode || '']);
  const [special] = await conn.query("SELECT CurrentRate FROM DuesRates WHERE SectionType='specialAssessment' AND RateType=? LIMIT 1", [specialRateCode || '']);
  const annualAmt = annual && annual[0] ? Number(annual[0].CurrentRate) || 0 : 0;
  const specialAmt = special && special[0] ? Number(special[0].CurrentRate) || 0 : 0;
  const periodCount = { Annually: 1, 'Semi-Annually': 2, Quarterly: 4, Monthly: 12 }[frequency] || 1;
  const periodic = (annualAmt + specialAmt) / periodCount;
  const fyBegins = await resolveFiscalYearBegins(conn);
  const [ins] = await conn.query(`
    INSERT INTO AssessmentRegister
      (ResidentAccountID, Frequency, LastName, ResidenceAddress, CurrentFiscalYearBegins, MgtCoClientID, HOALicenseNumber,
       AssignedAnnualDuesRate, AssignedSpecialAssessmentRate, TotalYearlyRequiredAnnualDues, RequiredSpecialAssessment,
       RequiredPeriodicPayment, CurrentAssessmentPaymentDue, TotalAnnualDuesPaymentsYTD, TotalSpecialAssessmentPaidYTD, TotalCurrentAR, OperatorID)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0,?)
  `, [residentAccountId, frequency, lastName || null, address || null, fyBegins, hoa.MgtCoClientID, hoa.HOALicenseNumber,
      annualAmt, specialAmt, annualAmt, specialAmt, periodic, periodic, operatorId || 'SYSTEM']);
  const assmtRegId = ins.insertId;
  for (let p = 1; p <= periodCount; p++) {
    await conn.query(`
      INSERT INTO AssessmentRegisterPeriod
        (AssmtRegID, MgtCoClientID, HOALicenseNumber, ResidentAccountID, CurrentFiscalYearBegins, Frequency, PeriodNumber, PeriodAmount)
      VALUES (?,?,?,?,?,?,?,?)
    `, [assmtRegId, hoa.MgtCoClientID, hoa.HOALicenseNumber, residentAccountId, fyBegins, frequency, p, periodic]);
  }
  return assmtRegId;
}

// POST /api/apr/enter-payment — Fase 1: posting atómico APR → AssmtRegisters → CashFlow
app.post('/api/apr/enter-payment', async (req, res) => {
  try {
    const { residentAccountId, paymentType, amount, annualDuesPayment, specialAssessmentPayment,
            bankAccountId, glNumber, fiscalYearBegins, mgtCoClientId, hoaLicenseNumber,
            paymentDate, creditAmount, operatorId } = req.body;

    const hasAnnual = (parseFloat(annualDuesPayment ?? amount) || 0) > 0;
    const hasSpecial = (parseFloat(specialAssessmentPayment) || 0) > 0;
    if ((paymentType === 'AnnualDues' && hasSpecial) || (paymentType === 'SpecialAssessment' && hasAnnual) || (hasAnnual && hasSpecial && !paymentType)) {
      return res.status(400).json({ error: 'Annual Dues and Special Assessment cannot coexist on a single APR transaction row. Post them as separate rows.' });
    }
    if (!residentAccountId) return res.status(400).json({ error: 'residentAccountId is required' });
    if (paymentType === 'SpecialAssessment' && !bankAccountId) {
      return res.status(400).json({ error: 'BankAccountID is required for Special Assessment. Select the receiving bank.' });
    }
    const cleanPaymentType = paymentType || (hasSpecial ? 'SpecialAssessment' : 'AnnualDues');
    const annualAmt = hasAnnual ? parseDecimal(annualDuesPayment ?? amount) : 0;
    const specialAmt = hasSpecial ? parseDecimal(specialAssessmentPayment) : 0;
    const totalAmt = annualAmt + specialAmt + parseDecimal(creditAmount || 0);
    if (totalAmt <= 0) return res.status(400).json({ error: 'Amount must be > 0' });

    const result = await db.withTransaction(async (conn) => {
      // 1) Validar residente existe (FOR SHARE para bloquear si existe)
      const [resRows] = await conn.query("SELECT ResidentAccountID, LastName, ResidenceAddress FROM ResidentMaster WHERE ResidentAccountID=? LIMIT 1", [residentAccountId]);
      if (!resRows[0]) throw Object.assign(new Error(`Resident ${residentAccountId} not found`), { status: 404 });

      // 2) Identidad HOA + Frequency + FiscalYear
      const hoa = await getHoaIdentity(conn);
      const effMgtCo = mgtCoClientId || hoa.MgtCoClientID;
      const effHoa = hoaLicenseNumber || hoa.HOALicenseNumber;
      const frequency = await getFrequency(conn, cleanPaymentType);
      const fyBegins = deriveFiscalYearBegins(paymentDate, fiscalYearBegins);
      const periodNumber = derivePeriodNumber(paymentDate, frequency);

      // 3) Resolver banco / tipo
      let bankType = 'Operating';
      let effBankId = bankAccountId ? parseInt(bankAccountId,10) : null;
      if (effBankId) {
        const [bRows] = await conn.query("SELECT BankType FROM BankAccount WHERE BankAccountID=? LIMIT 1", [effBankId]);
        if (!bRows[0]) throw Object.assign(new Error(`BankAccountID ${effBankId} not found`), { status: 404 });
        bankType = bRows[0].BankType;
      } else {
        const [bRows] = await conn.query("SELECT BankAccountID, BankType FROM BankAccount WHERE BankType='Operating' LIMIT 1");
        if (bRows[0]) { effBankId = bRows[0].BankAccountID; bankType = bRows[0].BankType; }
      }

      // 4) Generar TransactionNumber
      const txn = await generateAprTransactionNumber(conn);

      // 5) INSERT AssessmentPaymentRegister (fuente de verdad)
      const payDate = paymentDate ? new Date(paymentDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
      await conn.query(`
        INSERT INTO AssessmentPaymentRegister
          (TransactionNumber, ResidentAccountID, PaymentType, PaymentDate, AnnualDuesPayment, SpecialAssessmentPayment, CreditAmount, TotalAmount, BankAccountID, GLNumber, MgtCoClientID, HOALicenseNumber, CurrentFiscalYearBegins, Frequency, PeriodNumber, OperatorID)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `, [txn, residentAccountId, cleanPaymentType, payDate, annualAmt, specialAmt, parseDecimal(creditAmount||0), totalAmt, effBankId, glNumber||null, effMgtCo, effHoa, fyBegins, frequency, periodNumber, operatorId||'SYSTEM']);

      // 6) UPSERT AssessmentRegister — solo residente afectado
      const [existing] = await conn.query(`
        SELECT AssmtRegID, TotalAnnualDuesPaymentsYTD, TotalSpecialAssessmentPaidYTD FROM AssessmentRegister
        WHERE MgtCoClientID=? AND HOALicenseNumber=? AND ResidentAccountID=? AND CurrentFiscalYearBegins=? AND Frequency=? FOR UPDATE
      `, [effMgtCo, effHoa, residentAccountId, fyBegins, frequency]);

      let assmtRegId;
      if (!existing[0]) {
        const lastName = resRows[0].LastName || null;
        const addr = resRows[0].ResidenceAddress || null;
        const [ins] = await conn.query(`
          INSERT INTO AssessmentRegister
            (ResidentAccountID, Frequency, LastName, ResidenceAddress, CurrentFiscalYearBegins, MgtCoClientID, HOALicenseNumber, TotalAnnualDuesPaymentsYTD, TotalSpecialAssessmentPaidYTD, TotalCurrentAR, OperatorID)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `, [residentAccountId, frequency, lastName, addr, fyBegins, effMgtCo, effHoa, annualAmt, specialAmt, totalAmt, operatorId||'SYSTEM']);
        assmtRegId = ins.insertId;
      } else {
        assmtRegId = existing[0].AssmtRegID;
        await conn.query(`
          UPDATE AssessmentRegister SET
            TotalAnnualDuesPaymentsYTD = TotalAnnualDuesPaymentsYTD + ?,
            TotalSpecialAssessmentPaidYTD = TotalSpecialAssessmentPaidYTD + ?,
            TotalCurrentAR = TotalCurrentAR + ?,
            TimeStampUpdated = NOW()
          WHERE AssmtRegID=?
        `, [annualAmt, specialAmt, totalAmt, assmtRegId]);
      }

      // 7) UPSERT AssessmentRegisterPeriod
      await conn.query(`
        INSERT INTO AssessmentRegisterPeriod
          (AssmtRegID, MgtCoClientID, HOALicenseNumber, ResidentAccountID, CurrentFiscalYearBegins, Frequency, PeriodNumber, PeriodAmount)
        VALUES (?,?,?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE PeriodAmount = PeriodAmount + VALUES(PeriodAmount)
      `, [assmtRegId, effMgtCo, effHoa, residentAccountId, fyBegins, frequency, periodNumber, totalAmt]);

      // 8) UPDATE ResidentMaster credit / balance si existe columna (ignorar si no)
      try {
        await conn.query("UPDATE ResidentMaster SET ResidentCreditBalance = COALESCE(ResidentCreditBalance,0) + ? WHERE ResidentAccountID=?", [parseDecimal(creditAmount||0), residentAccountId]);
      } catch (e) { if (e.code !== 'ER_BAD_FIELD_ERROR') throw e; }

      // 9) CashFlow posting incremental — tabla por BankType (whitelist)
      const cfTableMap = { Operating: 'CashFlowTransaction_Operating', Capital: 'CashFlowTransaction_Capital', Escrow: 'CashFlowTransaction_Escrow', 'Money Market': 'CashFlowTransaction_MoneyMarket', Savings: 'CashFlowTransaction_Savings', MoneyMarket: 'CashFlowTransaction_MoneyMarket' };
      const cfTable = cfTableMap[bankType] || 'CashFlowTransaction_Operating';
      const fiscalYearLabel = String(new Date(fyBegins).getFullYear());
      // derivar FiscalPeriod del paymentDate
      const fiscalPeriod = derivePeriodNumber(payDate, 'Monthly');
      await conn.query(`
        INSERT INTO ${cfTable}
          (MgtCoClientID, HOALicenseNumber, BankType, BankAccountID, FiscalYearLabel, FiscalPeriod, SourceRegister, SourceTransactionNumber, TransactionDate, PayeeDepositorName, ResidentAccountID, GLNumber, CashInAmount, TransactionDescription, OperatorID)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `, [effMgtCo, effHoa, bankType, effBankId, fiscalYearLabel, fiscalPeriod, 'APR', txn, payDate, resRows[0].LastName || residentAccountId, residentAccountId, glNumber||null, totalAmt, `${cleanPaymentType} payment`, operatorId||'SYSTEM']);

      return { transactionNumber: txn, assmtRegId, periodNumber, frequency, fiscalYearBegins: fyBegins, totalAmount: totalAmt, bankAccountId: effBankId, bankType };
    });

    return res.json({ success: true, ...result });
  } catch (err) {
    const isMissingTable = err.code === 'ER_NO_SUCH_TABLE' || /doesn't exist/i.test(err.message);
    const isDenied = err.code === 'ER_TABLEACCESS_DENIED_ERROR' || /denied/i.test(err.message);
    if (isMissingTable || isDenied) {
      return res.status(501).json({ error: 'APR tables not yet created — DDL requiere privilegio CREATE/ALTER. Ejecutar backend/migrations/001_apr_unified_register.sql como admin en www.1mag1na.xyz', details: err.message, code: err.code });
    }
    if (err.status === 404) return res.status(404).json({ error: err.message });
    console.error('Error in /api/apr/enter-payment:', err);
    return res.status(500).json({ error: 'Failed to post APR payment', details: err.message });
  }
});

// GET /api/apr/list — lista transacciones APR (fuente de verdad)
app.get('/api/apr/list', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit,10)||50, 200);
    const [rows] = await db.query("SELECT * FROM AssessmentPaymentRegister WHERE DeletedFlag!='Y' ORDER BY TimeStampCreated DESC LIMIT ?", [limit]);
    res.json({ transactions: rows });
  } catch (err) {
    const isMissing = err.code === 'ER_NO_SUCH_TABLE';
    if (isMissing) return res.status(501).json({ error: 'AssessmentPaymentRegister not yet created — ejecutar migration 001', details: err.message });
    res.status(500).json({ error: err.message });
  }
});

// GET /api/apr/register/:residentAccountId — estado agregado por residente/año
app.get('/api/apr/register/:residentAccountId', async (req, res) => {
  try {
    const { residentAccountId } = req.params;
    const fy = req.query.fiscalYearBegins || null;
    const where = fy ? "AND CurrentFiscalYearBegins=?" : "";
    const params = fy ? [residentAccountId, fy] : [residentAccountId];
    const [regs] = await db.query(`SELECT * FROM AssessmentRegister WHERE ResidentAccountID=? ${where} ORDER BY CurrentFiscalYearBegins DESC`, params);
    const [periods] = await db.query(`SELECT * FROM AssessmentRegisterPeriod WHERE ResidentAccountID=? ${where} ORDER BY PeriodNumber`, params);
    res.json({ registers: regs, periods });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') return res.status(501).json({ error: 'AssessmentRegister not yet created', details: err.message });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/apr/void — void server-side con reversión de agregados (V3 §10)
app.post('/api/apr/void', async (req, res) => {
  try {
    const { transactionNumber } = req.body;
    if (!transactionNumber) return res.status(400).json({ error: 'transactionNumber is required' });
    const result = await db.withTransaction(async (conn) => {
      const [rows] = await conn.query("SELECT * FROM AssessmentPaymentRegister WHERE TransactionNumber=? AND DeletedFlag!='Y' FOR UPDATE", [transactionNumber]);
      const txn = rows[0];
      if (!txn) throw Object.assign(new Error(`Transaction ${transactionNumber} not found`), { status: 404 });
      if (txn.Status === 'VOID') throw Object.assign(new Error('Already voided'), { status: 409 });
      // Revertir AssessmentRegister
      await conn.query(`
        UPDATE AssessmentRegister SET
          TotalAnnualDuesPaymentsYTD = GREATEST(TotalAnnualDuesPaymentsYTD - ?, 0),
          TotalSpecialAssessmentPaidYTD = GREATEST(TotalSpecialAssessmentPaidYTD - ?, 0),
          TotalCurrentAR = GREATEST(TotalCurrentAR - ?, 0)
        WHERE MgtCoClientID=? AND HOALicenseNumber=? AND ResidentAccountID=? AND CurrentFiscalYearBegins=? AND Frequency=?
      `, [txn.AnnualDuesPayment, txn.SpecialAssessmentPayment, txn.TotalAmount, txn.MgtCoClientID, txn.HOALicenseNumber, txn.ResidentAccountID, txn.CurrentFiscalYearBegins, txn.Frequency]);
      // Revertir Period
      await conn.query(`
        UPDATE AssessmentRegisterPeriod SET PeriodAmount = GREATEST(PeriodAmount - ?, 0)
        WHERE MgtCoClientID=? AND HOALicenseNumber=? AND ResidentAccountID=? AND CurrentFiscalYearBegins=? AND Frequency=? AND PeriodNumber=?
      `, [txn.TotalAmount, txn.MgtCoClientID, txn.HOALicenseNumber, txn.ResidentAccountID, txn.CurrentFiscalYearBegins, txn.Frequency, txn.PeriodNumber]);
      // Marcar VOID
      await conn.query("UPDATE AssessmentPaymentRegister SET Status='VOID', DeletedFlag='Y' WHERE TransactionNumber=?", [transactionNumber]);
      // Revertir CashFlow (marcar VoidFlag)
      const cfMap = { Operating: 'CashFlowTransaction_Operating', Capital: 'CashFlowTransaction_Capital', Escrow: 'CashFlowTransaction_Escrow', 'Money Market': 'CashFlowTransaction_MoneyMarket', Savings: 'CashFlowTransaction_Savings', MoneyMarket: 'CashFlowTransaction_MoneyMarket' };
      // Intentar localizar por SourceTransactionNumber en todas las tablas si no se conoce bankType
      for (const tbl of Object.values(cfMap)) {
        try { await conn.query(`UPDATE ${tbl} SET VoidFlag='Y', DeletedFlag='Y' WHERE SourceRegister='APR' AND SourceTransactionNumber=?`, [transactionNumber]); } catch (e) {}
      }
      return { transactionNumber, voided: true };
    });
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    if (err.code === 'ER_NO_SUCH_TABLE') return res.status(501).json({ error: 'APR tables not yet created', details: err.message });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/apr/recalculate — utilidad de excepción (reconciliación/reparación), no flujo normal
app.post('/api/apr/recalculate', async (req, res) => {
  return res.status(501).json({ error: 'Not implemented — utilidad de excepción para rebuild de AssessmentRegisters/CashFlow', details: 'V3 §6 y refinamiento incremental: no recalcular en flujo normal' });
});

// Fase 1 Cash Flow incremental: CR/DP ya no necesitan rebuild; APR ya postea arriba.
// Los POST /api/check-register y /api/deposit-register deberán migrar a débito/crédito
// CashFlowTransaction_* en siguiente iteración (hoy solo actualizan BankAccount).

// START SERVER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 W M+ Express Backend API running on port ${PORT}`);
});

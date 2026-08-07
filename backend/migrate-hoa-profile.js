const db = require('./db');

const columnsToVerify = [
  { name: 'HOABillingName', type: 'VARCHAR(150)' },
  { name: 'HOALetterName', type: 'VARCHAR(150)' },
  { name: 'HOAAddress', type: 'VARCHAR(150)' },
  { name: 'HOAEmail', type: 'VARCHAR(100)' },
  { name: 'HOANotes', type: 'VARCHAR(1000)' },
  { name: 'LicenseStatus', type: 'VARCHAR(20)' },
  { name: 'SubscriptionRenewalDate', type: 'VARCHAR(50)' },
  { name: 'LicenseType', type: 'VARCHAR(30)' },
  { name: 'LicenseSize', type: 'VARCHAR(20)' },
  { name: 'ClientNotes', type: 'VARCHAR(1000)' },
  { name: 'SelfManaged', type: 'CHAR(1) DEFAULT "N"' },
  { name: 'MgtCoName', type: 'VARCHAR(150)' },
  { name: 'MgtCoAddress', type: 'VARCHAR(150)' },
  { name: 'MgtCoContactName', type: 'VARCHAR(100)' },
  { name: 'MgtCoContactTel', type: 'VARCHAR(25)' },
  { name: 'MgtCoContactEmail', type: 'VARCHAR(100)' },
  { name: 'ClientRepresentative', type: 'VARCHAR(100)' },
  { name: 'RepPhone', type: 'VARCHAR(25)' },
  { name: 'RepEmail', type: 'VARCHAR(100)' },
  { name: 'MgtCoLetterEmail', type: 'VARCHAR(100)' },
  { name: 'MgtCoLetterPhone', type: 'VARCHAR(25)' },
  { name: 'ManagementNotes', type: 'VARCHAR(1000)' }
];

async function runMigration() {
  try {
    console.log('🔄 Starting HOAProfile table migration...');
    
    // 1. Fetch existing columns
    const [existingColsRows] = await db.query('SHOW COLUMNS FROM HOAProfile');
    const existingColNames = existingColsRows.map(row => row.Field.toLowerCase());
    
    console.log(`📊 Found ${existingColNames.length} existing columns in HOAProfile.`);

    // 2. Add missing columns
    for (const col of columnsToVerify) {
      if (!existingColNames.includes(col.name.toLowerCase())) {
        console.log(`➕ Adding column "${col.name}" of type ${col.type}...`);
        await db.query(`ALTER TABLE HOAProfile ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Column "${col.name}" added successfully.`);
      } else {
        console.log(`ℹ️ Column "${col.name}" already exists.`);
      }
    }

    // 3. Ensure a default profile row exists (ProfileID = 1)
    const [rows] = await db.query('SELECT COUNT(*) as count FROM HOAProfile');
    if (rows[0].count === 0) {
      console.log('🌱 No rows found in HOAProfile. Seeding default row...');
      await db.query(`
        INSERT INTO HOAProfile (
          ProfileID, MgtCoClientID, HOALicenseNumber, HOAName, ActiveFlag, TimeStampCreated
        ) VALUES (
          1, 'MGTCO-001', 'LIC-999-999', 'My HOA Corporate Name', 'Y', NOW()
        )
      `);
      console.log('✅ Default row seeded successfully.');
    } else {
      console.log('ℹ️ HOAProfile table already has data.');
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();

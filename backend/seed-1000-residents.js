const db = require('./db');

const FIRST_NAMES = [
  'James', 'Sofia', 'William', 'Amanda', 'Robert', 'Maria', 'Carlos', 'Elena', 'David', 'Sarah',
  'Michael', 'Jessica', 'Daniel', 'Emily', 'John', 'Ashley', 'Christopher', 'Samantha', 'Matthew', 'Elizabeth',
  'Joshua', 'Taylor', 'Andrew', 'Hannah', 'Joseph', 'Alexis', 'Ethan', 'Rachel', 'Jacob', 'Megan',
  'Nicholas', 'Victoria', 'Anthony', 'Lauren', 'Ryan', 'Alyssa', 'Tyler', 'Brianna', 'Alexander', 'Grace',
  'Brandon', 'Chloe', 'Jonathan', 'Natalie', 'Samuel', 'Olivia', 'Christian', 'Emma', 'Benjamin', 'Sophia',
  'Zachary', 'Hailey', 'Dylan', 'Kayla', 'Nathan', 'Abigail', 'Logan', 'Ella', 'Gabriel', 'Mia',
  'Jose', 'Isabella', 'Luis', 'Camila', 'Juan', 'Valeria', 'Diego', 'Sofia', 'Mateo', 'Lucia',
  'Alejandro', 'Martina', 'Sebastian', 'Paula', 'Gabriel', 'Daniela', 'Lucas', 'Sara', 'Adrian', 'Jimena'
];

const LAST_NAMES = [
  'Mitchell', 'Rodriguez', 'Chen', 'Foster', 'Patel', 'Garcia', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Perez', 'Sanchez', 'Torres', 'Ramirez', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Reyes', 'Morales',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const STREET_NAMES = [
  'Palm Vista Cir', 'Ocean Drive', 'Biscayne Blvd', 'Sunset Way', 'Grand Avenue',
  'Pine Tree Lane', 'Oak Ridge Rd', 'Maple Leaf Way', 'Peachtree St', 'Broadway Ave',
  'Wilshire Blvd', 'Michigan Ave', 'Collins Ave', 'Washington Ave', 'Brickell Ave',
  'Magnolia Dr', 'Highland Ave', 'Riverside Dr', 'Lakeview Terrace', 'Bayview Ave'
];

const CITIES_STATES = [
  { city: 'Miami', state: 'FL', zipPrefix: '331' },
  { city: 'Orlando', state: 'FL', zipPrefix: '328' },
  { city: 'Tampa', state: 'FL', zipPrefix: '336' },
  { city: 'Fort Lauderdale', state: 'FL', zipPrefix: '333' },
  { city: 'New York', state: 'NY', zipPrefix: '100' },
  { city: 'Buffalo', state: 'NY', zipPrefix: '142' },
  { city: 'Los Angeles', state: 'CA', zipPrefix: '900' },
  { city: 'San Francisco', state: 'CA', zipPrefix: '941' },
  { city: 'San Diego', state: 'CA', zipPrefix: '921' },
  { city: 'Houston', state: 'TX', zipPrefix: '770' },
  { city: 'Dallas', state: 'TX', zipPrefix: '752' },
  { city: 'Austin', state: 'TX', zipPrefix: '787' },
  { city: 'Atlanta', state: 'GA', zipPrefix: '303' },
  { city: 'Chicago', state: 'IL', zipPrefix: '606' },
  { city: 'Charlotte', state: 'NC', zipPrefix: '282' },
  { city: 'Las Vegas', state: 'NV', zipPrefix: '891' },
  { city: 'Phoenix', state: 'AZ', zipPrefix: '850' },
  { city: 'Denver', state: 'CO', zipPrefix: '802' },
  { city: 'Seattle', state: 'WA', zipPrefix: '981' }
];

const DUES_RATES = [0.00, 1200.00, 1800.00, 2400.00, 3600.00, 4200.00, 4800.00, 5400.00];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed1000Residents() {
  try {
    console.log('Generating 1000 varied resident records...');

    // Clear existing resident records if desired or insert 1000
    const records = [];
    const values = [];

    for (let i = 1; i <= 1000; i++) {
      const acctId = `RES-${String(i).padStart(4, '0')}`;
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      const displayName = `${firstName} ${lastName}`;
      const street = getRandomItem(STREET_NAMES);
      const unit = getRandomInt(101, 999);
      const residenceAddr = `${getRandomInt(100, 9900)} ${street} #${unit}`;
      const billingAddr = residenceAddr;
      const loc = getRandomItem(CITIES_STATES);
      const city = loc.city;
      const stateCode = loc.state;
      const zipCode = `${loc.zipPrefix}${getRandomInt(10, 99)}`;
      const phone = `305-555-${String(getRandomInt(1000, 9999))}`;
      const cell = `786-555-${String(getRandomInt(1000, 9999))}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 999)}@example.com`;
      const moveInDate = `20${getRandomInt(15, 25)}-${String(getRandomInt(1, 12)).padStart(2, '0')}-${String(getRandomInt(1, 28)).padStart(2, '0')}`;
      const resType = Math.random() > 0.15 ? 'Owner' : 'Tenant';
      const activeFlag = Math.random() > 0.1 ? 'Y' : 'N';
      const achFlag = Math.random() > 0.5 ? 'Y' : 'N';
      const duesRate = getRandomItem(DUES_RATES);
      const duesPaid = Math.random() > 0.3 ? duesRate : duesRate / 2;
      const duesBal = duesRate - duesPaid;

      records.push([
        acctId, firstName, lastName, displayName, residenceAddr, billingAddr,
        city, stateCode, zipCode, phone, cell, email, moveInDate,
        resType, 'Y', activeFlag, achFlag, duesRate, duesRate,
        duesPaid, duesBal, 'MGTCO-001', 'HOA-FL-2024-001', 'SYSTEM'
      ]);
    }

    console.log(`Inserting ${records.length} records into ResidentMaster database table...`);

    // Insert in batches of 100 for maximum MySQL performance
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const placeholders = batch.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`).join(', ');
      const flatValues = batch.flat();

      const sql = `
        INSERT INTO ResidentMaster (
          ResidentAccountID, FirstName, LastName, DisplayName, ResidenceAddress, BillingAddress,
          City, StateCode, ZipCode, PrimaryPhone, PrimaryCell, EmailAddress, MoveInDate,
          ResidentType, OwnerFlag, ActiveResidentFlag, ACHFlag, AnnualDuesRate, AnnualDues,
          AnnualDuesPaidYTD, AnnualDuesBalance, MgtCoClientID, HOALicenseNumber, OperatorID, TimeStampCreated
        ) VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE 
          FirstName=VALUES(FirstName), LastName=VALUES(LastName), DisplayName=VALUES(DisplayName),
          ResidenceAddress=VALUES(ResidenceAddress), City=VALUES(City), StateCode=VALUES(StateCode),
          ZipCode=VALUES(ZipCode), ActiveResidentFlag=VALUES(ActiveResidentFlag),
          AnnualDuesRate=VALUES(AnnualDuesRate), TimeStampUpdated=NOW()
      `;

      await db.query(sql, flatValues);
      console.log(`Inserted batch ${i / batchSize + 1} / ${Math.ceil(records.length / batchSize)}`);
    }

    console.log('✅ Successfully inserted 1000 resident records!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed 1000 residents:', err);
    process.exit(1);
  }
}

seed1000Residents();

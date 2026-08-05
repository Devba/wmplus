const db = require('./db');

async function inspectColumns() {
  const tables = ['ResidentMaster', 'VendorMaster', 'CheckRegister', 'DepositRegister', 'HOAProfile', 'BankAccountMaster', 'GLMapping'];
  
  for (const t of tables) {
    try {
      const [cols] = await db.query(`DESCRIBE \`${t}\``);
      console.log(`\n=== Table: ${t} ===`);
      cols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));
    } catch (e) {
      console.error(`Failed describing ${t}:`, e.message);
    }
  }
  process.exit(0);
}

inspectColumns();

const fs = require('fs');
const path = require('path');
const db = require('./db');

const glMappingPath = path.join(__dirname, '../src/pages/Settings/components/GLMapping/GLMapping.jsx');
const jsonBackupPath = path.join(__dirname, 'gl-defaults.json');

async function getGLData() {
  if (fs.existsSync(glMappingPath)) {
    console.log('🔄 Reading GLMapping.jsx to parse default GL accounts...');
    const fileContent = fs.readFileSync(glMappingPath, 'utf8');

    const expenseMatch = fileContent.match(/const DEFAULT_EXPENSE_ROWS = (\[[\s\S]*?\n\];)/);
    const revenueMatch = fileContent.match(/const DEFAULT_REVENUE_ROWS = (\[[\s\S]*?\n\];)/);

    if (expenseMatch && revenueMatch) {
      const expenseRows = JSON.parse(expenseMatch[1].replace(/;\s*$/, ''));
      const revenueRows = JSON.parse(revenueMatch[1].replace(/;\s*$/, ''));

      const allRows = [
        ...expenseRows.map((r, idx) => ({ ...r, category: 'Expense', sortOrder: idx })),
        ...revenueRows.map((r, idx) => ({ ...r, category: 'Revenue', sortOrder: expenseRows.length + idx }))
      ];

      // Save to gl-defaults.json for standalone use
      fs.writeFileSync(jsonBackupPath, JSON.stringify(allRows, null, 2), 'utf8');
      console.log('💾 Saved backup to gl-defaults.json');
      return allRows;
    }
  }

  if (fs.existsSync(jsonBackupPath)) {
    console.log('🔄 Reading GL accounts from gl-defaults.json...');
    const content = fs.readFileSync(jsonBackupPath, 'utf8');
    return JSON.parse(content);
  }

  throw new Error('Could not find GL accounts data in GLMapping.jsx or gl-defaults.json');
}

async function seedGLAccounts() {
  try {
    const allRows = await getGLData();
    console.log(`🌱 Total GL Accounts to seed: ${allRows.length}`);

    const [countResult] = await db.query('SELECT COUNT(*) AS cnt FROM GLAccounts');
    if (countResult[0].cnt > 0) {
      console.log(`ℹ️  GLAccounts table already has ${countResult[0].cnt} rows. Clearing rows before re-seeding...`);
      await db.query('DELETE FROM GLAccounts');
    }

    let inserted = 0;
    for (const row of allRows) {
      await db.query(
        `INSERT INTO GLAccounts (
          GLNumber, GLName, SourceTable, Description, BankType, BankID, PC,
          ParentGL, ConsolidatedParentGL, DC, AR, EffectiveDate, CreatedBy,
          CreatedDate, LastEditedBy, SystemLocked, ActiveFlag, SortOrder
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Y', ?)`,
        [
          row.glNumber || '',
          row.glName || '',
          row.sourceTable || '',
          row.description || '',
          row.bankType || '',
          row.bankId || '',
          row.pc || 'P',
          row.parentGl || '',
          row.consolidatedParentGl || '',
          row.dc || 'D',
          row.ar || 'A',
          row.effectiveDate || '',
          row.createdBy || 'SYSTEM',
          row.createdDate || '',
          row.lastEditedBy || '',
          row.systemLocked ? 1 : 0,
          row.sortOrder
        ]
      );
      inserted++;
    }

    console.log(`\n🎉 Successfully seeded ${inserted} GL Accounts into MariaDB GLAccounts table!\n`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding GL accounts:', err);
    process.exit(1);
  }
}

seedGLAccounts();

const http = require('http');

const prompts = [
  "residentes que vivan en Miami",
  "los 10 mayores deudores",
  "residentes activos",
  "residentes de florida",
  "dues rate mayor que 1000",
  "los residentes que deben",
  "residentes inactivos en california",
  "cuantos residentes tienen deudas",
  "cuantos residentes hay",
  "cuantos han tenido multas",
  "residentes con multas",
  "residentes que empiecen con la letra a",
  "apellido Mitchell"
];

function sendPrompt(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ prompt });
    const req = http.request({
      hostname: 'localhost',
      port: 3011,
      path: '/api/ai-filter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error(`Failed to parse body: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("🧪 STARTING AI FILTER ENDPOINT TESTS...\n");
  let passed = true;

  for (const prompt of prompts) {
    console.log(`--------------------------------------------------`);
    console.log(`Prompt: "${prompt}"`);
    try {
      const result = await sendPrompt(prompt);
      if (!result.success) {
        console.error(`❌ Request failed:`, result.error || result);
        passed = false;
        continue;
      }

      if (result.mode === 'answer') {
        console.log(`Generated Answer:    "${result.answer}"`);
        console.log(`Parser Source:       [${result.source}]`);
        console.log(`Aggregate SQL:       "${result.answerSql}"`);
        if (!result.answer || result.answerValue === undefined) {
          console.error(`❌ FAIL: answer mode missing answer text/value!`);
          passed = false;
        } else {
          console.log(`✅ Answer mode response verified.`);
        }
        continue;
      }

      console.log(`Generated SQL WHERE: "${result.whereClause}"`);
      console.log(`Parser Source:       [${result.source}]`);
      console.log(`Residents Found:     ${result.residents ? result.residents.length : 0}`);

      if (result.residents && result.residents.length > 0) {
        const first = result.residents[0];
        console.log(`First row sample keys:`, Object.keys(first).slice(0, 8).join(', '));
        console.log(`Sample resident:     ${first.firstName} ${first.lastName} (${first.acctNo}) - City: ${first.city}, State: ${first.state}, Balance: ${first.annualDues}`);
        
        // Assert that the fields match the frontend schema (e.g. acctNo should be present, and ResidentAccountID should NOT be present)
        if ('ResidentAccountID' in first) {
          console.error(`❌ FAIL: Found raw database column 'ResidentAccountID' in response!`);
          passed = false;
        } else if (!('acctNo' in first) || !('lastName' in first) || !('firstName' in first)) {
          console.error(`❌ FAIL: Missing frontend fields 'acctNo', 'lastName', or 'firstName'!`);
          passed = false;
        } else {
          console.log(`✅ Frontend schema mapping verified.`);
        }
      } else {
        console.log(`⚠️ No residents found in the database for this query.`);
      }
    } catch (err) {
      console.error(`❌ Unexpected error for prompt "${prompt}":`, err.message);
      passed = false;
    }
    console.log();
  }

  console.log(`==================================================`);
  if (passed) {
    console.log(`🎉 ALL TESTS PASSED SUCCESSFULLY!`);
    process.exit(0);
  } else {
    console.error(`🔴 SOME TESTS FAILED!`);
    process.exit(1);
  }
}

runTests();

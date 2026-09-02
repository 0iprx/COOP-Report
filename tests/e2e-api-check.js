import assert from 'node:assert';

const BASE_URL = 'http://localhost:5000/api';

async function runApiTests() {
  console.log('--- Starting Live E2E API & Database Verification ---');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthJson = await healthRes.json();
  assert.strictEqual(healthJson.status, 'ok');
  console.log('✔ Health Check Passed:', healthJson.name);

  // 2. Register Supervisor
  const supRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `supervisor_eng_${Date.now()}`,
      password: 'StrongPassword123!',
      role: 'supervisor'
    })
  });
  const supJson = await supRes.json();
  assert.strictEqual(supRes.status, 201);
  const supervisorUser = supJson.user;
  console.log('✔ Supervisor registered:', supervisorUser.username);

  // 3. Register Trainee
  const traineeUsername = `trainee_dev_${Date.now()}`;
  const traineeRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: traineeUsername,
      password: 'StrongPassword123!',
      role: 'trainee'
    })
  });
  const traineeJson = await traineeRes.json();
  assert.strictEqual(traineeRes.status, 201);
  const traineeToken = traineeJson.token;
  console.log('✔ Trainee registered:', traineeUsername);

  // 4. Link Trainee to Supervisor
  const linkRes = await fetch(`${BASE_URL}/supervisor/link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${traineeToken}`
    },
    body: JSON.stringify({
      supervisorUsernameOrCode: supervisorUser.username
    })
  });
  const linkJson = await linkRes.json();
  assert.strictEqual(linkRes.status, 200);
  console.log('✔ Trainee linked to supervisor:', linkJson.message);

  // 5. Post Daily Entries
  const entry1Res = await fetch(`${BASE_URL}/entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${traineeToken}`
    },
    body: JSON.stringify({
      entryDate: '2026-08-30', // Sunday
      timeFrom: '08:00',
      timeTo: '16:00',
      title: 'التعريف ببيئة عمل هواوي والأنظمة السحابية',
      category: 'تدريب وتعلّم',
      description: 'تم حضور الجلسة التعريفية والتعرف على مهندسي الفريق التقني ومسار التدريب.'
    })
  });
  assert.strictEqual(entry1Res.status, 201);

  const entry2Res = await fetch(`${BASE_URL}/entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${traineeToken}`
    },
    body: JSON.stringify({
      entryDate: '2026-08-31', // Monday
      timeFrom: '08:30',
      timeTo: '16:30',
      title: 'تهيئة وبرمجة موجهات الشبكة Huawei AR Series',
      category: 'تطوير / برمجة',
      description: 'سويت تهيئة لموجهات الشبكة وفهمت طريقة التوصيل وصلحت الخلل الفني في الاتصال.'
    })
  });
  assert.strictEqual(entry2Res.status, 201);
  console.log('✔ Daily entries added successfully');

  // 6. Test AI Processing (Polish & Spellcheck)
  const aiPolishRes = await fetch(`${BASE_URL}/ai/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${traineeToken}`
    },
    body: JSON.stringify({
      text: 'سويت تهيئة لموجهات الشبكة وفهمت طريقة التوصيل وصلحت الخلل الفني في الاتصال.',
      action: 'polish'
    })
  });
  const aiPolishJson = await aiPolishRes.json();
  assert.ok(aiPolishJson.result.includes('تم تنفيذ وإنجاز'));
  assert.ok(Array.isArray(aiPolishJson.diff));
  console.log('✔ AI Academic Polish & Diff verified:', aiPolishJson.result);

  // 7. Test AI Translation (Arabic -> English)
  const aiTransRes = await fetch(`${BASE_URL}/ai/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${traineeToken}`
    },
    body: JSON.stringify({
      text: 'التدريب التعاوني في شركة هواوي السعودية',
      action: 'translate',
      targetLang: 'en'
    })
  });
  const aiTransJson = await aiTransRes.json();
  assert.ok(aiTransJson.result.includes('Huawei Tech Saudi'));
  console.log('✔ AI Auto-Translation verified:', aiTransJson.result);

  // 8. Fetch Final Report Data
  const finalRes = await fetch(`${BASE_URL}/reports/final`, {
    headers: { Authorization: `Bearer ${traineeToken}` }
  });
  const finalJson = await finalRes.json();
  assert.strictEqual(finalRes.status, 200);
  assert.strictEqual(finalJson.totalEntries, 2);
  assert.strictEqual(finalJson.totalHours, 16);
  assert.strictEqual(finalJson.weeks.length, 1);
  console.log('✔ Final Report aggregation verified. Total hours:', finalJson.totalHours);

  // 9. Export Genuine DOCX
  const docxRes = await fetch(`${BASE_URL}/reports/export/docx?lang=ar`, {
    headers: { Authorization: `Bearer ${traineeToken}` }
  });
  assert.strictEqual(docxRes.status, 200);
  const docxBuffer = await docxRes.arrayBuffer();
  // Check PK zip header for docx (0x50 0x4B 0x03 0x04)
  const headerBytes = new Uint8Array(docxBuffer.slice(0, 4));
  assert.strictEqual(headerBytes[0], 0x50);
  assert.strictEqual(headerBytes[1], 0x4b);
  console.log('✔ Genuine DOCX generated successfully, size:', docxBuffer.byteLength, 'bytes');

  // 10. Export Standalone HTML
  const htmlRes = await fetch(`${BASE_URL}/reports/export/html?lang=ar`, {
    headers: { Authorization: `Bearer ${traineeToken}` }
  });
  assert.strictEqual(htmlRes.status, 200);
  const htmlText = await htmlRes.text();
  assert.ok(htmlText.includes('تقرير التدريب التعاوني'));
  assert.ok(htmlText.includes('Huawei Tech Saudi'));
  console.log('✔ Standalone HTML generated successfully, length:', htmlText.length, 'chars');

  // 11. Supervisor views trainee report and adds review notes
  const supToken = supJson.token;
  const supTraineesRes = await fetch(`${BASE_URL}/supervisor/trainees`, {
    headers: { Authorization: `Bearer ${supToken}` }
  });
  const supTraineesJson = await supTraineesRes.json();
  assert.strictEqual(supTraineesJson.trainees.length, 1);

  const notesRes = await fetch(`${BASE_URL}/supervisor/trainees/${traineeJson.user.id}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supToken}`
    },
    body: JSON.stringify({
      notes: 'تمت مراجعة سجلات المتدرب، الأداء الفني متميز والتوثيق الأسبوعي مستوفٍ للشروط.'
    })
  });
  assert.strictEqual(notesRes.status, 200);
  console.log('✔ Supervisor inspection and feedback notes verified');

  console.log('\n--- ALL E2E TESTS PASSED WITH 100% SUCCESS ---');
}

runApiTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

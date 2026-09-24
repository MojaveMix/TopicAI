import assert from 'assert';
import app from '../src/app.js';
import { initializeDatabase } from '../src/database/init.js';
import { sequelize } from '../src/config/database.js';

const PORT = 5056;
let server;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const runSearchTests = async () => {
  console.log('\n🧪 Starting AI Search & Search History Module Test Suite...\n');

  try {
    // 1. Initialize Database & start test server
    await initializeDatabase();
    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`[Test Server] Listening on port ${PORT}`);
        resolve();
      });
    });

    // 2. Check AI Engine Status Endpoint
    console.log('🔹 1. Testing AI Status Endpoint (/search/status)...');
    const statusRes = await fetch(`${BASE_URL}/search/status`);
    const statusJson = await statusRes.json();
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual(statusJson.success, true);
    console.log(`✅ AI Status OK: Online = ${statusJson.data.online}, Model = ${statusJson.data.model}`);

    // 3. Perform AI Search (POST /search)
    console.log('🔹 2. Testing AI Search Execution & Database Storage (/search)...');
    const searchRes = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        search: 'What are the main stages of a Cyber Kill Chain?'
      })
    });
    const searchJson = await searchRes.json();
    assert.strictEqual(searchRes.status, 201);
    assert.strictEqual(searchJson.success, true);
    assert(searchJson.data.id, 'Should return saved search ID');
    assert.strictEqual(searchJson.data.search, 'What are the main stages of a Cyber Kill Chain?');
    assert(searchJson.data.result && searchJson.data.result.length > 0, 'Should contain generated AI result');
    const createdSearchId = searchJson.data.id;
    console.log(`✅ AI Search Succeeded: ID = ${createdSearchId}, Engine = ${searchJson.data.aiEngine.status}`);

    // 4. Fetch Search History (GET /search)
    console.log('🔹 3. Testing Search History Listing with Pagination (/search)...');
    const historyRes = await fetch(`${BASE_URL}/search?page=1&limit=10`);
    const historyJson = await historyRes.json();
    assert.strictEqual(historyRes.status, 200);
    assert.strictEqual(historyJson.success, true);
    assert(Array.isArray(historyJson.data), 'Data should be an array of search items');
    assert(historyJson.data.some(item => item.id === createdSearchId), 'Should include the created search');
    console.log(`✅ History retrieved successfully: Found ${historyJson.data.length} records.`);

    // 5. Fetch Search by ID (GET /search/:id)
    console.log('🔹 4. Testing Get Search by ID (/search/:id)...');
    const byIdRes = await fetch(`${BASE_URL}/search/${createdSearchId}`);
    const byIdJson = await byIdRes.json();
    assert.strictEqual(byIdRes.status, 200);
    assert.strictEqual(byIdJson.data.id, createdSearchId);
    console.log('✅ Found search record by ID successfully.');

    // 6. Delete Search by ID (DELETE /search/:id)
    console.log('🔹 5. Testing Delete Search Record (/search/:id)...');
    const delRes = await fetch(`${BASE_URL}/search/${createdSearchId}`, {
      method: 'DELETE'
    });
    const delJson = await delRes.json();
    assert.strictEqual(delRes.status, 200);
    assert.strictEqual(delJson.success, true);

    // Verify it is gone
    const verifyDelRes = await fetch(`${BASE_URL}/search/${createdSearchId}`);
    assert.strictEqual(verifyDelRes.status, 404);
    console.log('✅ Deleted search record verified (returned 404 as expected).');

    console.log('\n🎉 ALL SEARCH MODULE TESTS COMPLETED SUCCESSFULLY WITH 100% PASS RATE!\n');
  } catch (error) {
    console.error('\n❌ Search Test Suite Failed:', error);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await sequelize.close();
  }
};

runSearchTests();

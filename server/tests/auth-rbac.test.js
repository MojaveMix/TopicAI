import assert from 'assert';
import app from '../src/app.js';
import { initializeDatabase } from '../src/database/init.js';
import { sequelize } from '../src/config/database.js';

const PORT = 5055;
let server;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const runTests = async () => {
  console.log('\n🧪 Starting ThreatSift AI CTI & OSINT Platform Test Suite...\n');

  try {
    // 1. Initialize DB and start test server
    await initializeDatabase();
    await new Promise((resolve) => {
      server = app.listen(PORT, () => {
        console.log(`[Test Server] Listening on port ${PORT}`);
        resolve();
      });
    });

    // 2. Health check
    console.log('🔹 1. Testing Health Check & Ollama AI Status (/health)...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthJson = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthJson.data.status, 'UP');
    console.log(`✅ Health check passed. Ollama AI Engine: ${healthJson.data.aiEngine.status} (Model: ${healthJson.data.aiEngine.model})`);

    // 3. Login as Super Admin
    console.log('🔹 2. Testing Super Admin Login (/auth/login)...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@threatsift.com',
        password: 'Admin@123456'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    assert.strictEqual(adminLoginRes.status, 200);
    const superAdminToken = adminLoginData.data.tokens.accessToken;
    console.log('✅ Super Admin login verified.');

    // 4. Test OSINT Feed Sources
    console.log('🔹 3. Testing OSINT Feed Sources Listing (/feeds)...');
    const feedsRes = await fetch(`${BASE_URL}/feeds`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const feedsData = await feedsRes.json();
    assert.strictEqual(feedsRes.status, 200);
    assert(Array.isArray(feedsData.data), 'Feeds should be an array');
    assert(feedsData.data.length >= 4, 'Should contain pre-seeded OSINT feeds');
    console.log(`✅ Feeds verified (found ${feedsData.data.length} pre-configured OSINT sources).`);

    // 5. Test AI Threat Analysis & Ingestion (Ollama Qwen3:8b)
    console.log('🔹 4. Testing AI-Powered Threat Analysis & Ingestion with Qwen3:8b (/threats/analyze)...');
    const sampleThreatText = `
      CISA and FBI have released a joint advisory on BlackCat (ALPHV) ransomware group targeting healthcare and defense sectors.
      The threat actors gain initial access through spearphishing attachments (CVE-2023-38831) and deploy Cobalt Strike beacons.
      Observed Command and Control (C2) servers include IP address 198.51.100.45 and domain evil-c2-update.com.
      The ransomware payload dropped has SHA256 hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.
      Organizations must isolate infected hosts and implement MFA.
    `;

    const analyzeRes = await fetch(`${BASE_URL}/threats/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        title: 'BlackCat Ransomware Campaign Targeting Critical Infrastructure',
        content: sampleThreatText,
        sourceUrl: 'https://cisa.gov/advisory-sample-blackcat'
      })
    });

    const analyzeData = await analyzeRes.json();
    assert.strictEqual(analyzeRes.status, 201, `Failed to analyze threat: ${JSON.stringify(analyzeData)}`);
    assert(analyzeData.data.id, 'Threat ID should exist');
    assert(analyzeData.data.indicators.length > 0, 'Extracted IOCs should be present');
    console.log(`✅ AI Analysis Succeeded:`);
    console.log(`   - Threat Type: ${analyzeData.data.threatType}`);
    console.log(`   - Severity: ${analyzeData.data.severity}`);
    console.log(`   - Extracted IOCs count: ${analyzeData.data.indicators.length}`);
    console.log(`   - MITRE Tactics: ${JSON.stringify(analyzeData.data.mitreTactics)}`);
    const createdThreatId = analyzeData.data.id;

    // 6. Test Indicators (IOC) Management & Export
    console.log('🔹 5. Testing IOCs Listing & Multi-Format Export (/iocs)...');
    const iocsRes = await fetch(`${BASE_URL}/iocs`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const iocsData = await iocsRes.json();
    assert.strictEqual(iocsRes.status, 200);
    assert(iocsData.data.length > 0, 'Should have indicators from analyzed threat');
    console.log(`✅ IOCs retrieved (${iocsData.data.length} indicators found in database).`);

    // Test STIX export
    const stixExportRes = await fetch(`${BASE_URL}/iocs/export?format=stix`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert.strictEqual(stixExportRes.status, 200);
    const stixJson = await stixExportRes.json();
    assert.strictEqual(stixJson.type, 'bundle');
    console.log('✅ STIX 2.1 JSON export verified.');

    // 7. Test Actionable Intelligence Report Generation
    console.log('🔹 6. Testing Actionable Intelligence Report Generation (/reports/generate)...');
    const reportRes = await fetch(`${BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        threatId: createdThreatId,
        reportType: 'TECHNICAL_ADVISORY',
        classification: 'TLP_AMBER'
      })
    });
    const reportData = await reportRes.json();
    assert.strictEqual(reportRes.status, 201);
    assert(reportData.data.content, 'Report content should be generated');
    assert(reportData.data.stixData, 'STIX bundle should be generated');
    console.log(`✅ CTI Report Generated successfully: "${reportData.data.title}"`);

    // 8. Test OSINT On-Demand Indicator Enrichment
    console.log('🔹 7. Testing OSINT Indicator Quick Lookup (/enrichment/lookup)...');
    const lookupRes = await fetch(`${BASE_URL}/enrichment/lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        type: 'IPV4',
        value: '198.51.100.45'
      })
    });
    const lookupData = await lookupRes.json();
    assert.strictEqual(lookupRes.status, 200);
    assert(lookupData.data.aiIntelligence, 'AI enrichment verdict should be present');
    console.log(`✅ OSINT Lookup Succeeded: Verdict = ${lookupData.data.aiIntelligence.verdict}`);

    // 9. Test CTI Command Center Dashboard
    console.log('🔹 8. Testing CTI Command Center Metrics (/dashboard/overview)...');
    const dashRes = await fetch(`${BASE_URL}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    const dashData = await dashRes.json();
    assert.strictEqual(dashRes.status, 200);
    assert.strictEqual(dashData.data.summary.totalThreats >= 1, true);
    console.log('✅ Dashboard overview metrics verified:');
    console.log(`   - Total Threats: ${dashData.data.summary.totalThreats}`);
    console.log(`   - Total IOCs: ${dashData.data.summary.totalIndicators}`);
    console.log(`   - Active Alerts: ${dashData.data.summary.activeAlertsCount}`);

    console.log('\n🎉 ALL THREATSIFT CTI & OSINT TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL.\n');
  } catch (error) {
    console.error('\n❌ Test Suite Failed:', error);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await sequelize.close();
  }
};

runTests();

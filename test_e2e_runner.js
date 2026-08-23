/**
 * ============================================================================
 * 🚀 PEIDAGOGOS STEAM — AUTOMATED E2E & CONTRACT TEST RUNNER
 * ============================================================================
 * Master execution script for multi-tier requirement-driven test verification.
 * 
 * Usage:
 *   node test_e2e_runner.js
 * 
 * Features verified:
 * - R1: UI Layout Hub (#vista-cajas-hub) & "Director de Grupo" Role Checks
 * - R2: Multi-file Document Ingestion (up to 20 files, PDF, Word, PPT)
 * - R3: Dynamic AI Game Generation (10 Caja 2 games, Pre-gen modal, Group dropdown)
 * - R4: Student Inbox, Group-based Filtering & Activity Notifications
 * - T3: Cross-Feature Integration Workflows
 * - T4: Real-World Institutional Scenarios
 */

const fs = require('fs');
const path = require('path');
const { testState } = require('./tests/helpers/test_framework');

const RUNNER_START_TIME = Date.now();

console.log('\n' + '='.repeat(80));
console.log('🚀 PEIDAGOGOS STEAM — TEST RUNNER (TIERS 1-4)');
console.log('   Target: Teacher & Student Dashboard Refactor');
console.log(`   Time:   ${new Date().toISOString()}`);
console.log('='.repeat(80) + '\n');

// Load and execute all modular test suites
const testSuites = [
    { name: 'R1: UI Layout & Role Restrictions', path: './tests/test_r1_ui_roles.js' },
    { name: 'R2: Multi-file Document Ingestion', path: './tests/test_r2_multifile.js' },
    { name: 'R3: Dynamic AI Game Generation', path: './tests/test_r3_aigames.js' },
    { name: 'R4: Student Inbox & Notifications', path: './tests/test_r4_student_inbox.js' },
    { name: 'Tier 3: Cross-Feature Combinations', path: './tests/test_tier3_cross_features.js' },
    { name: 'Tier 4: Real-World Scenarios', path: './tests/test_tier4_scenarios.js' },
    { name: 'Challenger M1: UI Layout & Roles Stress', path: './tests/test_challenger_m1.js' },
    { name: 'Challenger M2: Multi-file Ingestion Boundaries', path: './tests/test_challenger_m2.js' },
    { name: 'Challenger Final: M3, M4 & 6 User Items', path: './tests/test_challenger_m3_m4_final.js' }
];

console.log('📦 Loading and executing test suites...\n');

for (const suite of testSuites) {
    try {
        const fullPath = path.resolve(__dirname, suite.path);
        if (fs.existsSync(fullPath)) {
            require(fullPath);
            console.log(`   ✓ Loaded suite: ${suite.name}`);
        } else {
            console.error(`   ✗ Suite file not found: ${suite.path}`);
        }
    } catch (err) {
        console.error(`   ✗ Error executing suite ${suite.name}:`, err);
    }
}

const totalDurationMs = Date.now() - RUNNER_START_TIME;

// Compute metrics per tier
const tierMetrics = {};
for (const s of testState.suites) {
    const tName = s.tier || 'Other';
    if (!tierMetrics[tName]) {
        tierMetrics[tName] = { total: 0, passed: 0, failed: 0, suites: [] };
    }
    tierMetrics[tName].total += s.tests.length;
    tierMetrics[tName].passed += s.passed;
    tierMetrics[tName].failed += s.failed;
    tierMetrics[tName].suites.push(s);
}

// Display Summary Table
console.log('\n' + '-'.repeat(80));
console.log('📊 TEST EXECUTION SUMMARY BY TIER');
console.log('-'.repeat(80));
console.log(
    'Tier / Category'.padEnd(42) +
    'Total'.padEnd(10) +
    'Passed'.padEnd(10) +
    'Failed'.padEnd(10) +
    'Rate'
);
console.log('-'.repeat(80));

for (const [tierName, stats] of Object.entries(tierMetrics)) {
    const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) + '%' : '0%';
    console.log(
        tierName.padEnd(42) +
        String(stats.total).padEnd(10) +
        String(stats.passed).padEnd(10) +
        String(stats.failed).padEnd(10) +
        rate
    );
}

console.log('-'.repeat(80));
console.log(
    'TOTAL'.padEnd(42) +
    String(testState.totalTests).padEnd(10) +
    String(testState.passed).padEnd(10) +
    String(testState.failed).padEnd(10) +
    (testState.totalTests > 0 ? ((testState.passed / testState.totalTests) * 100).toFixed(1) + '%' : '0%')
);
console.log('-'.repeat(80));
console.log(`⏱ Total Duration: ${totalDurationMs} ms\n`);

// Display Failed Tests if any
if (testState.failed > 0) {
    console.log('❌ FAILED TESTS:');
    for (const s of testState.suites) {
        for (const t of s.tests) {
            if (t.status === 'FAILED') {
                console.log(`   - [${t.tier}] ${s.name} -> ${t.name}`);
                console.log(`     Error: ${t.error}\n`);
            }
        }
    }
} else {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! (100% Pass Rate)');
}
console.log('='.repeat(80) + '\n');

// Write test results to JSON file
const resultsReport = {
    timestamp: new Date().toISOString(),
    durationMs: totalDurationMs,
    totalTests: testState.totalTests,
    passed: testState.passed,
    failed: testState.failed,
    tierBreakdown: tierMetrics,
    suites: testState.suites
};

const resultsPath = path.join(__dirname, 'test_results.json');
fs.writeFileSync(resultsPath, JSON.stringify(resultsReport, null, 2), 'utf8');
console.log(`📄 Machine-readable results saved to: ${resultsPath}\n`);

// Export for programmatic integration
module.exports = {
    testState,
    tierMetrics,
    resultsReport
};

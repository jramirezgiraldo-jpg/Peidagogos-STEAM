/**
 * Direct execution wrapper for test suites
 */
const path = require('path');
const runner = require('../test_e2e_runner.js');

console.log("\n==========================================");
console.log("TEST RUNNER EXECUTION COMPLETE");
console.log(`Total tests: ${runner.testState.totalTests}`);
console.log(`Passed: ${runner.testState.passed}`);
console.log(`Failed: ${runner.testState.failed}`);
console.log("==========================================\n");

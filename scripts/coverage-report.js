#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Generating comprehensive coverage report...\n');

// Run frontend coverage
console.log('📊 Running frontend tests with coverage...');
try {
  execSync('npm run test:coverage', { stdio: 'inherit' });
  console.log('✅ Frontend coverage completed\n');
} catch (error) {
  console.error('❌ Frontend coverage failed:', error.message);
  process.exit(1);
}

// Run backend coverage
console.log('📊 Running backend tests with coverage...');
try {
  execSync('npm run test:backend:coverage', { stdio: 'inherit' });
  console.log('✅ Backend coverage completed\n');
} catch (error) {
  console.error('❌ Backend coverage failed:', error.message);
  process.exit(1);
}

// Check if coverage files exist
const frontendCoverage = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
const backendCoverage = path.join(__dirname, '..', 'backend', 'coverage', 'coverage-summary.json');

if (fs.existsSync(frontendCoverage) && fs.existsSync(backendCoverage)) {
  console.log('📈 Coverage Summary:');
  console.log('==================');
  
  // Read and display frontend coverage
  const frontendData = JSON.parse(fs.readFileSync(frontendCoverage, 'utf8'));
  console.log('\n🎨 Frontend Coverage:');
  console.log(`  Lines:      ${frontendData.total.lines.pct}%`);
  console.log(`  Functions:  ${frontendData.total.functions.pct}%`);
  console.log(`  Branches:   ${frontendData.total.branches.pct}%`);
  console.log(`  Statements: ${frontendData.total.statements.pct}%`);
  
  // Read and display backend coverage
  const backendData = JSON.parse(fs.readFileSync(backendCoverage, 'utf8'));
  console.log('\n⚙️  Backend Coverage:');
  console.log(`  Lines:      ${backendData.total.lines.pct}%`);
  console.log(`  Functions:  ${backendData.total.functions.pct}%`);
  console.log(`  Branches:   ${backendData.total.branches.pct}%`);
  console.log(`  Statements: ${backendData.total.statements.pct}%`);
  
  // Calculate combined coverage
  const combined = {
    lines: (frontendData.total.lines.pct + backendData.total.lines.pct) / 2,
    functions: (frontendData.total.functions.pct + backendData.total.functions.pct) / 2,
    branches: (frontendData.total.branches.pct + backendData.total.branches.pct) / 2,
    statements: (frontendData.total.statements.pct + backendData.total.statements.pct) / 2,
  };
  
  console.log('\n📊 Combined Coverage:');
  console.log(`  Lines:      ${combined.lines.toFixed(2)}%`);
  console.log(`  Functions:  ${combined.functions.toFixed(2)}%`);
  console.log(`  Branches:   ${combined.branches.toFixed(2)}%`);
  console.log(`  Statements: ${combined.statements.toFixed(2)}%`);
  
  // Check if thresholds are met
  const thresholds = { lines: 80, functions: 80, branches: 80, statements: 80 };
  const passed = Object.keys(thresholds).every(key => combined[key] >= thresholds[key]);
  
  console.log('\n🎯 Threshold Check:');
  console.log(`  Target: 80% for all metrics`);
  console.log(`  Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!passed) {
    console.log('\n⚠️  Some coverage thresholds are not met. Consider adding more tests.');
    process.exit(1);
  }
  
  console.log('\n📁 Coverage reports generated:');
  console.log(`  Frontend: ./coverage/index.html`);
  console.log(`  Backend:  ./backend/coverage/lcov-report/index.html`);
  
} else {
  console.log('⚠️  Coverage summary files not found. Check test execution.');
}

console.log('\n✨ Coverage report generation completed!');
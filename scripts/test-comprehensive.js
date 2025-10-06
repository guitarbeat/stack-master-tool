#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// * Configuration
const config = {
  testTypes: {
    unit: {
      command: 'npm run test:run',
      description: 'Unit Tests',
      timeout: 60000, // 1 minute
    },
    backend: {
      command: 'npm run test:backend',
      description: 'Backend Tests',
      timeout: 30000, // 30 seconds
    },
    e2e: {
      command: 'npm run test:e2e',
      description: 'E2E Tests',
      timeout: 300000, // 5 minutes
    },
  },
  outputDir: './test-results',
  reportFile: './test-results/comprehensive-report.json',
};

// * Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// * Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// * Test execution function
async function runTest(testType, testConfig) {
  const startTime = Date.now();
  logInfo(`Starting ${testConfig.description}...`);
  
  try {
    const result = execSync(testConfig.command, {
      encoding: 'utf8',
      timeout: testConfig.timeout,
      stdio: 'pipe',
    });
    
    const duration = Date.now() - startTime;
    logSuccess(`${testConfig.description} completed in ${(duration / 1000).toFixed(2)}s`);
    
    return {
      type: testType,
      status: 'passed',
      duration,
      output: result,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`${testConfig.description} failed after ${(duration / 1000).toFixed(2)}s`);
    
    return {
      type: testType,
      status: 'failed',
      duration,
      output: error.stdout || error.message,
      error: error.stderr || error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// * Coverage analysis
function analyzeCoverage() {
  try {
    const coveragePath = './coverage/coverage-final.json';
    if (fs.existsSync(coveragePath)) {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      
      let totalLines = 0;
      let coveredLines = 0;
      let totalFunctions = 0;
      let coveredFunctions = 0;
      let totalBranches = 0;
      let coveredBranches = 0;
      
      Object.values(coverage).forEach(file => {
        if (file.s) {
          totalLines += Object.keys(file.s).length;
          coveredLines += Object.values(file.s).filter(count => count > 0).length;
        }
        if (file.f) {
          totalFunctions += Object.keys(file.f).length;
          coveredFunctions += Object.values(file.f).filter(count => count > 0).length;
        }
        if (file.b) {
          totalBranches += Object.keys(file.b).length;
          coveredBranches += Object.values(file.b).filter(count => count > 0).length;
        }
      });
      
      const lineCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
      const functionCoverage = totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;
      const branchCoverage = totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;
      
      return {
        lines: { covered: coveredLines, total: totalLines, percentage: lineCoverage },
        functions: { covered: coveredFunctions, total: totalFunctions, percentage: functionCoverage },
        branches: { covered: coveredBranches, total: totalBranches, percentage: branchCoverage },
      };
    }
  } catch (error) {
    logWarning('Could not analyze coverage: ' + error.message);
  }
  
  return null;
}

// * Generate comprehensive report
function generateReport(results, coverage) {
  const report = {
    summary: {
      totalTests: results.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'failed').length,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
      timestamp: new Date().toISOString(),
    },
    results,
    coverage,
    recommendations: [],
  };
  
  // * Generate recommendations
  if (report.summary.failed > 0) {
    report.recommendations.push('Fix failing tests before deployment');
  }
  
  if (coverage && coverage.lines.percentage < 80) {
    report.recommendations.push(`Increase test coverage (currently ${coverage.lines.percentage.toFixed(1)}%)`);
  }
  
  if (report.summary.totalDuration > 300000) { // 5 minutes
    report.recommendations.push('Consider optimizing test performance');
  }
  
  const failedTests = results.filter(r => r.status === 'failed');
  if (failedTests.length > 0) {
    report.recommendations.push(`Review ${failedTests.length} failed test(s) for potential issues`);
  }
  
  return report;
}

// * Main execution function
async function main() {
  logSection('Comprehensive Test Suite');
  
  // * Create output directory
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  const results = [];
  const startTime = Date.now();
  
  // * Run all test types
  for (const [testType, testConfig] of Object.entries(config.testTypes)) {
    const result = await runTest(testType, testConfig);
    results.push(result);
  }
  
  // * Analyze coverage
  logInfo('Analyzing test coverage...');
  const coverage = analyzeCoverage();
  
  // * Generate report
  const report = generateReport(results, coverage);
  
  // * Save report
  fs.writeFileSync(config.reportFile, JSON.stringify(report, null, 2));
  
  // * Display summary
  logSection('Test Summary');
  
  results.forEach(result => {
    const status = result.status === 'passed' ? '✅' : '❌';
    const duration = (result.duration / 1000).toFixed(2);
    log(`${status} ${result.type}: ${result.status} (${duration}s)`);
  });
  
  if (coverage) {
    logSection('Coverage Summary');
    log(`Lines: ${coverage.lines.covered}/${coverage.lines.total} (${coverage.lines.percentage.toFixed(1)}%)`);
    log(`Functions: ${coverage.functions.covered}/${coverage.functions.total} (${coverage.functions.percentage.toFixed(1)}%)`);
    log(`Branches: ${coverage.branches.covered}/${coverage.branches.total} (${coverage.branches.percentage.toFixed(1)}%)`);
  }
  
  const totalDuration = (Date.now() - startTime) / 1000;
  logSection('Final Results');
  log(`Total execution time: ${totalDuration.toFixed(2)}s`);
  log(`Report saved to: ${config.reportFile}`);
  
  if (report.recommendations.length > 0) {
    logSection('Recommendations');
    report.recommendations.forEach(rec => logWarning(rec));
  }
  
  // * Exit with appropriate code
  const hasFailures = results.some(r => r.status === 'failed');
  if (hasFailures) {
    logError('Some tests failed. Check the report for details.');
    process.exit(1);
  } else {
    logSuccess('All tests passed! 🎉');
    process.exit(0);
  }
}

// * Handle errors
process.on('unhandledRejection', (error) => {
  logError('Unhandled rejection: ' + error.message);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError('Uncaught exception: ' + error.message);
  process.exit(1);
});

// * Run the main function
main().catch(error => {
  logError('Test execution failed: ' + error.message);
  process.exit(1);
});
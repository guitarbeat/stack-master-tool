#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, cwd = process.cwd()) {
  try {
    log(`\n${colors.cyan}Running: ${command}${colors.reset}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    return true;
  } catch (error) {
    log(`\n${colors.red}Command failed: ${command}${colors.reset}`);
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  log(`${colors.bright}${colors.blue}🧪 Test Runner${colors.reset}\n`);

  let success = true;

  switch (command) {
    case 'frontend':
      log(`${colors.yellow}Running Frontend Tests...${colors.reset}`);
      success = runCommand('npm run test:run');
      break;

    case 'backend':
      log(`${colors.yellow}Running Backend Tests...${colors.reset}`);
      success = runCommand('npm run test:backend');
      break;

    case 'e2e':
      log(`${colors.yellow}Running E2E Tests...${colors.reset}`);
      success = runCommand('npm run test:e2e');
      break;

    case 'coverage':
      log(`${colors.yellow}Running Tests with Coverage...${colors.reset}`);
      success = runCommand('npm run test:coverage') && 
                runCommand('npm run test:backend:coverage');
      break;

    case 'watch':
      log(`${colors.yellow}Running Tests in Watch Mode...${colors.reset}`);
      log(`${colors.cyan}Starting frontend tests in watch mode...${colors.reset}`);
      runCommand('npm run test:watch');
      break;

    case 'ci':
      log(`${colors.yellow}Running CI Tests...${colors.reset}`);
      success = runCommand('npm run test:ci');
      break;

    case 'all':
    default:
      log(`${colors.yellow}Running All Tests...${colors.reset}`);
      
      // Run frontend tests
      log(`${colors.cyan}1/3 Frontend Tests${colors.reset}`);
      if (!runCommand('npm run test:run')) {
        success = false;
        break;
      }

      // Run backend tests
      log(`${colors.cyan}2/3 Backend Tests${colors.reset}`);
      if (!runCommand('npm run test:backend')) {
        success = false;
        break;
      }

      // Run E2E tests
      log(`${colors.cyan}3/3 E2E Tests${colors.reset}`);
      if (!runCommand('npm run test:e2e')) {
        success = false;
        break;
      }
      break;
  }

  if (success) {
    log(`\n${colors.green}✅ All tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    log(`\n${colors.red}❌ Some tests failed!${colors.reset}`);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log(`\n${colors.yellow}Test runner interrupted${colors.reset}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  log(`\n${colors.yellow}Test runner terminated${colors.reset}`);
  process.exit(1);
});

main();
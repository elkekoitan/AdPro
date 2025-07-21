/**
 * E2E Test Runner Script
 * 
 * This script provides a convenient way to run E2E tests with various options.
 * 
 * Usage:
 *   node e2e/run-tests.js [options]
 * 
 * Options:
 *   --platform=ios|android  Specify the platform to test (default: ios)
 *   --debug                 Run in debug mode
 *   --file=<filename>       Run specific test file
 *   --test=<testname>       Run specific test by name
 *   --reuse                 Reuse existing app instance
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  platform: 'ios',
  debug: false,
  file: null,
  test: null,
  reuse: false,
};

args.forEach(arg => {
  if (arg.startsWith('--platform=')) {
    options.platform = arg.split('=')[1];
  } else if (arg === '--debug') {
    options.debug = true;
  } else if (arg.startsWith('--file=')) {
    options.file = arg.split('=')[1];
  } else if (arg.startsWith('--test=')) {
    options.test = arg.split('=')[1];
  } else if (arg === '--reuse') {
    options.reuse = true;
  }
});

// Validate platform
if (!['ios', 'android'].includes(options.platform)) {
  console.error('Error: Platform must be either "ios" or "android"');
  process.exit(1);
}

// Determine configuration
const configuration = options.platform === 'ios' 
  ? 'ios.sim.debug' 
  : 'android.emu.debug';

// Build command
let command = `detox test --configuration ${configuration}`;

// Add file filter if specified
if (options.file) {
  const filePath = path.resolve(__dirname, 'tests', options.file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Test file not found: ${filePath}`);
    process.exit(1);
  }
  command += ` --testMatch="${filePath}"`;
}

// Add test name filter if specified
if (options.test) {
  command += ` --testNamePattern="${options.test}"`;
}

// Add debug flag if specified
if (options.debug) {
  command += ' --loglevel trace';
}

// Add reuse flag if specified
if (options.reuse) {
  command += ' --reuse';
}

// Print command
console.log(`Running: ${command}`);

// Create results directory if it doesn't exist
const resultsDir = path.resolve(__dirname, 'results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

// Run command
try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Tests failed with error:', error.message);
  process.exit(1);
}
/**
 * Bundle Size Analyzer Script
 * 
 * This script analyzes the bundle size and provides optimization suggestions.
 * It should be run after building the app.
 * 
 * Usage:
 *   node scripts/analyze-bundle.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const chalk = require('chalk');

// Configuration
const config = {
  bundleDir: path.resolve(__dirname, '../android/app/build/generated/assets/react/release'),
  thresholds: {
    totalSize: 5 * 1024 * 1024, // 5MB
    moduleSize: 500 * 1024, // 500KB
    chunkSize: 1024 * 1024, // 1MB
  },
};

// Format size in bytes to a human-readable string
function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// Analyze bundle size
async function analyzeBundleSize() {
  console.log(chalk.blue('📦 Analyzing bundle size...'));
  
  try {
    // Check if bundle directory exists
    if (!fs.existsSync(config.bundleDir)) {
      console.error(chalk.red(`Bundle directory not found: ${config.bundleDir}`));
      console.log(chalk.yellow('Make sure you have built the app before running this script.'));
      return;
    }
    
    // Find bundle files
    const files = fs.readdirSync(config.bundleDir).filter(file => file.endsWith('.bundle'));
    
    if (files.length === 0) {
      console.error(chalk.red('No bundle files found.'));
      return;
    }
    
    // Analyze each bundle file
    for (const file of files) {
      const filePath = path.join(config.bundleDir, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath);
      const gzippedContent = zlib.gzipSync(content);
      
      console.log(chalk.green(`\nBundle: ${file}`));
      console.log(`Size: ${formatSize(stats.size)}`);
      console.log(`Gzipped size: ${formatSize(gzippedContent.length)}`);
      
      // Check if bundle size exceeds threshold
      if (stats.size > config.thresholds.totalSize) {
        console.log(chalk.red(`⚠️ Bundle size exceeds threshold of ${formatSize(config.thresholds.totalSize)}`));
      } else {
        console.log(chalk.green(`✅ Bundle size is within threshold of ${formatSize(config.thresholds.totalSize)}`));
      }
      
      // Generate optimization suggestions
      generateOptimizationSuggestions(stats.size);
    }
  } catch (error) {
    console.error(chalk.red('Error analyzing bundle size:'), error);
  }
}

// Generate optimization suggestions
function generateOptimizationSuggestions(bundleSize) {
  console.log(chalk.blue('\n📋 Optimization suggestions:'));
  
  const suggestions = [];
  
  // Check total bundle size
  if (bundleSize > config.thresholds.totalSize) {
    suggestions.push(`Reduce total bundle size (current: ${formatSize(bundleSize)})`);
  }
  
  // Add general suggestions
  suggestions.push('Enable code splitting and lazy loading for non-critical components');
  suggestions.push('Use dynamic imports for routes that are not immediately needed');
  suggestions.push('Implement tree shaking to remove unused code');
  suggestions.push('Optimize and compress images and assets');
  suggestions.push('Use individual lodash imports instead of the entire library');
  suggestions.push('Consider replacing moment.js with a lighter alternative like date-fns');
  suggestions.push('Use a more efficient icon system or load icons dynamically');
  
  // Print suggestions
  suggestions.forEach(suggestion => {
    console.log(chalk.yellow(`- ${suggestion}`));
  });
  
  // Print next steps
  console.log(chalk.blue('\n🔍 For detailed analysis:'));
  console.log('- Run "npx react-native-bundle-visualizer" for a visual breakdown');
  console.log('- Use "npx react-native-bundle-analyzer" to analyze specific imports');
  console.log('- Check "npx react-native info" for potential duplicate dependencies');
}

// Run the analysis
analyzeBundleSize();
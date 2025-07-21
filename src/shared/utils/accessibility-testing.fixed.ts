/**
 * Accessibility Testing Utilities
 * 
 * This file contains utilities for testing accessibility features.
 */

import { AccessibilityInfo } from 'react-native';
import { Logger } from './debug-helpers';

/**
 * Accessibility test result
 */
interface AccessibilityTestResult {
  passed: boolean;
  issues: AccessibilityIssue[];
}

/**
 * Accessibility issue
 */
interface AccessibilityIssue {
  type: 'error' | 'warning';
  message: string;
  element?: string;
  fix?: string;
}

/**
 * Accessibility test options
 */
interface AccessibilityTestOptions {
  checkLabels?: boolean;
  checkContrast?: boolean;
  checkTouchableSize?: boolean;
  checkFontSize?: boolean;
}

/**
 * Default accessibility test options
 */
const defaultTestOptions: AccessibilityTestOptions = {
  checkLabels: true,
  checkContrast: true,
  checkTouchableSize: true,
  checkFontSize: true,
};

/**
 * Test accessibility labels
 */
export const testAccessibilityLabels = async (
  elements: Array<{
    testID: string;
    accessibilityLabel?: string;
    accessibilityRole?: string;
  }>
): Promise<AccessibilityIssue[]> => {
  const issues: AccessibilityIssue[] = [];
  
  for (const element of elements) {
    if (!element.accessibilityLabel) {
      issues.push({
        type: 'error',
        message: `Missing accessibility label for element with testID: ${element.testID}`,
        element: element.testID,
        fix: 'Add an accessibilityLabel prop to the element',
      });
    } else if (element.accessibilityLabel.length < 3) {
      issues.push({
        type: 'warning',
        message: `Accessibility label is too short for element with testID: ${element.testID}`,
        element: element.testID,
        fix: 'Use a more descriptive accessibility label',
      });
    }
    
    if (!element.accessibilityRole) {
      issues.push({
        type: 'warning',
        message: `Missing accessibility role for element with testID: ${element.testID}`,
        element: element.testID,
        fix: 'Add an accessibilityRole prop to the element',
      });
    }
  }
  
  return issues;
};

/**
 * Test color contrast
 */
export const testColorContrast = (
  foregroundColor: string,
  backgroundColor: string
): { passed: boolean; ratio: number; requiredRatio: number } => {
  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const formattedHex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
    
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };
  
  // Calculate relative luminance
  const calculateLuminance = (color: { r: number; g: number; b: number }) => {
    const { r, g, b } = color;
    
    const rsrgb = r / 255;
    const gsrgb = g / 255;
    const bsrgb = b / 255;
    
    const r1 = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
    const g1 = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
    const b1 = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
    
    return 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
  };
  
  // Calculate contrast ratio
  const calculateContrastRatio = (l1: number, l2: number) => {
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  
  const fgRgb = hexToRgb(foregroundColor);
  const bgRgb = hexToRgb(backgroundColor);
  
  const fgLuminance = calculateLuminance(fgRgb);
  const bgLuminance = calculateLuminance(bgRgb);
  
  const ratio = calculateContrastRatio(fgLuminance, bgLuminance);
  const requiredRatio = 4.5; // WCAG AA standard for normal text
  
  return {
    passed: ratio >= requiredRatio,
    ratio,
    requiredRatio,
  };
};

/**
 * Test touchable element size
 */
export const testTouchableSize = (
  width: number,
  height: number
): { passed: boolean; minSize: number } => {
  const minSize = 44; // Minimum size in points (44x44 is the recommended minimum)
  
  return {
    passed: width >= minSize && height >= minSize,
    minSize,
  };
};

/**
 * Test font size
 */
export const testFontSize = (
  fontSize: number
): { passed: boolean; minSize: number } => {
  const minSize = 16; // Minimum font size in points
  
  return {
    passed: fontSize >= minSize,
    minSize,
  };
};

/**
 * Run accessibility tests
 */
export const runAccessibilityTests = async (
  elements: Array<{
    testID: string;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    foregroundColor?: string;
    backgroundColor?: string;
    width?: number;
    height?: number;
    fontSize?: number;
  }>,
  options: AccessibilityTestOptions = defaultTestOptions
): Promise<AccessibilityTestResult> => {
  const issues: AccessibilityIssue[] = [];
  
  // Test accessibility labels
  if (options.checkLabels) {
    const labelIssues = await testAccessibilityLabels(elements);
    issues.push(...labelIssues);
  }
  
  // Test color contrast
  if (options.checkContrast) {
    for (const element of elements) {
      if (element.foregroundColor && element.backgroundColor) {
        const contrastResult = testColorContrast(
          element.foregroundColor,
          element.backgroundColor
        );
        
        if (!contrastResult.passed) {
          issues.push({
            type: 'error',
            message: `Insufficient color contrast (${contrastResult.ratio.toFixed(2)}) for element with testID: ${element.testID}. Required: ${contrastResult.requiredRatio}`,
            element: element.testID,
            fix: 'Increase the contrast between foreground and background colors',
          });
        }
      }
    }
  }
  
  // Test touchable size
  if (options.checkTouchableSize) {
    for (const element of elements) {
      if (
        element.accessibilityRole === 'button' &&
        element.width !== undefined &&
        element.height !== undefined
      ) {
        const sizeResult = testTouchableSize(element.width, element.height);
        
        if (!sizeResult.passed) {
          issues.push({
            type: 'warning',
            message: `Touchable element with testID: ${element.testID} is too small (${element.width}x${element.height}). Minimum size: ${sizeResult.minSize}x${sizeResult.minSize}`,
            element: element.testID,
            fix: `Increase the size to at least ${sizeResult.minSize}x${sizeResult.minSize}`,
          });
        }
      }
    }
  }
  
  // Test font size
  if (options.checkFontSize) {
    for (const element of elements) {
      if (element.fontSize !== undefined) {
        const fontSizeResult = testFontSize(element.fontSize);
        
        if (!fontSizeResult.passed) {
          issues.push({
            type: 'warning',
            message: `Font size for element with testID: ${element.testID} is too small (${element.fontSize}). Minimum size: ${fontSizeResult.minSize}`,
            element: element.testID,
            fix: `Increase the font size to at least ${fontSizeResult.minSize}`,
          });
        }
      }
    }
  }
  
  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    Logger.error('Accessibility', 'Failed to check screen reader status', error);
    return false;
  }
};

/**
 * Generate accessibility test report
 */
export const generateAccessibilityReport = (
  result: AccessibilityTestResult
): string => {
  let report = '# Accessibility Test Report\n\n';
  
  if (result.passed) {
    report += '✅ All accessibility tests passed!\n\n';
  } else {
    report += `❌ Found ${result.issues.length} accessibility issues:\n\n`;
    
    // Group issues by type
    const errors = result.issues.filter(issue => issue.type === 'error');
    const warnings = result.issues.filter(issue => issue.type === 'warning');
    
    if (errors.length > 0) {
      report += `## Errors (${errors.length})\n\n`;
      
      errors.forEach((issue, index) => {
        report += `${index + 1}. ${issue.message}\n`;
        if (issue.fix) {
          report += `   - Fix: ${issue.fix}\n`;
        }
        report += '\n';
      });
    }
    
    if (warnings.length > 0) {
      report += `## Warnings (${warnings.length})\n\n`;
      
      warnings.forEach((issue, index) => {
        report += `${index + 1}. ${issue.message}\n`;
        if (issue.fix) {
          report += `   - Fix: ${issue.fix}\n`;
        }
        report += '\n';
      });
    }
  }
  
  return report;
};

// Export the AccessibilityTesting namespace for easier imports
export const AccessibilityTesting = {
  testAccessibilityLabels,
  testColorContrast,
  testTouchableSize,
  testFontSize,
  runAccessibilityTests,
  isScreenReaderEnabled,
  generateAccessibilityReport,
  
  // Helper function for component testing
  testComponent: async (component: any): Promise<AccessibilityTestResult> => {
    // In a real implementation, this would extract accessibility properties from the component
    // For now, we'll return a mock result
    return {
      passed: true,
      issues: [],
    };
  }
};
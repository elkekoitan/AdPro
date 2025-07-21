/**
 * Accessibility Hook
 * 
 * This hook provides accessibility utilities for components.
 */

import { useCallback } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Accessibility props for elements
 */
interface AccessibilityProps {
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'header' | 'link' | 'text' | 'image' | 'search' | 'summary' | 'none';
  accessible: boolean;
}

/**
 * Button accessibility props
 */
interface ButtonAccessibilityProps extends AccessibilityProps {
  accessibilityRole: 'button';
}

/**
 * Header accessibility props
 */
interface HeaderAccessibilityProps extends AccessibilityProps {
  accessibilityRole: 'header';
}

/**
 * Accessibility hook
 */
export const useAccessibility = () => {
  /**
   * Check if screen reader is enabled
   */
  const isScreenReaderEnabled = useCallback(async (): Promise<boolean> => {
    try {
      return await AccessibilityInfo.isScreenReaderEnabled();
    } catch (error) {
      console.error('Failed to check screen reader status', error);
      return false;
    }
  }, []);

  /**
   * Get accessibility props for a button
   */
  const getButtonProps = useCallback((label: string, hint?: string): ButtonAccessibilityProps => {
    return {
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: 'button',
      accessible: true,
    };
  }, []);

  /**
   * Get accessibility props for a header
   */
  const getHeaderProps = useCallback((label: string): HeaderAccessibilityProps => {
    return {
      accessibilityLabel: label,
      accessibilityRole: 'header',
      accessible: true,
    };
  }, []);

  /**
   * Announce a message to screen readers
   */
  const announceForAccessibility = useCallback((message: string): void => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  return {
    isScreenReaderEnabled,
    getButtonProps,
    getHeaderProps,
    announceForAccessibility,
  };
};

export default useAccessibility;
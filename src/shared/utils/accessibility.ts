/**
 * Accessibility Utilities
 * 
 * This file contains utilities for implementing and testing accessibility features.
 */

import { AccessibilityInfo, Platform } from 'react-native';
import { Logger } from './debug-helpers';

/**
 * Accessibility state
 */
interface AccessibilityState {
  screenReaderEnabled: boolean;
  reduceMotionEnabled: boolean;
  reduceTransparencyEnabled: boolean;
  boldTextEnabled: boolean;
  grayscaleEnabled: boolean;
  invertColorsEnabled: boolean;
  reduceMotionEnabled: boolean;
}

/**
 * Default accessibility state
 */
const defaultAccessibilityState: AccessibilityState = {
  screenReaderEnabled: false,
  reduceMotionEnabled: false,
  reduceTransparencyEnabled: false,
  boldTextEnabled: false,
  grayscaleEnabled: false,
  invertColorsEnabled: false,
  reduceMotionEnabled: false,
};

/**
 * Accessibility manager
 */
class AccessibilityManager {
  private static instance: AccessibilityManager;
  private state: AccessibilityState = { ...defaultAccessibilityState };
  private listeners: Array<(state: AccessibilityState) => void> = [];
  
  private constructor() {
    this.initAccessibilityInfo();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }
  
  /**
   * Initialize accessibility info
   */
  private async initAccessibilityInfo(): Promise<void> {
    try {
      // Get initial accessibility state
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      
      // Set initial state
      this.updateState({
        screenReaderEnabled,
        reduceMotionEnabled: await this.isReduceMotionEnabled(),
        reduceTransparencyEnabled: await this.isReduceTransparencyEnabled(),
        boldTextEnabled: await this.isBoldTextEnabled(),
        grayscaleEnabled: await this.isGrayscaleEnabled(),
        invertColorsEnabled: await this.isInvertColorsEnabled(),
      });
      
      // Add event listeners
      this.addEventListeners();
      
      Logger.info('Accessibility', 'Accessibility manager initialized');
    } catch (error) {
      Logger.error('Accessibility', 'Failed to initialize accessibility manager', error);
    }
  }
  
  /**
   * Add event listeners for accessibility changes
   */
  private addEventListeners(): void {
    // Screen reader
    AccessibilityInfo.addEventListener('screenReaderChanged', screenReaderEnabled => {
      this.updateState({ screenReaderEnabled });
      Logger.debug('Accessibility', `Screen reader ${screenReaderEnabled ? 'enabled' : 'disabled'}`);
    });
    
    // Reduce motion
    if (Platform.OS === 'ios') {
      AccessibilityInfo.addEventListener('reduceMotionChanged', reduceMotionEnabled => {
        this.updateState({ reduceMotionEnabled });
        Logger.debug('Accessibility', `Reduce motion ${reduceMotionEnabled ? 'enabled' : 'disabled'}`);
      });
    }
  }
  
  /**
   * Update accessibility state
   */
  private updateState(newState: Partial<AccessibilityState>): void {
    this.state = { ...this.state, ...newState };
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Notify listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        Logger.error('Accessibility', 'Error in accessibility listener', error);
      }
    });
  }
  
  /**
   * Check if reduce motion is enabled
   */
  private async isReduceMotionEnabled(): Promise<boolean> {
    try {
      return await AccessibilityInfo.isReduceMotionEnabled();
    } catch (error) {
      Logger.error('Accessibility', 'Failed to check reduce motion', error);
      return false;
    }
  }
  
  /**
   * Check if reduce transparency is enabled
   */
  private async isReduceTransparencyEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await AccessibilityInfo.isReduceTransparencyEnabled();
      }
      return false;
    } catch (error) {
      Logger.error('Accessibility', 'Failed to check reduce transparency', error);
      return false;
    }
  }
  
  /**
   * Check if bold text is enabled
   */
  private async isBoldTextEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios' && AccessibilityInfo.isBoldTextEnabled) {
        return await AccessibilityInfo.isBoldTextEnabled();
      }
      return false;
    } catch (error) {
      Logger.error('Accessibility', 'Failed to check bold text', error);
      return false;
    }
  }
  
  /**
   * Check if grayscale is enabled
   */
  private async isGrayscaleEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios' && AccessibilityInfo.isGrayscaleEnabled) {
        return await AccessibilityInfo.isGrayscaleEnabled();
      }
      return false;
    } catch (error) {
      Logger.error('Accessibility', 'Failed to check grayscale', error);
      return false;
    }
  }
  
  /**
   * Check if invert colors is enabled
   */
  private async isInvertColorsEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios' && AccessibilityInfo.isInvertColorsEnabled) {
        return await AccessibilityInfo.isInvertColorsEnabled();
      }
      return false;
    } catch (error) {
      Logger.error('Accessibility', 'Failed to check invert colors', error);
      return false;
    }
  }
  
  /**
   * Get current accessibility state
   */
  public getState(): AccessibilityState {
    return { ...this.state };
  }
  
  /**
   * Add accessibility state listener
   */
  public addListener(
    listener: (state: AccessibilityState) => void
  ): () => void {
    this.listeners.push(listener);
    
    // Immediately notify the new listener of the current state
    try {
      listener(this.state);
    } catch (error) {
      Logger.error('Accessibility', 'Error in accessibility listener', error);
    }
    
    // Return function to remove listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Announce a message to screen readers
   */
  public announceForAccessibility(message: string): void {
    if (!message) return;
    
    try {
      AccessibilityInfo.announceForAccessibility(message);
      Logger.debug('Accessibility', `Announced: ${message}`);
    } catch (error) {
      Logger.error('Accessibility', 'Failed to announce message', error);
    }
  }
  
  /**
   * Check if screen reader is enabled
   */
  public isScreenReaderEnabled(): boolean {
    return this.state.screenReaderEnabled;
  }
  
  /**
   * Check if reduce motion is enabled
   */
  public isReduceMotionEnabled(): boolean {
    return this.state.reduceMotionEnabled;
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.listeners = [];
  }
}

/**
 * Initialize accessibility manager
 */
export const initializeAccessibility = (): void => {
  AccessibilityManager.getInstance();
};

/**
 * Get current accessibility state
 */
export const getAccessibilityState = (): AccessibilityState => {
  return AccessibilityManager.getInstance().getState();
};

/**
 * Add accessibility state listener
 */
export const addAccessibilityListener = (
  listener: (state: AccessibilityState) => void
): (() => void) => {
  return AccessibilityManager.getInstance().addListener(listener);
};

/**
 * Announce a message to screen readers
 */
export const announceForAccessibility = (message: string): void => {
  AccessibilityManager.getInstance().announceForAccessibility(message);
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = (): boolean => {
  return AccessibilityManager.getInstance().isScreenReaderEnabled();
};

/**
 * Check if reduce motion is enabled
 */
export const isReduceMotionEnabled = (): boolean => {
  return AccessibilityManager.getInstance().isReduceMotionEnabled();
};

/**
 * Clean up accessibility manager
 */
export const cleanupAccessibility = (): void => {
  AccessibilityManager.getInstance().cleanup();
};

/**
 * Generate accessibility props for a component
 */
export const getAccessibilityProps = (
  label: string,
  hint?: string,
  role?: 'none' | 'button' | 'link' | 'search' | 'image' | 'text' | 'adjustable' | 'header' | 'summary' | 'imagebutton'
): Record<string, any> => {
  const props: Record<string, any> = {
    accessible: true,
    accessibilityLabel: label,
  };
  
  if (hint) {
    props.accessibilityHint = hint;
  }
  
  if (role) {
    props.accessibilityRole = role;
  }
  
  return props;
};

/**
 * Generate accessibility state props for a component
 */
export const getAccessibilityStateProps = (
  state: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  }
): Record<string, any> => {
  return {
    accessibilityState: state,
  };
};
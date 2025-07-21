/**
 * Test utilities for E2E testing
 * 
 * This file contains utility functions for E2E tests.
 */

import { device, element, by, expect, waitFor } from 'detox';
import { SCREEN_IDS, BUTTON_IDS, INPUT_IDS } from './test-ids';
import { MOCK_USERS } from './mock-data';

/**
 * Wait for a specified time
 */
export const wait = async (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Take a screenshot with a timestamp
 */
export const takeScreenshot = async (name: string): Promise<void> => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await device.takeScreenshot(`${name}-${timestamp}`);
};

/**
 * Login with the default test user
 */
export const loginWithTestUser = async (): Promise<void> => {
  await device.reloadReactNative();
  
  // Navigate to login screen
  await waitFor(element(by.id(SCREEN_IDS.WELCOME_SCREEN))).toBeVisible().withTimeout(5000);
  await element(by.id(BUTTON_IDS.LOGIN_BUTTON)).tap();
  
  // Fill login form
  await waitFor(element(by.id(SCREEN_IDS.LOGIN_SCREEN))).toBeVisible().withTimeout(5000);
  await element(by.id(INPUT_IDS.EMAIL_INPUT)).typeText(MOCK_USERS.VALID_USER.email);
  await element(by.id(INPUT_IDS.PASSWORD_INPUT)).typeText(MOCK_USERS.VALID_USER.password);
  
  // Submit login form
  await element(by.id(BUTTON_IDS.LOGIN_BUTTON)).tap();
  
  // Wait for dashboard
  await waitFor(element(by.id(SCREEN_IDS.DASHBOARD_SCREEN))).toBeVisible().withTimeout(10000);
};

/**
 * Register a new test user
 */
export const registerNewUser = async (): Promise<void> => {
  await device.reloadReactNative();
  
  // Navigate to register screen
  await waitFor(element(by.id(SCREEN_IDS.WELCOME_SCREEN))).toBeVisible().withTimeout(5000);
  await element(by.id(BUTTON_IDS.REGISTER_BUTTON)).tap();
  
  // Fill registration form
  await waitFor(element(by.id(SCREEN_IDS.REGISTER_SCREEN))).toBeVisible().withTimeout(5000);
  await element(by.id(INPUT_IDS.NAME_INPUT)).typeText(MOCK_USERS.NEW_USER.name);
  await element(by.id(INPUT_IDS.EMAIL_INPUT)).typeText(MOCK_USERS.NEW_USER.email);
  await element(by.id(INPUT_IDS.PASSWORD_INPUT)).typeText(MOCK_USERS.NEW_USER.password);
  await element(by.id(INPUT_IDS.CONFIRM_PASSWORD_INPUT)).typeText(MOCK_USERS.NEW_USER.password);
  
  // Submit registration form
  await element(by.id(BUTTON_IDS.REGISTER_BUTTON)).tap();
  
  // Wait for email verification screen
  await waitFor(element(by.id(SCREEN_IDS.EMAIL_VERIFICATION_SCREEN))).toBeVisible().withTimeout(5000);
};

/**
 * Navigate to a specific tab
 */
export const navigateToTab = async (tabName: string): Promise<void> => {
  await element(by.id(`tab-${tabName}`)).tap();
};

/**
 * Check if an element exists
 */
export const elementExists = async (elementId: string): Promise<boolean> => {
  try {
    await waitFor(element(by.id(elementId))).toExist().withTimeout(1000);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Scroll until an element is visible
 */
export const scrollToElement = async (scrollViewId: string, elementId: string): Promise<void> => {
  await element(by.id(scrollViewId)).scrollTo('bottom');
  await waitFor(element(by.id(elementId))).toBeVisible().withTimeout(2000);
};

/**
 * Simulate network conditions
 */
export const setNetworkCondition = async (condition: 'online' | 'offline'): Promise<void> => {
  if (condition === 'offline') {
    await device.setStatusBar({ networkType: 'none' });
  } else {
    await device.setStatusBar({ networkType: 'wifi' });
  }
};

/**
 * Clear app data and restart
 */
export const resetApp = async (): Promise<void> => {
  await device.uninstallApp();
  await device.installApp();
  await device.launchApp({ newInstance: true });
};

/**
 * Handle system alerts (permissions, etc.)
 */
export const acceptSystemAlert = async (): Promise<void> => {
  if (device.getPlatform() === 'ios') {
    await expect(element(by.label('Allow'))).toBeVisible();
    await element(by.label('Allow')).tap();
  } else {
    await expect(element(by.text('Allow'))).toBeVisible();
    await element(by.text('Allow')).tap();
  }
};

/**
 * Dismiss keyboard
 */
export const dismissKeyboard = async (): Promise<void> => {
  await device.pressBack(); // Android
  // For iOS, tap outside the keyboard area
  try {
    await element(by.id('keyboardDismissArea')).tap();
  } catch (error) {
    // If no specific dismiss area, tap at coordinates likely outside keyboard
    await device.sendToHome();
    await device.launchApp({ newInstance: false });
  }
};
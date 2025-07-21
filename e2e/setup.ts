import { cleanup, device, element, by, expect } from 'detox';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisible(): R;
      toExist(): R;
      toHaveText(text: string): R;
      toHaveValue(value: string): R;
    }
  }
}

// Global setup
beforeAll(async () => {
  await device.launchApp({
    newInstance: true,
    launchArgs: { detoxDebug: 'true' },
  });
});

// Reset app state between tests
beforeEach(async () => {
  await device.reloadReactNative();
});

// Cleanup after each test
afterEach(async () => {
  await cleanup();
});

// Helper functions for E2E tests
export const TestHelpers = {
  /**
   * Wait for an element to be visible
   */
  async waitForElement(elementId: string, timeout = 5000): Promise<Detox.NativeElement> {
    await expect(element(by.id(elementId))).toBeVisible();
    return element(by.id(elementId));
  },

  /**
   * Type text into an input field
   */
  async typeIntoField(fieldId: string, text: string): Promise<void> {
    await element(by.id(fieldId)).typeText(text);
  },

  /**
   * Clear text from an input field
   */
  async clearField(fieldId: string): Promise<void> {
    await element(by.id(fieldId)).clearText();
  },

  /**
   * Tap on an element
   */
  async tapOn(elementId: string): Promise<void> {
    await element(by.id(elementId)).tap();
  },

  /**
   * Scroll until an element is visible
   */
  async scrollToElement(scrollViewId: string, elementId: string): Promise<void> {
    await element(by.id(scrollViewId)).scrollTo('bottom');
    await expect(element(by.id(elementId))).toBeVisible();
  },

  /**
   * Check if text is visible on screen
   */
  async expectTextToBeVisible(text: string): Promise<void> {
    await expect(element(by.text(text))).toBeVisible();
  },

  /**
   * Check if element with ID is visible
   */
  async expectElementToBeVisible(elementId: string): Promise<void> {
    await expect(element(by.id(elementId))).toBeVisible();
  },

  /**
   * Login with provided credentials
   */
  async login(email: string, password: string): Promise<void> {
    await this.waitForElement('loginScreen');
    await this.typeIntoField('emailInput', email);
    await this.typeIntoField('passwordInput', password);
    await this.tapOn('loginButton');
    // Wait for dashboard to appear
    await this.waitForElement('dashboardScreen');
  },

  /**
   * Register a new user
   */
  async register(name: string, email: string, password: string): Promise<void> {
    await this.waitForElement('registerScreen');
    await this.typeIntoField('nameInput', name);
    await this.typeIntoField('emailInput', email);
    await this.typeIntoField('passwordInput', password);
    await this.typeIntoField('confirmPasswordInput', password);
    await this.tapOn('registerButton');
    // Wait for email verification screen
    await this.waitForElement('emailVerificationScreen');
  },

  /**
   * Navigate to a specific tab
   */
  async navigateToTab(tabName: string): Promise<void> {
    await this.tapOn(`tab-${tabName}`);
  },

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await device.takeScreenshot(name);
  },
};
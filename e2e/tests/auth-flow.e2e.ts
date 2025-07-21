import { device, element, by, expect } from 'detox';
import { TestHelpers } from '../setup';

describe('Authentication Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should allow a user to register successfully', async () => {
    // Navigate to register screen
    await TestHelpers.waitForElement('welcomeScreen');
    await TestHelpers.tapOn('registerButton');
    
    // Fill out registration form
    await TestHelpers.waitForElement('registerScreen');
    await TestHelpers.typeIntoField('nameInput', 'Test User');
    await TestHelpers.typeIntoField('emailInput', 'test@example.com');
    await TestHelpers.typeIntoField('passwordInput', 'Password123!');
    await TestHelpers.typeIntoField('confirmPasswordInput', 'Password123!');
    
    // Submit registration form
    await TestHelpers.tapOn('registerButton');
    
    // Verify email verification screen appears
    await TestHelpers.waitForElement('emailVerificationScreen');
    await TestHelpers.expectTextToBeVisible('Verify your email');
  });

  it('should show validation errors for invalid registration input', async () => {
    // Navigate to register screen
    await TestHelpers.waitForElement('welcomeScreen');
    await TestHelpers.tapOn('registerButton');
    
    // Fill out registration form with invalid data
    await TestHelpers.waitForElement('registerScreen');
    await TestHelpers.typeIntoField('nameInput', 'T'); // Too short
    await TestHelpers.typeIntoField('emailInput', 'invalid-email'); // Invalid email
    await TestHelpers.typeIntoField('passwordInput', '123'); // Too short
    await TestHelpers.typeIntoField('confirmPasswordInput', '456'); // Doesn't match
    
    // Submit registration form
    await TestHelpers.tapOn('registerButton');
    
    // Verify validation errors appear
    await TestHelpers.expectTextToBeVisible('Name must be at least 2 characters');
    await TestHelpers.expectTextToBeVisible('Invalid email address');
    await TestHelpers.expectTextToBeVisible('Password must be at least 8 characters');
    await TestHelpers.expectTextToBeVisible('Passwords do not match');
  });

  it('should allow a user to login successfully', async () => {
    // Navigate to login screen
    await TestHelpers.waitForElement('welcomeScreen');
    await TestHelpers.tapOn('loginButton');
    
    // Fill out login form
    await TestHelpers.waitForElement('loginScreen');
    await TestHelpers.typeIntoField('emailInput', 'user@example.com');
    await TestHelpers.typeIntoField('passwordInput', 'Password123!');
    
    // Submit login form
    await TestHelpers.tapOn('loginButton');
    
    // Verify dashboard screen appears
    await TestHelpers.waitForElement('dashboardScreen');
    await TestHelpers.expectTextToBeVisible('Welcome back');
  });

  it('should show error message for invalid login credentials', async () => {
    // Navigate to login screen
    await TestHelpers.waitForElement('welcomeScreen');
    await TestHelpers.tapOn('loginButton');
    
    // Fill out login form with invalid credentials
    await TestHelpers.waitForElement('loginScreen');
    await TestHelpers.typeIntoField('emailInput', 'wrong@example.com');
    await TestHelpers.typeIntoField('passwordInput', 'WrongPassword123!');
    
    // Submit login form
    await TestHelpers.tapOn('loginButton');
    
    // Verify error message appears
    await TestHelpers.expectTextToBeVisible('Invalid email or password');
  });

  it('should allow a user to reset their password', async () => {
    // Navigate to login screen
    await TestHelpers.waitForElement('welcomeScreen');
    await TestHelpers.tapOn('loginButton');
    
    // Navigate to forgot password screen
    await TestHelpers.waitForElement('loginScreen');
    await TestHelpers.tapOn('forgotPasswordButton');
    
    // Fill out forgot password form
    await TestHelpers.waitForElement('forgotPasswordScreen');
    await TestHelpers.typeIntoField('emailInput', 'user@example.com');
    
    // Submit forgot password form
    await TestHelpers.tapOn('resetPasswordButton');
    
    // Verify success message appears
    await TestHelpers.expectTextToBeVisible('Password reset email sent');
  });

  it('should navigate through the complete authentication flow', async () => {
    // Start at welcome screen
    await TestHelpers.waitForElement('welcomeScreen');
    
    // Navigate to register screen
    await TestHelpers.tapOn('registerButton');
    await TestHelpers.waitForElement('registerScreen');
    
    // Go back to welcome screen
    await TestHelpers.tapOn('backButton');
    await TestHelpers.waitForElement('welcomeScreen');
    
    // Navigate to login screen
    await TestHelpers.tapOn('loginButton');
    await TestHelpers.waitForElement('loginScreen');
    
    // Navigate to forgot password screen
    await TestHelpers.tapOn('forgotPasswordButton');
    await TestHelpers.waitForElement('forgotPasswordScreen');
    
    // Go back to login screen
    await TestHelpers.tapOn('backButton');
    await TestHelpers.waitForElement('loginScreen');
    
    // Login successfully
    await TestHelpers.typeIntoField('emailInput', 'user@example.com');
    await TestHelpers.typeIntoField('passwordInput', 'Password123!');
    await TestHelpers.tapOn('loginButton');
    
    // Verify dashboard screen appears
    await TestHelpers.waitForElement('dashboardScreen');
  });
});
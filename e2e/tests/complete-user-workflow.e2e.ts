import { device, element, by, expect } from 'detox';
import { TestHelpers } from '../setup';

describe('Complete User Workflow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete a full user journey from registration to campaign creation', async () => {
    // Step 1: Start at welcome screen
    await TestHelpers.waitForElement('welcomeScreen');
    await TestHelpers.expectTextToBeVisible('Welcome to AdVantage');
    
    // Step 2: Navigate to register screen
    await TestHelpers.tapOn('registerButton');
    await TestHelpers.waitForElement('registerScreen');
    
    // Step 3: Register a new user
    const uniqueEmail = `test${Date.now()}@example.com`;
    await TestHelpers.typeIntoField('nameInput', 'E2E Test User');
    await TestHelpers.typeIntoField('emailInput', uniqueEmail);
    await TestHelpers.typeIntoField('passwordInput', 'Password123!');
    await TestHelpers.typeIntoField('confirmPasswordInput', 'Password123!');
    await TestHelpers.tapOn('registerButton');
    
    // Step 4: Verify email verification screen appears
    await TestHelpers.waitForElement('emailVerificationScreen');
    
    // Step 5: Skip email verification for testing (mock verification)
    await TestHelpers.tapOn('skipVerificationButton');
    
    // Step 6: Complete onboarding
    await TestHelpers.waitForElement('onboardingScreen');
    await TestHelpers.tapOn('nextButton');
    await TestHelpers.tapOn('nextButton');
    await TestHelpers.tapOn('nextButton');
    await TestHelpers.tapOn('finishButton');
    
    // Step 7: Verify dashboard appears
    await TestHelpers.waitForElement('dashboardScreen');
    
    // Step 8: Navigate to profile tab
    await TestHelpers.navigateToTab('profile');
    await TestHelpers.waitForElement('profileScreen');
    
    // Step 9: Update profile information
    await TestHelpers.tapOn('editProfileButton');
    await TestHelpers.waitForElement('editProfileScreen');
    await TestHelpers.typeIntoField('businessNameInput', 'E2E Test Business');
    await TestHelpers.tapOn('saveProfileButton');
    
    // Step 10: Verify profile updated
    await TestHelpers.waitForElement('profileScreen');
    await TestHelpers.expectTextToBeVisible('E2E Test Business');
    
    // Step 11: Navigate to campaign tab
    await TestHelpers.navigateToTab('campaign');
    await TestHelpers.waitForElement('campaignScreen');
    
    // Step 12: Create a new campaign
    await TestHelpers.tapOn('createCampaignButton');
    await TestHelpers.waitForElement('createCampaignScreen');
    await TestHelpers.typeIntoField('campaignNameInput', 'My First Campaign');
    await TestHelpers.typeIntoField('campaignDescriptionInput', 'Created during E2E testing');
    await TestHelpers.tapOn('campaignTypeDropdown');
    await TestHelpers.tapOn('campaignType-social');
    await TestHelpers.tapOn('platformCheckbox-facebook');
    await TestHelpers.tapOn('platformCheckbox-instagram');
    await TestHelpers.tapOn('createCampaignButton');
    
    // Step 13: Verify campaign details screen
    await TestHelpers.waitForElement('campaignDetailsScreen');
    await TestHelpers.expectTextToBeVisible('My First Campaign');
    
    // Step 14: Navigate to AI agent tab
    await TestHelpers.navigateToTab('aiAgent');
    await TestHelpers.waitForElement('aiAgentScreen');
    
    // Step 15: Start a conversation with AI agent
    await TestHelpers.typeIntoField('aiChatInput', 'Help me optimize my campaign');
    await TestHelpers.tapOn('sendMessageButton');
    
    // Step 16: Verify AI response
    await TestHelpers.expectElementToBeVisible('aiResponseMessage');
    
    // Step 17: Navigate back to dashboard
    await TestHelpers.navigateToTab('dashboard');
    await TestHelpers.waitForElement('dashboardScreen');
    
    // Step 18: Check campaign metrics
    await TestHelpers.expectElementToBeVisible('metricCard-impressions');
    await TestHelpers.expectElementToBeVisible('metricCard-engagement');
    
    // Step 19: Navigate to settings
    await TestHelpers.navigateToTab('profile');
    await TestHelpers.waitForElement('profileScreen');
    await TestHelpers.tapOn('settingsButton');
    
    // Step 20: Verify settings screen
    await TestHelpers.waitForElement('settingsDashboardScreen');
    await TestHelpers.expectTextToBeVisible('Settings');
    
    // Step 21: Log out
    await TestHelpers.scrollToElement('settingsScrollView', 'logoutButton');
    await TestHelpers.tapOn('logoutButton');
    
    // Step 22: Confirm logout
    await TestHelpers.tapOn('confirmLogoutButton');
    
    // Step 23: Verify back at welcome screen
    await TestHelpers.waitForElement('welcomeScreen');
    await TestHelpers.expectTextToBeVisible('Welcome to AdVantage');
  });

  it('should handle error states and recovery during user workflow', async () => {
    // Step 1: Start at welcome screen
    await TestHelpers.waitForElement('welcomeScreen');
    
    // Step 2: Navigate to login screen
    await TestHelpers.tapOn('loginButton');
    await TestHelpers.waitForElement('loginScreen');
    
    // Step 3: Enter invalid credentials
    await TestHelpers.typeIntoField('emailInput', 'invalid@example.com');
    await TestHelpers.typeIntoField('passwordInput', 'WrongPassword123!');
    await TestHelpers.tapOn('loginButton');
    
    // Step 4: Verify error message
    await TestHelpers.expectTextToBeVisible('Invalid email or password');
    
    // Step 5: Enter valid credentials
    await TestHelpers.clearField('emailInput');
    await TestHelpers.clearField('passwordInput');
    await TestHelpers.typeIntoField('emailInput', 'user@example.com');
    await TestHelpers.typeIntoField('passwordInput', 'Password123!');
    await TestHelpers.tapOn('loginButton');
    
    // Step 6: Verify dashboard appears
    await TestHelpers.waitForElement('dashboardScreen');
    
    // Step 7: Navigate to campaign tab
    await TestHelpers.navigateToTab('campaign');
    await TestHelpers.waitForElement('campaignScreen');
    
    // Step 8: Create a campaign with validation errors
    await TestHelpers.tapOn('createCampaignButton');
    await TestHelpers.waitForElement('createCampaignScreen');
    // Leave fields empty and try to submit
    await TestHelpers.tapOn('createCampaignButton');
    
    // Step 9: Verify validation errors
    await TestHelpers.expectTextToBeVisible('Campaign name is required');
    
    // Step 10: Fix validation errors
    await TestHelpers.typeIntoField('campaignNameInput', 'Error Recovery Campaign');
    await TestHelpers.typeIntoField('campaignDescriptionInput', 'Testing error recovery');
    await TestHelpers.tapOn('campaignTypeDropdown');
    await TestHelpers.tapOn('campaignType-social');
    await TestHelpers.tapOn('createCampaignButton');
    
    // Step 11: Verify campaign created successfully
    await TestHelpers.waitForElement('campaignDetailsScreen');
    await TestHelpers.expectTextToBeVisible('Error Recovery Campaign');
    
    // Step 12: Test network error recovery (simulate by enabling airplane mode)
    await device.setStatusBar({ networkType: 'none' });
    
    // Step 13: Try to perform an action that requires network
    await TestHelpers.tapOn('refreshCampaignButton');
    
    // Step 14: Verify network error message
    await TestHelpers.expectTextToBeVisible('Network error');
    await TestHelpers.expectElementToBeVisible('retryButton');
    
    // Step 15: Restore network and retry
    await device.setStatusBar({ networkType: 'wifi' });
    await TestHelpers.tapOn('retryButton');
    
    // Step 16: Verify recovery successful
    await TestHelpers.expectElementToBeVisible('campaignDetailsScreen');
    
    // Step 17: Navigate back to dashboard
    await TestHelpers.tapOn('backButton');
    await TestHelpers.waitForElement('campaignScreen');
    await TestHelpers.navigateToTab('dashboard');
    await TestHelpers.waitForElement('dashboardScreen');
  });
});
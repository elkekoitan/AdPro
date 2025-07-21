import { device, element, by, expect } from 'detox';
import { TestHelpers } from '../setup';

describe('Dashboard Navigation Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    // Login before each test
    await TestHelpers.login('user@example.com', 'Password123!');
  });

  it('should navigate between dashboard tabs', async () => {
    // Verify we're on the dashboard screen
    await TestHelpers.waitForElement('dashboardScreen');
    
    // Navigate to Analytics tab
    await TestHelpers.navigateToTab('analytics');
    await TestHelpers.waitForElement('analyticsScreen');
    await TestHelpers.expectTextToBeVisible('Analytics');
    
    // Navigate to Campaign tab
    await TestHelpers.navigateToTab('campaign');
    await TestHelpers.waitForElement('campaignScreen');
    await TestHelpers.expectTextToBeVisible('Campaigns');
    
    // Navigate to AI Agent tab
    await TestHelpers.navigateToTab('aiAgent');
    await TestHelpers.waitForElement('aiAgentScreen');
    await TestHelpers.expectTextToBeVisible('AI Agent');
    
    // Navigate to Profile tab
    await TestHelpers.navigateToTab('profile');
    await TestHelpers.waitForElement('profileScreen');
    await TestHelpers.expectTextToBeVisible('Profile');
    
    // Navigate back to Dashboard tab
    await TestHelpers.navigateToTab('dashboard');
    await TestHelpers.waitForElement('dashboardScreen');
    await TestHelpers.expectTextToBeVisible('Dashboard');
  });

  it('should display dashboard metrics and cards', async () => {
    // Verify we're on the dashboard screen
    await TestHelpers.waitForElement('dashboardScreen');
    
    // Check for metric cards
    await TestHelpers.expectElementToBeVisible('metricCard-impressions');
    await TestHelpers.expectElementToBeVisible('metricCard-engagement');
    await TestHelpers.expectElementToBeVisible('metricCard-conversions');
    
    // Check for campaign cards
    await TestHelpers.expectElementToBeVisible('campaignCard');
    
    // Check for AI insight cards
    await TestHelpers.expectElementToBeVisible('aiInsightCard');
    
    // Check for quick action cards
    await TestHelpers.expectElementToBeVisible('quickActionCard');
  });

  it('should navigate to campaign details from dashboard', async () => {
    // Verify we're on the dashboard screen
    await TestHelpers.waitForElement('dashboardScreen');
    
    // Tap on a campaign card
    await TestHelpers.tapOn('campaignCard');
    
    // Verify campaign details screen appears
    await TestHelpers.waitForElement('campaignDetailsScreen');
    await TestHelpers.expectTextToBeVisible('Campaign Details');
    
    // Navigate back to dashboard
    await TestHelpers.tapOn('backButton');
    await TestHelpers.waitForElement('dashboardScreen');
  });

  it('should navigate to AI insight details from dashboard', async () => {
    // Verify we're on the dashboard screen
    await TestHelpers.waitForElement('dashboardScreen');
    
    // Tap on an AI insight card
    await TestHelpers.tapOn('aiInsightCard');
    
    // Verify AI insight details screen appears
    await TestHelpers.waitForElement('aiInsightDetailsScreen');
    await TestHelpers.expectTextToBeVisible('AI Insight');
    
    // Navigate back to dashboard
    await TestHelpers.tapOn('backButton');
    await TestHelpers.waitForElement('dashboardScreen');
  });

  it('should create a new campaign from quick action', async () => {
    // Verify we're on the dashboard screen
    await TestHelpers.waitForElement('dashboardScreen');
    
    // Tap on create campaign quick action
    await TestHelpers.tapOn('quickActionCard-createCampaign');
    
    // Verify create campaign screen appears
    await TestHelpers.waitForElement('createCampaignScreen');
    await TestHelpers.expectTextToBeVisible('Create Campaign');
    
    // Fill out campaign form
    await TestHelpers.typeIntoField('campaignNameInput', 'Test Campaign');
    await TestHelpers.typeIntoField('campaignDescriptionInput', 'This is a test campaign');
    
    // Select campaign type
    await TestHelpers.tapOn('campaignTypeDropdown');
    await TestHelpers.tapOn('campaignType-social');
    
    // Submit campaign form
    await TestHelpers.tapOn('createCampaignButton');
    
    // Verify campaign details screen appears
    await TestHelpers.waitForElement('campaignDetailsScreen');
    await TestHelpers.expectTextToBeVisible('Test Campaign');
  });

  it('should handle pull-to-refresh on dashboard', async () => {
    // Verify we're on the dashboard screen
    await TestHelpers.waitForElement('dashboardScreen');
    
    // Perform pull-to-refresh gesture
    await element(by.id('dashboardScrollView')).swipe('down', 'slow', 0.5);
    
    // Verify refresh indicator appears
    await TestHelpers.expectElementToBeVisible('refreshIndicator');
    
    // Wait for refresh to complete
    await TestHelpers.waitForElement('dashboardScreen');
    
    // Verify dashboard content is still visible
    await TestHelpers.expectElementToBeVisible('metricCard-impressions');
  });
});
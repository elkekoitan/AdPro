/**
 * Mock data for E2E testing
 * 
 * This file contains mock data that can be used in E2E tests.
 */

export const MOCK_USERS = {
  VALID_USER: {
    email: 'user@example.com',
    password: 'Password123!',
    name: 'Test User',
  },
  NEW_USER: {
    email: `test${Date.now()}@example.com`,
    password: 'NewPassword123!',
    name: 'New Test User',
  },
};

export const MOCK_CAMPAIGNS = {
  BASIC_CAMPAIGN: {
    name: 'Basic Test Campaign',
    description: 'A basic test campaign for E2E testing',
    type: 'social',
    platforms: ['facebook', 'instagram'],
  },
  MULTI_PLATFORM_CAMPAIGN: {
    name: 'Multi-Platform Test Campaign',
    description: 'A multi-platform test campaign for E2E testing',
    type: 'social',
    platforms: ['facebook', 'instagram', 'twitter', 'linkedin'],
  },
};

export const MOCK_BUSINESS_PROFILES = {
  BASIC_PROFILE: {
    name: 'Test Business',
    industry: 'Technology',
    website: 'https://example.com',
    description: 'A test business for E2E testing',
  },
};

export const MOCK_AI_MESSAGES = {
  CAMPAIGN_HELP: 'Help me optimize my campaign',
  CONTENT_CREATION: 'Create content for my restaurant',
  ANALYTICS_QUESTION: 'What do my analytics mean?',
};

export const MOCK_ERROR_SCENARIOS = {
  NETWORK_ERROR: {
    action: 'Refresh campaign data',
    recovery: 'Retry button',
  },
  VALIDATION_ERROR: {
    action: 'Submit empty campaign form',
    recovery: 'Fill required fields',
  },
  AUTHENTICATION_ERROR: {
    action: 'Login with invalid credentials',
    recovery: 'Use valid credentials',
  },
};

export const MOCK_NAVIGATION_FLOWS = {
  AUTHENTICATION_FLOW: [
    { screen: 'welcomeScreen', action: 'tap loginButton' },
    { screen: 'loginScreen', action: 'fill credentials and tap loginButton' },
    { screen: 'dashboardScreen', action: 'verify dashboard loaded' },
  ],
  CAMPAIGN_CREATION_FLOW: [
    { screen: 'dashboardScreen', action: 'navigate to campaign tab' },
    { screen: 'campaignScreen', action: 'tap createCampaignButton' },
    { screen: 'createCampaignScreen', action: 'fill form and submit' },
    { screen: 'campaignDetailsScreen', action: 'verify campaign created' },
  ],
  PROFILE_UPDATE_FLOW: [
    { screen: 'dashboardScreen', action: 'navigate to profile tab' },
    { screen: 'profileScreen', action: 'tap editProfileButton' },
    { screen: 'editProfileScreen', action: 'update profile and save' },
    { screen: 'profileScreen', action: 'verify profile updated' },
  ],
};

export const MOCK_METRICS = {
  IMPRESSIONS: '10.5K',
  ENGAGEMENT: '2.3K',
  CONVERSIONS: '350',
  REVENUE: '$1,250',
};

export const MOCK_DATES = {
  START_DATE: new Date(),
  END_DATE: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
};
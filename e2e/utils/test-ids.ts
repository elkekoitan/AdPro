/**
 * Test IDs for E2E testing
 * 
 * This file contains constants for all testID props used in the app.
 * Using these constants helps maintain consistency between the app and tests.
 */

export const SCREEN_IDS = {
  // Authentication screens
  WELCOME_SCREEN: 'welcomeScreen',
  LOGIN_SCREEN: 'loginScreen',
  REGISTER_SCREEN: 'registerScreen',
  FORGOT_PASSWORD_SCREEN: 'forgotPasswordScreen',
  EMAIL_VERIFICATION_SCREEN: 'emailVerificationScreen',
  ONBOARDING_SCREEN: 'onboardingScreen',
  
  // Main screens
  DASHBOARD_SCREEN: 'dashboardScreen',
  CAMPAIGN_SCREEN: 'campaignScreen',
  ANALYTICS_SCREEN: 'analyticsScreen',
  AI_AGENT_SCREEN: 'aiAgentScreen',
  PROFILE_SCREEN: 'profileScreen',
  
  // Campaign screens
  CREATE_CAMPAIGN_SCREEN: 'createCampaignScreen',
  CAMPAIGN_DETAILS_SCREEN: 'campaignDetailsScreen',
  EDIT_CAMPAIGN_SCREEN: 'editCampaignScreen',
  MULTI_PLATFORM_CAMPAIGN_SCREEN: 'multiPlatformCampaignScreen',
  
  // Profile screens
  EDIT_PROFILE_SCREEN: 'editProfileScreen',
  SETTINGS_DASHBOARD_SCREEN: 'settingsDashboardScreen',
  NOTIFICATION_CENTER_SCREEN: 'notificationCenterScreen',
  
  // AI screens
  AI_INSIGHT_DETAILS_SCREEN: 'aiInsightDetailsScreen',
};

export const INPUT_IDS = {
  // Authentication inputs
  EMAIL_INPUT: 'emailInput',
  PASSWORD_INPUT: 'passwordInput',
  CONFIRM_PASSWORD_INPUT: 'confirmPasswordInput',
  NAME_INPUT: 'nameInput',
  
  // Campaign inputs
  CAMPAIGN_NAME_INPUT: 'campaignNameInput',
  CAMPAIGN_DESCRIPTION_INPUT: 'campaignDescriptionInput',
  
  // Profile inputs
  BUSINESS_NAME_INPUT: 'businessNameInput',
  
  // AI inputs
  AI_CHAT_INPUT: 'aiChatInput',
};

export const BUTTON_IDS = {
  // Authentication buttons
  LOGIN_BUTTON: 'loginButton',
  REGISTER_BUTTON: 'registerButton',
  FORGOT_PASSWORD_BUTTON: 'forgotPasswordButton',
  RESET_PASSWORD_BUTTON: 'resetPasswordButton',
  BACK_BUTTON: 'backButton',
  SKIP_VERIFICATION_BUTTON: 'skipVerificationButton',
  
  // Navigation buttons
  NEXT_BUTTON: 'nextButton',
  FINISH_BUTTON: 'finishButton',
  
  // Campaign buttons
  CREATE_CAMPAIGN_BUTTON: 'createCampaignButton',
  EDIT_CAMPAIGN_BUTTON: 'editCampaignButton',
  SAVE_CAMPAIGN_BUTTON: 'saveCampaignButton',
  CAMPAIGN_OPTIONS_BUTTON: 'campaignOptionsButton',
  DELETE_CAMPAIGN_OPTION: 'deleteCampaignOption',
  CONFIRM_DELETE_BUTTON: 'confirmDeleteButton',
  REFRESH_CAMPAIGN_BUTTON: 'refreshCampaignButton',
  MULTI_PLATFORM_CAMPAIGN_BUTTON: 'multiPlatformCampaignButton',
  CREATE_MULTI_PLATFORM_CAMPAIGN_BUTTON: 'createMultiPlatformCampaignButton',
  
  // Profile buttons
  EDIT_PROFILE_BUTTON: 'editProfileButton',
  SAVE_PROFILE_BUTTON: 'saveProfileButton',
  SETTINGS_BUTTON: 'settingsButton',
  LOGOUT_BUTTON: 'logoutButton',
  CONFIRM_LOGOUT_BUTTON: 'confirmLogoutButton',
  
  // AI buttons
  SEND_MESSAGE_BUTTON: 'sendMessageButton',
  
  // Error handling buttons
  RETRY_BUTTON: 'retryButton',
};

export const LIST_IDS = {
  CAMPAIGN_LIST: 'campaignList',
  CAMPAIGN_LIST_ITEM: (index: number) => `campaignListItem-${index}`,
};

export const DROPDOWN_IDS = {
  CAMPAIGN_TYPE_DROPDOWN: 'campaignTypeDropdown',
  CAMPAIGN_TYPE_OPTION: (type: string) => `campaignType-${type}`,
  CAMPAIGN_FILTER_DROPDOWN: 'campaignFilterDropdown',
  STATUS_FILTER_OPTION: (status: string) => `statusFilter-${status}`,
};

export const CHECKBOX_IDS = {
  PLATFORM_CHECKBOX: (platform: string) => `platformCheckbox-${platform}`,
};

export const CARD_IDS = {
  METRIC_CARD: (metric: string) => `metricCard-${metric}`,
  CAMPAIGN_CARD: 'campaignCard',
  AI_INSIGHT_CARD: 'aiInsightCard',
  QUICK_ACTION_CARD: 'quickActionCard',
  QUICK_ACTION_CARD_TYPE: (type: string) => `quickActionCard-${type}`,
};

export const DATE_PICKER_IDS = {
  START_DATE_PICKER: 'startDatePicker',
  END_DATE_PICKER: 'endDatePicker',
  CONFIRM_DATE_BUTTON: 'confirmDateButton',
};

export const SCROLL_VIEW_IDS = {
  DASHBOARD_SCROLL_VIEW: 'dashboardScrollView',
  SETTINGS_SCROLL_VIEW: 'settingsScrollView',
};

export const MISC_IDS = {
  REFRESH_INDICATOR: 'refreshIndicator',
  PLATFORM_SELECTION: 'platformSelection',
  AI_RESPONSE_MESSAGE: 'aiResponseMessage',
  TAB: (name: string) => `tab-${name}`,
};
import { device, element, by, expect } from 'detox';
import { TestHelpers } from '../setup';

describe('Campaign Management Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    // Login before each test
    await TestHelpers.login('user@example.com', 'Password123!');
    // Navigate to campaign tab
    await TestHelpers.navigateToTab('campaign');
  });

  it('should display campaign list screen', async () => {
    // Verify we're on the campaign screen
    await TestHelpers.waitForElement('campaignScreen');
    
    // Check for campaign list elements
    await TestHelpers.expectElementToBeVisible('campaignList');
    await TestHelpers.expectElementToBeVisible('createCampaignButton');
    
    // Check for campaign filter options
    await TestHelpers.expectElementToBeVisible('campaignFilterDropdown');
  });

  it('should create a new campaign', async () => {
    // Verify we're on the campaign screen
    await TestHelpers.waitForElement('campaignScreen');
    
    // Tap on create campaign button
    await TestHelpers.tapOn('createCampaignButton');
    
    // Verify create campaign screen appears
    await TestHelpers.waitForElement('createCampaignScreen');
    
    // Fill out campaign form
    await TestHelpers.typeIntoField('campaignNameInput', 'E2E Test Campaign');
    await TestHelpers.typeIntoField('campaignDescriptionInput', 'This is an E2E test campaign');
    
    // Select campaign type
    await TestHelpers.tapOn('campaignTypeDropdown');
    await TestHelpers.tapOn('campaignType-social');
    
    // Select platforms
    await TestHelpers.tapOn('platformCheckbox-facebook');
    await TestHelpers.tapOn('platformCheckbox-instagram');
    
    // Set campaign dates
    await TestHelpers.tapOn('startDatePicker');
    await TestHelpers.tapOn('confirmDateButton');
    
    await TestHelpers.tapOn('endDatePicker');
    await TestHelpers.tapOn('confirmDateButton');
    
    // Submit campaign form
    await TestHelpers.tapOn('createCampaignButton');
    
    // Verify campaign details screen appears
    await TestHelpers.waitForElement('campaignDetailsScreen');
    await TestHelpers.expectTextToBeVisible('E2E Test Campaign');
  });

  it('should edit an existing campaign', async () => {
    // Verify we're on the campaign screen
    await TestHelpers.waitForElement('campaignScreen');
    
    // Tap on first campaign in list
    await TestHelpers.tapOn('campaignListItem-0');
    
    // Verify campaign details screen appears
    await TestHelpers.waitForElement('campaignDetailsScreen');
    
    // Tap on edit button
    await TestHelpers.tapOn('editCampaignButton');
    
    // Verify edit campaign screen appears
    await TestHelpers.waitForElement('editCampaignScreen');
    
    // Update campaign name
    await TestHelpers.clearField('campaignNameInput');
    await TestHelpers.typeIntoField('campaignNameInput', 'Updated Campaign Name');
    
    // Save changes
    await TestHelpers.tapOn('saveCampaignButton');
    
    // Verify campaign details screen appears with updated name
    await TestHelpers.waitForElement('campaignDetailsScreen');
    await TestHelpers.expectTextToBeVisible('Updated Campaign Name');
  });

  it('should delete a campaign', async () => {
    // Verify we're on the campaign screen
    await TestHelpers.waitForElement('campaignScreen');
    
    // Get initial campaign count
    const initialCampaignCount = await element(by.id('campaignList')).getAttributes();
    
    // Tap on first campaign in list
    await TestHelpers.tapOn('campaignListItem-0');
    
    // Verify campaign details screen appears
    await TestHelpers.waitForElement('campaignDetailsScreen');
    
    // Tap on more options button
    await TestHelpers.tapOn('campaignOptionsButton');
    
    // Tap on delete option
    await TestHelpers.tapOn('deleteCampaignOption');
    
    // Confirm deletion
    await TestHelpers.tapOn('confirmDeleteButton');
    
    // Verify we're back on campaign screen
    await TestHelpers.waitForElement('campaignScreen');
    
    // Verify campaign was deleted (list count decreased)
    const finalCampaignCount = await element(by.id('campaignList')).getAttributes();
    expect(finalCampaignCount.elements.length).toBeLessThan(initialCampaignCount.elements.length);
  });

  it('should filter campaigns by status', async () => {
    // Verify we're on the campaign screen
    await TestHelpers.waitForElement('campaignScreen');
    
    // Tap on filter dropdown
    await TestHelpers.tapOn('campaignFilterDropdown');
    
    // Select active status filter
    await TestHelpers.tapOn('statusFilter-active');
    
    // Verify filtered results
    await TestHelpers.expectElementToBeVisible('campaignList');
    await TestHelpers.expectTextToBeVisible('Active Campaigns');
    
    // Change filter to completed
    await TestHelpers.tapOn('campaignFilterDropdown');
    await TestHelpers.tapOn('statusFilter-completed');
    
    // Verify filtered results
    await TestHelpers.expectTextToBeVisible('Completed Campaigns');
  });

  it('should navigate to multi-platform campaign screen', async () => {
    // Verify we're on the campaign screen
    await TestHelpers.waitForElement('campaignScreen');
    
    // Tap on multi-platform campaign button
    await TestHelpers.tapOn('multiPlatformCampaignButton');
    
    // Verify multi-platform campaign screen appears
    await TestHelpers.waitForElement('multiPlatformCampaignScreen');
    await TestHelpers.expectTextToBeVisible('Multi-Platform Campaign');
    
    // Check for platform selection options
    await TestHelpers.expectElementToBeVisible('platformSelection');
    
    // Select platforms
    await TestHelpers.tapOn('platformCheckbox-facebook');
    await TestHelpers.tapOn('platformCheckbox-instagram');
    await TestHelpers.tapOn('platformCheckbox-twitter');
    
    // Fill out campaign details
    await TestHelpers.typeIntoField('campaignNameInput', 'Multi-Platform Test');
    await TestHelpers.typeIntoField('campaignDescriptionInput', 'Testing multi-platform campaign');
    
    // Create campaign
    await TestHelpers.tapOn('createMultiPlatformCampaignButton');
    
    // Verify campaign details screen appears
    await TestHelpers.waitForElement('campaignDetailsScreen');
    await TestHelpers.expectTextToBeVisible('Multi-Platform Test');
  });
});
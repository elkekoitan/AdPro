/**
 * MultiPlatformCampaignScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MultiPlatformCampaignScreen } from '../MultiPlatformCampaignScreen';
import { createTestNavigationContainer, createMockUser } from '../../../../shared/utils/test-helpers';

// Mock the auth store
jest.mock('../../../../application/stores/authStore', () => ({
  useAuthUser: jest.fn(() => createMockUser({
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com'
  }))
}));

// Mock the network error handler
jest.mock('../../../../shared/utils/network-error-handler', () => ({
  networkErrorHandler: {
    executeRequest: jest.fn((fn) => fn())
  }
}));

describe('MultiPlatformCampaignScreen', () => {
  it('renders loading state initially', () => {
    const { getByText } = render(
      createTestNavigationContainer({
        MultiPlatformCampaign: MultiPlatformCampaignScreen
      })
    );
    
    expect(getByText('Kampanya verileri yükleniyor...')).toBeTruthy();
  });
  
  it('renders step 1 after loading', async () => {
    const { getByText, queryByText } = render(
      createTestNavigationContainer({
        MultiPlatformCampaign: MultiPlatformCampaignScreen
      })
    );
    
    await waitFor(() => {
      expect(queryByText('Kampanya verileri yükleniyor...')).toBeNull();
      expect(getByText('Kampanya Detayları')).toBeTruthy();
      expect(getByText('Kampanyanızın adını ve hedefini belirleyin.')).toBeTruthy();
    });
  });
  
  it('validates campaign name in step 1', async () => {
    const { getByText, getByPlaceholderText } = render(
      createTestNavigationContainer({
        MultiPlatformCampaign: MultiPlatformCampaignScreen
      })
    );
    
    // Wait for screen to load
    await waitFor(() => {
      expect(getByText('Kampanya Detayları')).toBeTruthy();
    });
    
    // Try to proceed without entering a name
    const nextButton = getByText('İleri');
    fireEvent.press(nextButton);
    
    // Check for validation alert (mock Alert.alert)
    expect(global.alert).toHaveBeenCalledWith('Hata', 'Lütfen kampanya adı girin.');
    
    // Enter a name
    const nameInput = getByPlaceholderText('Kampanya adını girin');
    fireEvent.changeText(nameInput, 'Test Campaign');
    
    // Select an objective
    fireEvent.press(getByText('Bilinirlik'));
    
    // Try to proceed again
    fireEvent.press(nextButton);
    
    // Should now proceed to step 2
    await waitFor(() => {
      expect(getByText('Platform Seçimi')).toBeTruthy();
    });
  });
  
  it('allows platform selection in step 2', async () => {
    const { getByText } = render(
      createTestNavigationContainer({
        MultiPlatformCampaign: MultiPlatformCampaignScreen
      })
    );
    
    // Wait for screen to load and navigate to step 2
    await waitFor(() => {
      expect(getByText('Kampanya Detayları')).toBeTruthy();
    });
    
    // Enter name and select objective
    const nameInput = getByPlaceholderText('Kampanya adını girin');
    fireEvent.changeText(nameInput, 'Test Campaign');
    fireEvent.press(getByText('Bilinirlik'));
    
    // Go to step 2
    fireEvent.press(getByText('İleri'));
    
    await waitFor(() => {
      expect(getByText('Platform Seçimi')).toBeTruthy();
    });
    
    // Select platforms
    fireEvent.press(getByText('Instagram'));
    fireEvent.press(getByText('Facebook'));
    
    // Check if platforms are selected
    await waitFor(() => {
      expect(getByText('Seçilen Platformlar (2)')).toBeTruthy();
    });
    
    // Go to step 3
    fireEvent.press(getByText('İleri'));
    
    await waitFor(() => {
      expect(getByText('Bütçe ve Zamanlama')).toBeTruthy();
    });
  });
  
  it('completes all steps and creates campaign', async () => {
    const { getByText, getByPlaceholderText } = render(
      createTestNavigationContainer({
        MultiPlatformCampaign: MultiPlatformCampaignScreen
      })
    );
    
    // Wait for screen to load
    await waitFor(() => {
      expect(getByText('Kampanya Detayları')).toBeTruthy();
    });
    
    // Step 1: Enter name and select objective
    const nameInput = getByPlaceholderText('Kampanya adını girin');
    fireEvent.changeText(nameInput, 'Test Campaign');
    fireEvent.press(getByText('Bilinirlik'));
    fireEvent.press(getByText('İleri'));
    
    // Step 2: Select platforms
    await waitFor(() => {
      expect(getByText('Platform Seçimi')).toBeTruthy();
    });
    fireEvent.press(getByText('Instagram'));
    fireEvent.press(getByText('Facebook'));
    fireEvent.press(getByText('İleri'));
    
    // Step 3: Enter budget
    await waitFor(() => {
      expect(getByText('Bütçe ve Zamanlama')).toBeTruthy();
    });
    const budgetInput = getByPlaceholderText('Bütçe girin');
    fireEvent.changeText(budgetInput, '1000');
    fireEvent.press(getByText('İleri'));
    
    // Step 4: Review and create
    await waitFor(() => {
      expect(getByText('Kampanya Özeti')).toBeTruthy();
    });
    
    // Create campaign
    fireEvent.press(getByText('Kampanya Oluştur'));
    
    // Check for success alert
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        'Başarılı',
        'Kampanya başarıyla oluşturuldu.',
        expect.anything()
      );
    });
  });
});
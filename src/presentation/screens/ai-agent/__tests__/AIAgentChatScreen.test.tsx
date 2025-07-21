/**
 * AIAgentChatScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AIAgentChatScreen } from '../AIAgentChatScreen';
import { createTestNavigationContainer, createMockUser } from '../../../../shared/utils/test-helpers';

// Mock the auth store
jest.mock('../../../../application/stores/authStore', () => ({
  useAuthUser: jest.fn(() => createMockUser({
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

describe('AIAgentChatScreen', () => {
  it('renders correctly with welcome message', () => {
    const { getByText } = render(
      createTestNavigationContainer({
        AIAgentChat: AIAgentChatScreen
      })
    );
    
    expect(getByText(/Merhaba Test User/)).toBeTruthy();
    expect(getByText('Kampanya oluştur')).toBeTruthy();
    expect(getByText('İçerik önerileri')).toBeTruthy();
    expect(getByText('Performans analizi')).toBeTruthy();
  });
  
  it('allows sending a message', async () => {
    const { getByPlaceholderText, getByText } = render(
      createTestNavigationContainer({
        AIAgentChat: AIAgentChatScreen
      })
    );
    
    const input = getByPlaceholderText('Mesajınızı yazın...');
    fireEvent.changeText(input, 'Merhaba');
    
    const sendButton = getByText('');  // Icon button doesn't have text
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(getByText('Merhaba')).toBeTruthy();
    });
  });
  
  it('shows campaign suggestions when mentioning campaigns', async () => {
    const { getByPlaceholderText, getByText } = render(
      createTestNavigationContainer({
        AIAgentChat: AIAgentChatScreen
      })
    );
    
    const input = getByPlaceholderText('Mesajınızı yazın...');
    fireEvent.changeText(input, 'Kampanya oluşturmak istiyorum');
    
    const sendButton = getByText('');  // Icon button doesn't have text
    fireEvent.press(sendButton);
    
    await waitFor(() => {
      expect(getByText('Size yardımcı olmak için bir kampanya oluşturabilirim. Ne tür bir kampanya düşünüyorsunuz?')).toBeTruthy();
      expect(getByText('Instagram kampanyası')).toBeTruthy();
      expect(getByText('Facebook reklamı')).toBeTruthy();
      expect(getByText('Multi-platform kampanya')).toBeTruthy();
    });
  });
  
  it('handles suggestion taps', async () => {
    const { getByText } = render(
      createTestNavigationContainer({
        AIAgentChat: AIAgentChatScreen
      })
    );
    
    // Wait for welcome message with suggestions
    await waitFor(() => {
      expect(getByText('Kampanya oluştur')).toBeTruthy();
    });
    
    // Tap on a suggestion
    fireEvent.press(getByText('Kampanya oluştur'));
    
    // Wait for AI response
    await waitFor(() => {
      expect(getByText(/Size yardımcı olmak için bir kampanya oluşturabilirim/)).toBeTruthy();
    });
  });
});
/**
 * Navigation Integration Tests
 * Tests for navigation flow, deep linking, and parameter validation
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import { Text, View, Button } from 'react-native';
import { linkingConfig, DeepLinkBuilder, DeepLinkParser, ParameterValidator } from '../linking';
import { useParameterValidation, useSafeNavigationWithValidation } from '../validation';
import { Logger } from '@/shared/utils/debug-helpers';

// Mock Logger
jest.mock('@/shared/utils/debug-helpers', () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock Expo Linking
jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  createURL: jest.fn(path => `advantage://${path}`),
  parseURL: jest.fn(),
  openURL: jest.fn(),
}));

// Create test screens
const TestScreen = ({ route, navigation }: any) => {
  const { isValid, errors } = useParameterValidation();
  const { navigateWithValidation } = useSafeNavigationWithValidation();
  
  const params = route.params || {};
  
  return (
    <View testID="test-screen">
      <Text testID="screen-name">{route.name}</Text>
      <Text testID="params">{JSON.stringify(params)}</Text>
      <Text testID="validation-status">{isValid ? 'Valid' : 'Invalid'}</Text>
      <Text testID="validation-errors">{JSON.stringify(errors)}</Text>
      
      <Button 
        testID="navigate-button"
        title="Navigate"
        onPress={() => navigateWithValidation('CampaignDetails', { campaignId: 'test-123' })}
      />
      
      <Button 
        testID="navigate-invalid-button"
        title="Navigate Invalid"
        onPress={() => navigateWithValidation('CampaignDetails', { campaignId: '' })}
      />
      
      <Button 
        testID="navigate-email-button"
        title="Navigate Email"
        onPress={() => navigateWithValidation('EmailVerification', { email: 'test@example.com' })}
      />
    </View>
  );
};

const CampaignDetailsScreen = ({ route }: any) => {
  const { isValid, errors } = useParameterValidation();
  const params = route.params || {};
  
  return (
    <View testID="campaign-details-screen">
      <Text testID="campaign-id">{params.campaignId || 'No ID'}</Text>
      <Text testID="validation-status">{isValid ? 'Valid' : 'Invalid'}</Text>
      <Text testID="validation-errors">{JSON.stringify(errors)}</Text>
    </View>
  );
};

const EmailVerificationScreen = ({ route }: any) => {
  const { isValid, errors } = useParameterValidation();
  const params = route.params || {};
  
  return (
    <View testID="email-verification-screen">
      <Text testID="email">{params.email || 'No Email'}</Text>
      <Text testID="validation-status">{isValid ? 'Valid' : 'Invalid'}</Text>
      <Text testID="validation-errors">{JSON.stringify(errors)}</Text>
    </View>
  );
};

// Create test navigator
const Stack = createStackNavigator();

const TestNavigator = () => (
  <NavigationContainer linking={linkingConfig}>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={TestScreen} />
      <Stack.Screen name="CampaignDetails" component={CampaignDetailsScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Navigation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should navigate with valid parameters', async () => {
    const { getByTestId, findByTestId } = render(<TestNavigator />);
    
    // Navigate to CampaignDetails with valid parameters
    fireEvent.press(getByTestId('navigate-button'));
    
    // Wait for navigation to complete
    const campaignIdText = await findByTestId('campaign-id');
    const validationStatus = await findByTestId('validation-status');
    
    expect(campaignIdText.props.children).toBe('test-123');
    expect(validationStatus.props.children).toBe('Valid');
  });
  
  it('should validate parameters during navigation', async () => {
    const { getByTestId } = render(<TestNavigator />);
    
    // Try to navigate with invalid parameters
    fireEvent.press(getByTestId('navigate-invalid-button'));
    
    // Should stay on the same screen (validation failed)
    expect(getByTestId('screen-name').props.children).toBe('Home');
    
    // Logger should have been called with warning
    expect(Logger.warn).toHaveBeenCalled();
  });
  
  it('should navigate to EmailVerification with valid email', async () => {
    const { getByTestId, findByTestId } = render(<TestNavigator />);
    
    // Navigate to EmailVerification with valid email
    fireEvent.press(getByTestId('navigate-email-button'));
    
    // Wait for navigation to complete
    const emailText = await findByTestId('email');
    const validationStatus = await findByTestId('validation-status');
    
    expect(emailText.props.children).toBe('test@example.com');
    expect(validationStatus.props.children).toBe('Valid');
  });
  
  it('should handle deep linking with valid parameters', async () => {
    // Mock initial URL
    (Linking.getInitialURL as jest.Mock).mockResolvedValueOnce('advantage://campaigns/test-456');
    
    const { findByTestId } = render(<TestNavigator />);
    
    // Wait for deep link to be processed
    const campaignIdText = await findByTestId('campaign-id');
    const validationStatus = await findByTestId('validation-status');
    
    expect(campaignIdText.props.children).toBe('test-456');
    expect(validationStatus.props.children).toBe('Valid');
  });
  
  it('should handle deep linking with email verification', async () => {
    // Mock initial URL
    (Linking.getInitialURL as jest.Mock).mockResolvedValueOnce('advantage://verify-email/user%40example.com');
    
    const { findByTestId } = render(<TestNavigator />);
    
    // Wait for deep link to be processed
    const emailText = await findByTestId('email');
    const validationStatus = await findByTestId('validation-status');
    
    expect(emailText.props.children).toBe('user@example.com');
    expect(validationStatus.props.children).toBe('Valid');
  });
});

describe('DeepLinkParser', () => {
  it('should parse campaign detail URLs correctly', () => {
    const url = 'advantage://campaigns/campaign-123';
    const route = DeepLinkParser.getRouteFromUrl(url);
    
    expect(route).not.toBeNull();
    expect(route?.name).toBe('CampaignDetails');
    expect(route?.params?.campaignId).toBe('campaign-123');
  });
  
  it('should parse email verification URLs correctly', () => {
    const url = 'advantage://verify-email/test%40example.com';
    const route = DeepLinkParser.getRouteFromUrl(url);
    
    expect(route).not.toBeNull();
    expect(route?.name).toBe('EmailVerification');
    expect(route?.params?.email).toBe('test@example.com');
  });
  
  it('should parse URLs with query parameters', () => {
    const url = 'advantage://campaigns/campaign-123?source=email&utm_medium=push';
    const parsed = DeepLinkParser.parseUrl(url);
    
    expect(parsed.query?.source).toBe('email');
    expect(parsed.query?.utm_medium).toBe('push');
    expect(parsed.params?.campaignId).toBe('campaign-123');
  });
  
  it('should handle invalid URLs gracefully', () => {
    const url = 'invalid-url';
    const route = DeepLinkParser.getRouteFromUrl(url);
    
    expect(route).toBeNull();
  });
  
  it('should identify app URLs correctly', () => {
    expect(DeepLinkParser.isAppUrl('advantage://campaigns')).toBe(true);
    expect(DeepLinkParser.isAppUrl('https://advantage.app/dashboard')).toBe(true);
    expect(DeepLinkParser.isAppUrl('https://google.com')).toBe(false);
  });
});

describe('DeepLinkBuilder', () => {
  it('should build campaign URLs correctly', () => {
    expect(DeepLinkBuilder.campaigns.details('campaign-123')).toBe('advantage://campaigns/campaign-123');
    expect(DeepLinkBuilder.campaigns.edit('campaign-456')).toBe('advantage://campaigns/campaign-456/edit');
  });
  
  it('should build email verification URLs correctly', () => {
    expect(DeepLinkBuilder.auth.emailVerification('test@example.com'))
      .toBe('advantage://verify-email/test%40example.com');
  });
  
  it('should build URLs with buildUrl helper', () => {
    expect(DeepLinkBuilder.buildUrl('campaigns/create')).toBe('advantage://campaigns/create');
    expect(DeepLinkBuilder.buildUrl('campaigns', { id: '123', source: 'email' }))
      .toContain('advantage://campaigns');
  });
});

describe('Parameter Validation Integration', () => {
  it('should validate campaign parameters correctly', () => {
    // Valid parameters
    const validResult = ParameterValidator.validateScreenParams('CampaignDetails', { campaignId: 'campaign-123' });
    expect(validResult.isValid).toBe(true);
    
    // Invalid parameters
    const invalidResult = ParameterValidator.validateScreenParams('CampaignDetails', { campaignId: '' });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
  
  it('should validate email verification parameters correctly', () => {
    // Valid parameters
    const validResult = ParameterValidator.validateScreenParams('EmailVerification', { email: 'test@example.com' });
    expect(validResult.isValid).toBe(true);
    
    // Invalid parameters
    const invalidResult = ParameterValidator.validateScreenParams('EmailVerification', { email: 'invalid-email' });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
  
  it('should handle screens without validation schema', () => {
    const result = ParameterValidator.validateScreenParams('Home', { someParam: 'value' });
    expect(result.isValid).toBe(true);
  });
  
  it('should handle undefined parameters gracefully', () => {
    const result = ParameterValidator.validateScreenParams('Home', undefined);
    expect(result.isValid).toBe(true);
  });
});
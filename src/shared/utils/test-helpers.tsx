/**
 * Test Helpers
 * Utility functions for testing
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { render } from '@testing-library/react-native';
import { linkingConfig } from '@/presentation/navigation/linking';
import { User } from '@/domain/entities/User';

/**
 * Creates a mock user for testing
 */
export const createMockUser = (overrides?: Partial<User>): User => {
  return {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    businessProfile: undefined,
    ...overrides,
  };
};

/**
 * Creates a test navigation container with the provided screens
 */
export const createTestNavigationContainer = (screens: Record<string, React.ComponentType<any>>) => {
  const Stack = createStackNavigator();
  
  return (
    <NavigationContainer linking={linkingConfig}>
      <Stack.Navigator>
        {Object.entries(screens).map(([name, component]) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/**
 * Renders a component with navigation container
 */
export const renderWithNavigation = (
  screens: Record<string, React.ComponentType<any>>,
  options?: {
    initialRouteName?: string;
    initialParams?: Record<string, unknown>;
  }
) => {
  const Stack = createStackNavigator();
  
  const NavigationWrapper = () => (
    <NavigationContainer linking={linkingConfig}>
      <Stack.Navigator initialRouteName={options?.initialRouteName}>
        {Object.entries(screens).map(([name, component]) => (
          <Stack.Screen 
            key={name} 
            name={name} 
            component={component} 
            initialParams={name === options?.initialRouteName ? options?.initialParams : undefined}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
  
  return render(<NavigationWrapper />);
};

/**
 * Creates a mock deep link URL
 */
export const createDeepLink = (path: string, params?: Record<string, string>): string => {
  let url = `advantage://${path}`;
  
  if (params && Object.keys(params).length > 0) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    url += `?${queryParams.toString()}`;
  }
  
  return url;
};

/**
 * Waits for a specified time
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Creates a mock navigation object
 */
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  dispatch: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
});

/**
 * Creates a mock route object
 */
export const createMockRoute = (name: string, params?: Record<string, unknown>) => ({
  key: `${name}-${Date.now()}`,
  name,
  params: params || {},
});

/**
 * Test wrapper for navigation hooks
 */
export const TestNavigationHookWrapper = ({ 
  children, 
  routeName = 'Test', 
  params = {} 
}: { 
  children: React.ReactNode; 
  routeName?: string;
  params?: Record<string, unknown>;
}) => {
  const mockNavigation = createMockNavigation();
  const mockRoute = createMockRoute(routeName, params);
  
  // Mock the useNavigation and useRoute hooks
  jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => mockNavigation,
    useRoute: () => mockRoute,
  }));
  
  return <>{children}</>;
};
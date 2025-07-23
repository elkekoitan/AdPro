/**
 * Test Setup Configuration
 * Global test setup for Jest and React Native Testing Library
 */

import 'react-native-gesture-handler/jestSetup';

// Define global types for Jest
declare global {
  namespace NodeJS {
    interface Global {
      console: Console;
    }
  }
}

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Animated API
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'http://localhost:3000',
      },
    },
  },
}));

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Global test utilities
global.console = {
  ...console,
  // Suppress console.warn in tests unless explicitly needed
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers for async tests
jest.useFakeTimers();

// Setup for async tests
beforeEach(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
});

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

// Increase timeout for async operations
jest.setTimeout(30000);
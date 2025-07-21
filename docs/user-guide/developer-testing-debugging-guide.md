# Developer Testing and Debugging Guide

## Introduction

This guide provides comprehensive instructions for testing and debugging the AdVantage application. It covers all aspects of the testing process, debugging tools, and best practices for ensuring application quality.

## Table of Contents

1. [Testing Framework Overview](#testing-framework-overview)
2. [Setting Up the Testing Environment](#setting-up-the-testing-environment)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Debugging Tools](#debugging-tools)
6. [Performance Monitoring](#performance-monitoring)
7. [Error Handling](#error-handling)
8. [Cross-Platform Testing](#cross-platform-testing)
9. [Accessibility Testing](#accessibility-testing)
10. [Continuous Integration](#continuous-integration)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

## Testing Framework Overview

The AdVantage application uses a comprehensive testing framework that includes:

### Unit Testing
- **Framework**: Jest + React Testing Library
- **Purpose**: Test individual components, services, and utilities in isolation
- **Location**: Co-located with source files (`__tests__` directories or `.test.ts` files)

### Integration Testing
- **Framework**: Jest + React Testing Library
- **Purpose**: Test interactions between components and services
- **Location**: `src/presentation/screens/__tests__`, `src/presentation/navigation/__tests__`

### End-to-End Testing
- **Framework**: Detox
- **Purpose**: Test complete user flows from a user's perspective
- **Location**: `e2e/tests`

### Performance Testing
- **Tools**: React Native Performance Monitor, Flipper
- **Purpose**: Monitor and optimize application performance
- **Location**: `src/shared/utils/performance-monitoring.ts`

## Setting Up the Testing Environment

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Xcode (for iOS tests)
- Android Studio (for Android tests)
- Detox CLI (`npm install -g detox-cli`)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/advantage-app.git
   cd advantage-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.test
   # Edit .env.test with appropriate values
   ```

### Test Configuration

The test configuration is defined in the following files:

- **Jest Configuration**: `jest.config.js`
- **Detox Configuration**: `.detoxrc.js`
- **Test Setup**: `src/shared/utils/test-setup.ts`

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific tests
npm test -- -t "ComponentName"
npm test -- path/to/file.test.ts
```

### End-to-End Tests

```bash
# Build for E2E tests
npm run test:e2e:build -- --configuration ios.sim.debug
npm run test:e2e:build -- --configuration android.emu.debug

# Run all E2E tests
npm run test:e2e:ios
npm run test:e2e:android

# Run specific E2E tests
npm run test:e2e:auth
npm run test:e2e:dashboard
npm run test:e2e:campaign
npm run test:e2e:workflow
```

### Performance Tests

```bash
# Run performance monitoring
npm run analyze:performance

# Analyze bundle size
npm run analyze:bundle
```

## Writing Tests

### Unit Tests

Unit tests should focus on testing individual components, services, or utilities in isolation. Here's an example of a unit test for a component:

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button title="Test Button" onPress={() => {}} />);
    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button title="Test Button" onPress={onPress} />);
    fireEvent.press(screen.getByText('Test Button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Integration Tests

Integration tests should focus on testing interactions between components and services. Here's an example of an integration test for a screen:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { AuthService } from '../../services/AuthService';

// Mock the auth service
jest.mock('../../services/AuthService');

describe('LoginScreen', () => {
  it('logs in the user when valid credentials are provided', async () => {
    // Mock the login method
    AuthService.login = jest.fn().mockResolvedValue({ success: true });

    render(<LoginScreen />);

    // Fill in the form
    fireEvent.changeText(screen.getByTestId('emailInput'), 'test@example.com');
    fireEvent.changeText(screen.getByTestId('passwordInput'), 'password123');

    // Submit the form
    fireEvent.press(screen.getByTestId('loginButton'));

    // Wait for the login to complete
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
```

### End-to-End Tests

End-to-end tests should focus on testing complete user flows from a user's perspective. Here's an example of an E2E test:

```typescript
import { device, element, by, expect } from 'detox';
import { TestHelpers } from '../setup';

describe('Authentication Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should allow a user to login successfully', async () => {
    // Navigate to login screen
    await TestHelpers.waitForElement('welcomeScreen');
    await TestHelpers.tapOn('loginButton');
    
    // Fill out login form
    await TestHelpers.waitForElement('loginScreen');
    await TestHelpers.typeIntoField('emailInput', 'user@example.com');
    await TestHelpers.typeIntoField('passwordInput', 'Password123!');
    
    // Submit login form
    await TestHelpers.tapOn('loginButton');
    
    // Verify dashboard screen appears
    await TestHelpers.waitForElement('dashboardScreen');
    await TestHelpers.expectTextToBeVisible('Welcome back');
  });
});
```

## Debugging Tools

The AdVantage application includes several debugging tools to help identify and fix issues:

### React Native Debugger

The React Native Debugger is a standalone app that provides a debugging interface for React Native applications.

#### Setup

1. Install React Native Debugger:
   ```bash
   # macOS
   brew install --cask react-native-debugger
   
   # Windows/Linux
   # Download from https://github.com/jhen0409/react-native-debugger/releases
   ```

2. Start React Native Debugger:
   ```bash
   open "rndebugger://set-debugger-loc?host=localhost&port=8081"
   ```

3. Enable debugging in the app:
   ```javascript
   // In the app, shake the device or press Cmd+D (iOS) or Cmd+M (Android)
   // Select "Debug JS Remotely"
   ```

#### Features

- JavaScript debugging
- React DevTools integration
- Redux/Zustand DevTools integration
- Network request inspection
- Console logs

### Flipper

Flipper is a platform for debugging mobile apps.

#### Setup

1. Install Flipper:
   ```bash
   # macOS
   brew install --cask flipper
   
   # Windows/Linux
   # Download from https://fbflipper.com/
   ```

2. Start Flipper and connect to your device or emulator.

#### Features

- Layout inspection
- Network inspection
- Crash reporter
- React DevTools integration
- Performance monitoring
- Custom plugins

### Custom Debugging Tools

The AdVantage application includes custom debugging tools in `src/shared/utils/debugging`:

```typescript
// Initialize debugging tools
import { initializeDebuggingTools } from 'src/shared/utils/debugging';

initializeDebuggingTools({
  enableReactDevTools: true,
  enableFlipperIntegration: true,
  enableNetworkInspector: true,
  enableReduxDevTools: true,
  enableComponentInspector: true,
  enablePerformanceMonitoring: true,
  enableCrashReporting: true,
  enableCustomDevMenu: true,
  enableRemoteDebugging: true,
  enableStrictMode: true,
  enableVerboseLogging: true,
  enableTestIds: true
});
```

## Performance Monitoring

The AdVantage application includes tools for monitoring and optimizing performance:

### Performance Metrics

- **App Startup Time**: Time from app launch to interactive
- **Screen Transition Time**: Time to navigate between screens
- **API Response Time**: Time for API requests to complete
- **Memory Usage**: Memory consumed by the app
- **Battery Usage**: Battery consumed by the app
- **Bundle Size**: Size of the JavaScript bundle

### Performance Monitoring Tools

#### React Native Performance Monitor

```typescript
import { PerformanceMonitor } from 'src/shared/utils/performance-monitoring';

// Start monitoring
PerformanceMonitor.startScreenTransition('DashboardScreen');

// End monitoring
PerformanceMonitor.endScreenTransition('DashboardScreen');

// Get metrics
const metrics = PerformanceMonitor.getMetrics();
console.log(metrics);
```

#### Bundle Analyzer

```bash
# Analyze bundle size
npm run analyze:bundle
```

#### Memory Monitor

```typescript
import { MemoryMonitor } from 'src/shared/utils/memory-monitor';

// Start monitoring
MemoryMonitor.startMonitoring();

// Get memory usage
const memoryUsage = MemoryMonitor.getMemoryUsage();
console.log(memoryUsage);

// Stop monitoring
MemoryMonitor.stopMonitoring();
```

## Error Handling

The AdVantage application includes a comprehensive error handling system:

### Error Boundary

The Error Boundary component catches JavaScript errors in the component tree and displays a fallback UI:

```typescript
import { ErrorBoundary } from 'src/presentation/components/error/ErrorBoundary';

// Wrap components with ErrorBoundary
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Network Error Handling

The Network Error Handler intercepts network errors and provides retry functionality:

```typescript
import { NetworkErrorHandler } from 'src/shared/utils/network-error-handler';

// Configure network error handling
NetworkErrorHandler.configure({
  retryAttempts: 3,
  retryDelay: 1000,
  timeoutDuration: 10000,
  showUserFriendlyMessages: true
});

// Handle network errors
try {
  await api.fetchData();
} catch (error) {
  NetworkErrorHandler.handleError(error);
}
```

### Form Validation

The Form Validation system provides real-time validation feedback:

```typescript
import { useFormValidation } from 'src/presentation/hooks/useFormValidation';

// Use form validation
const { validate, errors } = useFormValidation({
  email: {
    required: true,
    email: true
  },
  password: {
    required: true,
    minLength: 8
  }
});

// Validate form
const isValid = validate({ email, password });
```

## Cross-Platform Testing

The AdVantage application supports both iOS and Android platforms. Here's how to test for platform-specific issues:

### iOS-Specific Testing

```typescript
import { Platform } from 'react-native';

// Check if running on iOS
if (Platform.OS === 'ios') {
  // iOS-specific code
}

// iOS-specific components
import { IOSStatusBar } from 'src/presentation/components/platform-specific/IOSStatusBar';
import { IOSKeyboardAvoidingView } from 'src/presentation/components/platform-specific/IOSKeyboardAvoidingView';
import { IOSSafeAreaView } from 'src/presentation/components/platform-specific/IOSSafeAreaView';
```

### Android-Specific Testing

```typescript
import { Platform } from 'react-native';

// Check if running on Android
if (Platform.OS === 'android') {
  // Android-specific code
}

// Android-specific components
import { AndroidStatusBar } from 'src/presentation/components/platform-specific/AndroidStatusBar';
import { AndroidBackHandler } from 'src/presentation/components/platform-specific/AndroidBackHandler';
import { AndroidRipple } from 'src/presentation/components/platform-specific/AndroidRipple';
```

### Platform-Specific Utilities

```typescript
// iOS utilities
import { iosAuth } from 'src/shared/utils/platform-specific/ios-auth';
import { iosGestures } from 'src/shared/utils/platform-specific/ios-gestures';
import { iosStyles } from 'src/shared/utils/platform-specific/ios-styles';
import { iosUtils } from 'src/shared/utils/platform-specific/ios-utils';

// Android utilities
import { androidAuth } from 'src/shared/utils/platform-specific/android-auth';
import { androidStyles } from 'src/shared/utils/platform-specific/android-styles';
import { androidUtils } from 'src/shared/utils/platform-specific/android-utils';
```

## Accessibility Testing

The AdVantage application includes tools for testing and improving accessibility:

### Accessibility Testing Tools

```typescript
import { AccessibilityTesting } from 'src/shared/utils/accessibility-testing';

// Test accessibility
const accessibilityIssues = AccessibilityTesting.testComponent(component);
console.log(accessibilityIssues);
```

### Accessibility Hooks

```typescript
import { useAccessibility } from 'src/presentation/hooks/useAccessibility';

// Use accessibility hook
const { isScreenReaderEnabled, announce } = useAccessibility();

// Announce changes to screen reader
announce('Item added to cart');
```

### Accessible Components

```typescript
// Accessible components
import { AccessibleButton } from 'src/presentation/components/ui/AccessibleButton';
import { AccessibleImage } from 'src/presentation/components/ui/AccessibleImage';
import { AccessibleTextInput } from 'src/presentation/components/ui/AccessibleTextInput';
```

## Continuous Integration

The AdVantage application uses GitHub Actions for continuous integration:

### CI Pipeline

The CI pipeline is defined in `.github/workflows/ci.yml` and includes the following jobs:

1. **Lint**: Runs ESLint and TypeScript type checking
2. **Test**: Runs unit and integration tests
3. **Build Android**: Builds the Android app
4. **Build iOS**: Builds the iOS app
5. **E2E Android**: Runs E2E tests on Android
6. **E2E iOS**: Runs E2E tests on iOS

### CD Pipeline

The CD pipeline is defined in `.github/workflows/cd.yml` and includes the following jobs:

1. **Build and Test**: Runs linting, type checking, and tests
2. **Build Android**: Builds the Android app
3. **Build iOS**: Builds the iOS app
4. **Deploy to Staging**: Deploys the app to the staging environment
5. **Deploy to Production**: Deploys the app to the production environment (only on tags)

## Best Practices

### Testing Best Practices

1. **Write Tests First**: Follow test-driven development (TDD) principles
2. **Keep Tests Simple**: Test one thing per test
3. **Use Descriptive Names**: Make test names clear and descriptive
4. **Mock External Dependencies**: Isolate tests from external services
5. **Test Edge Cases**: Include tests for error conditions and edge cases
6. **Maintain Test Independence**: Tests should not depend on each other
7. **Use Test IDs**: Add testID props to components for easier testing
8. **Test Accessibility**: Ensure components are accessible
9. **Test Performance**: Monitor and optimize performance
10. **Keep Tests Fast**: Optimize tests for speed

### Debugging Best Practices

1. **Use Breakpoints**: Set breakpoints to pause execution
2. **Log Strategically**: Use console.log for debugging
3. **Monitor Network Requests**: Use network inspectors
4. **Check Component State**: Use React DevTools
5. **Profile Performance**: Use performance monitoring tools
6. **Test on Real Devices**: Don't rely solely on emulators
7. **Use Error Boundaries**: Catch and handle errors
8. **Check Memory Usage**: Monitor for memory leaks
9. **Test Different Network Conditions**: Use network throttling
10. **Test Different Device Sizes**: Ensure responsive design

## Troubleshooting

### Common Issues and Solutions

#### Tests Failing in CI but Passing Locally

- **Issue**: Tests pass on local machine but fail in CI
- **Solution**: 
  - Check for environment-specific issues
  - Ensure all dependencies are installed in CI
  - Check for race conditions in async tests
  - Increase test timeouts if necessary

#### Detox Tests Failing

- **Issue**: E2E tests fail with Detox
- **Solution**:
  - Check that the app is built correctly
  - Ensure the emulator/simulator is running
  - Check for UI changes that might affect element selection
  - Increase timeouts for slow operations

#### Memory Leaks

- **Issue**: App memory usage increases over time
- **Solution**:
  - Check for unsubscribed listeners
  - Ensure all resources are cleaned up
  - Use the Memory Monitor to track memory usage
  - Use React DevTools to inspect component tree

#### Slow Performance

- **Issue**: App performance is slow
- **Solution**:
  - Use the Performance Monitor to identify bottlenecks
  - Optimize list rendering with FlatList
  - Reduce unnecessary re-renders
  - Optimize images and assets
  - Use memoization for expensive calculations

#### Network Errors

- **Issue**: API requests fail
- **Solution**:
  - Check network connectivity
  - Verify API endpoints
  - Check authentication tokens
  - Use the Network Error Handler for retry logic
  - Implement offline support

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Detox Documentation](https://github.com/wix/Detox/blob/master/docs/README.md)
- [React Native Performance Documentation](https://reactnative.dev/docs/performance)
- [React Native Debugging Documentation](https://reactnative.dev/docs/debugging)
- [Flipper Documentation](https://fbflipper.com/docs/getting-started/index)
- [React Native Accessibility Documentation](https://reactnative.dev/docs/accessibility)
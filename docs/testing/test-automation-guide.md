# Test Automation Guide

## Overview

This guide provides instructions for setting up and running automated tests for the AdVantage application. It covers unit tests, integration tests, end-to-end tests, and performance tests.

## Prerequisites

Before running automated tests, ensure you have the following installed:

- Node.js (v18 or later)
- npm (v8 or later)
- Xcode (for iOS tests)
- Android Studio (for Android tests)
- Detox CLI (`npm install -g detox-cli`)

## Setting Up the Test Environment

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

## Running Unit and Integration Tests

### Running All Tests

```bash
npm test
```

### Running Tests with Coverage

```bash
npm run test:coverage
```

### Running Specific Tests

```bash
# Run tests matching a pattern
npm test -- -t "ComponentName"

# Run tests in a specific file
npm test -- path/to/file.test.ts

# Run tests in watch mode
npm run test:watch
```

### Test Coverage Report

After running tests with coverage, you can view the coverage report in the `coverage` directory:

```bash
open coverage/lcov-report/index.html
```

## Running End-to-End Tests

### Building for E2E Tests

```bash
# Build for iOS
npm run test:e2e:build -- --configuration ios.sim.debug

# Build for Android
npm run test:e2e:build -- --configuration android.emu.debug
```

### Running E2E Tests

```bash
# Run all E2E tests on iOS
npm run test:e2e:ios

# Run all E2E tests on Android
npm run test:e2e:android

# Run specific E2E tests
npm run test:e2e:auth
npm run test:e2e:dashboard
npm run test:e2e:campaign
npm run test:e2e:workflow
```

### E2E Test Artifacts

E2E test artifacts (screenshots, videos, logs) are stored in the `e2e/artifacts` directory.

## Running Performance Tests

```bash
# Run performance monitoring
npm run analyze:performance

# Analyze bundle size
npm run analyze:bundle
```

## Continuous Integration

The application uses GitHub Actions for continuous integration. The CI pipeline runs the following jobs:

1. **Lint**: Runs ESLint and TypeScript type checking
2. **Test**: Runs unit and integration tests
3. **Build Android**: Builds the Android app
4. **Build iOS**: Builds the iOS app
5. **E2E Android**: Runs E2E tests on Android
6. **E2E iOS**: Runs E2E tests on iOS

The CI pipeline is configured in `.github/workflows/ci.yml`.

## Continuous Deployment

The application uses GitHub Actions for continuous deployment. The CD pipeline runs the following jobs:

1. **Build and Test**: Runs linting, type checking, and tests
2. **Build Android**: Builds the Android app
3. **Build iOS**: Builds the iOS app
4. **Deploy to Staging**: Deploys the app to the staging environment
5. **Deploy to Production**: Deploys the app to the production environment (only on tags)

The CD pipeline is configured in `.github/workflows/cd.yml`.

## Writing Tests

### Unit Tests

Unit tests are written using Jest and React Testing Library. They are located in `__tests__` directories or in files with `.test.ts` or `.spec.ts` extensions.

Example unit test:

```typescript
import { render, screen } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button title="Test Button" onPress={() => {}} />);
    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button title="Test Button" onPress={onPress} />);
    screen.getByText('Test Button').props.onPress();
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Integration Tests

Integration tests are written using Jest and React Testing Library. They test the interaction between multiple components or services.

Example integration test:

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

End-to-end tests are written using Detox. They test the application from a user's perspective.

Example E2E test:

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

## Best Practices

### Unit Tests

- Test one thing per test
- Use descriptive test names
- Mock external dependencies
- Keep tests fast and focused
- Use test-driven development (TDD) when appropriate

### Integration Tests

- Focus on testing component interactions
- Mock external services
- Test error handling
- Test loading states
- Test user interactions

### End-to-End Tests

- Focus on critical user flows
- Keep tests independent
- Use test IDs for element selection
- Handle async operations properly
- Clean up after tests

### Performance Tests

- Set clear performance targets
- Test on real devices when possible
- Test under various network conditions
- Monitor memory usage
- Track performance over time

## Troubleshooting

### Common Issues

#### Tests Failing in CI but Passing Locally

- Check for environment-specific issues
- Ensure all dependencies are installed in CI
- Check for race conditions in async tests
- Increase test timeouts if necessary

#### Detox Tests Failing

- Check that the app is built correctly
- Ensure the emulator/simulator is running
- Check for UI changes that might affect element selection
- Increase timeouts for slow operations

#### Memory Leaks in Tests

- Check for unsubscribed listeners
- Ensure all resources are cleaned up after tests
- Use the React DevTools to inspect component tree

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Detox Documentation](https://github.com/wix/Detox/blob/master/docs/README.md)
- [React Native Performance Documentation](https://reactnative.dev/docs/performance)
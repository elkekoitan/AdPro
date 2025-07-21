# End-to-End (E2E) Tests

This directory contains end-to-end tests for the AdVantage application using Detox.

## Test Structure

- `tests/` - Contains all E2E test files
  - `auth-flow.e2e.ts` - Tests for user authentication flows
  - `dashboard-navigation.e2e.ts` - Tests for dashboard navigation
  - `campaign-management.e2e.ts` - Tests for campaign creation and management
  - `complete-user-workflow.e2e.ts` - Tests for complete user journeys

- `utils/` - Contains utility functions and constants for tests
  - `test-ids.ts` - Constants for testID props used in the app
  - `mock-data.ts` - Mock data for tests
  - `test-utils.ts` - Utility functions for tests

## Running Tests

### Prerequisites

1. Make sure you have Detox CLI installed globally:
   ```
   npm install -g detox-cli
   ```

2. For iOS tests:
   - Xcode and iOS simulator
   - `applesimutils` installed via Homebrew:
     ```
     brew tap wix/brew
     brew install applesimutils
     ```

3. For Android tests:
   - Android Studio and Android emulator
   - Set up ANDROID_HOME environment variable

### Build the App for Testing

```bash
# Build for iOS
npm run test:e2e:build -- --configuration ios.sim.debug

# Build for Android
npm run test:e2e:build -- --configuration android.emu.debug
```

### Run Tests

```bash
# Run all tests on iOS
npm run test:e2e -- --configuration ios.sim.debug

# Run all tests on Android
npm run test:e2e -- --configuration android.emu.debug

# Run specific test file
npm run test:e2e -- --configuration ios.sim.debug --testNamePattern="Authentication Flow"

# Run specific test
npm run test:e2e -- --configuration ios.sim.debug --testNamePattern="should allow a user to login successfully"
```

## Writing Tests

### Test ID Conventions

All components that need to be accessed in E2E tests should have a `testID` prop. Use the constants from `test-ids.ts` for consistency.

Example:
```tsx
import { SCREEN_IDS, BUTTON_IDS } from '../e2e/utils/test-ids';

const LoginScreen = () => (
  <View testID={SCREEN_IDS.LOGIN_SCREEN}>
    <TextInput testID={INPUT_IDS.EMAIL_INPUT} />
    <TextInput testID={INPUT_IDS.PASSWORD_INPUT} />
    <Button testID={BUTTON_IDS.LOGIN_BUTTON} />
  </View>
);
```

### Test Structure

Follow this structure for E2E tests:

1. **Arrange** - Set up the test environment
2. **Act** - Perform the actions being tested
3. **Assert** - Verify the expected outcome

Example:
```typescript
it('should allow a user to login successfully', async () => {
  // Arrange
  await TestHelpers.waitForElement('welcomeScreen');
  await TestHelpers.tapOn('loginButton');
  
  // Act
  await TestHelpers.waitForElement('loginScreen');
  await TestHelpers.typeIntoField('emailInput', 'user@example.com');
  await TestHelpers.typeIntoField('passwordInput', 'Password123!');
  await TestHelpers.tapOn('loginButton');
  
  // Assert
  await TestHelpers.waitForElement('dashboardScreen');
  await TestHelpers.expectTextToBeVisible('Welcome back');
});
```

## Debugging Tests

### Taking Screenshots

Use `device.takeScreenshot()` to capture the screen state during test execution:

```typescript
await device.takeScreenshot('login-screen');
```

### Slowing Down Tests

Use `await new Promise(resolve => setTimeout(resolve, 1000))` to add delays for debugging.

### Logging

Use `console.log()` statements in your tests. Logs will appear in the terminal running the tests.

## Best Practices

1. **Keep tests independent** - Each test should be able to run on its own
2. **Clean up after tests** - Reset app state between tests
3. **Use test IDs** - Don't rely on text or other properties that might change
4. **Test real user flows** - Focus on testing complete user journeys
5. **Handle async properly** - Always await async operations
6. **Use helper functions** - Extract common operations into helper functions
7. **Mock external dependencies** - Use mock data for API calls
8. **Test error states** - Verify the app handles errors gracefully
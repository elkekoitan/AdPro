# Developer Troubleshooting Guide

## Introduction

This guide provides solutions to common development, testing, and debugging issues you might encounter while working with the AdVantage application. It's designed for developers, testers, and QA engineers to quickly identify and resolve problems.

## Table of Contents

1. [Development Environment Issues](#development-environment-issues)
2. [Build and Compilation Issues](#build-and-compilation-issues)
3. [Testing Issues](#testing-issues)
4. [Debugging Issues](#debugging-issues)
5. [Performance Issues](#performance-issues)
6. [Navigation Issues](#navigation-issues)
7. [State Management Issues](#state-management-issues)
8. [API and Network Issues](#api-and-network-issues)
9. [Platform-Specific Issues](#platform-specific-issues)
10. [Common Error Messages](#common-error-messages)

## Development Environment Setup

### Node.js and npm Issues

**Issue**: Incompatible Node.js version

**Symptoms**:
- Error messages about unsupported Node.js version
- Package installation failures
- Build failures with cryptic errors

**Solutions**:
1. Check the required Node.js version in `package.json`
2. Install the correct Node.js version using nvm:
   ```bash
   nvm install 18
   nvm use 18
   ```
3. Verify installation with `node -v` and `npm -v`
4. Clear npm cache: `npm cache clean --force`
5. Reinstall dependencies: `rm -rf node_modules && npm install`

### React Native Environment Issues

**Issue**: React Native environment setup problems

**Symptoms**:
- Metro bundler fails to start
- Unable to connect to development server
- Device/emulator connection issues

**Solutions**:
1. Check React Native environment setup:
   ```bash
   npx react-native doctor
   ```
2. Ensure Metro bundler is running:
   ```bash
   npx react-native start --reset-cache
   ```
3. Check device/emulator connection:
   ```bash
   adb devices  # For Android
   xcrun simctl list  # For iOS
   ```
4. Restart the development server and device/emulator
5. Clear watchman cache:
   ```bash
   watchman watch-del-all
   ```

### Expo Environment Issues

**Issue**: Expo configuration or dependency problems

**Symptoms**:
- Expo commands fail
- EAS build errors
- Expo Go app connection issues

**Solutions**:
1. Check Expo SDK version compatibility in `app.json`
2. Update Expo CLI:
   ```bash
   npm install -g expo-cli
   ```
3. Clear Expo cache:
   ```bash
   expo r -c
   ```
4. Verify Expo configuration:
   ```bash
   expo diagnostics
   ```
5. Check for Expo service status: [Expo Status](https://status.expo.dev/)

## Build and Compilation Issues

### TypeScript Errors

**Issue**: TypeScript compilation errors

**Symptoms**:
- Red squiggly lines in editor
- Build failures with type errors
- Missing type definitions

**Solutions**:
1. Check TypeScript configuration in `tsconfig.json`
2. Install missing type definitions:
   ```bash
   npm install --save-dev @types/missing-package
   ```
3. Run TypeScript compiler to see all errors:
   ```bash
   npx tsc --noEmit
   ```
4. Check for circular dependencies
5. Update TypeScript version if needed:
   ```bash
   npm install --save-dev typescript@latest
   ```

### Metro Bundler Issues

**Issue**: Metro bundler fails or crashes

**Symptoms**:
- "Unable to resolve module" errors
- Bundler hangs or crashes
- Slow bundling performance

**Solutions**:
1. Clear Metro cache:
   ```bash
   npx react-native start --reset-cache
   ```
2. Check `metro.config.js` configuration
3. Verify module paths and aliases
4. Check for large files or assets
5. Update Metro bundler:
   ```bash
   npm install --save-dev metro@latest
   ```

### Native Build Issues

**Issue**: iOS or Android build failures

**Symptoms**:
- Xcode build errors
- Gradle build failures
- Native module linking issues

**Solutions**:
#### iOS:
1. Clean Xcode build:
   ```bash
   cd ios && xcodebuild clean
   ```
2. Reinstall CocoaPods:
   ```bash
   cd ios && pod deintegrate && pod install
   ```
3. Check iOS deployment target in Xcode
4. Verify signing certificates and provisioning profiles
5. Check for native module compatibility issues

#### Android:
1. Clean Gradle build:
   ```bash
   cd android && ./gradlew clean
   ```
2. Check Gradle version in `android/gradle/wrapper/gradle-wrapper.properties`
3. Verify Android SDK versions in `android/build.gradle`
4. Check for native module compatibility issues
5. Ensure Java version compatibility (usually Java 11)

## Testing Issues

### Jest Test Failures

**Issue**: Jest tests fail unexpectedly

**Symptoms**:
- Test failures that pass locally but fail in CI
- Timeout errors in tests
- Mock function issues

**Solutions**:
1. Run tests in verbose mode:
   ```bash
   npm test -- --verbose
   ```
2. Check test setup in `src/shared/utils/test-setup.ts`
3. Verify mock implementations
4. Increase test timeout for async tests:
   ```javascript
   jest.setTimeout(10000);
   ```
5. Check for environment differences between local and CI

### React Testing Library Issues

**Issue**: Component testing problems

**Symptoms**:
- Unable to find elements
- Event simulation failures
- Async rendering issues

**Solutions**:
1. Use testID props for reliable element selection:
   ```jsx
   <Button testID="submit-button" />
   ```
2. Use proper queries:
   ```javascript
   screen.getByTestId('submit-button')  // Most reliable
   screen.getByText('Submit')  // Less reliable
   ```
3. Wait for async operations:
   ```javascript
   await waitFor(() => screen.getByText('Success'));
   ```
4. Check for proper event firing:
   ```javascript
   fireEvent.press(screen.getByTestId('submit-button'));
   ```
5. Use debug to see the rendered output:
   ```javascript
   screen.debug();
   ```

### Detox E2E Test Failures

**Issue**: End-to-end tests fail or are flaky

**Symptoms**:
- Tests pass sometimes but fail other times
- Element not found errors
- Timeout errors

**Solutions**:
1. Increase timeouts for slow operations:
   ```javascript
   await waitFor(element(by.id('element-id'))).toBeVisible().withTimeout(10000);
   ```
2. Use testID props consistently:
   ```jsx
   <Button testID="login-button" />
   ```
3. Add delays for animations:
   ```javascript
   await new Promise(resolve => setTimeout(resolve, 1000));
   ```
4. Check for device/emulator performance issues
5. Use the Detox recorder to debug test flows:
   ```bash
   npx detox recorder
   ```

### Test Coverage Issues

**Issue**: Low test coverage or coverage reporting problems

**Symptoms**:
- Coverage below targets
- Missing coverage for specific files
- Coverage report generation failures

**Solutions**:
1. Check Jest coverage configuration in `jest.config.js`
2. Run tests with coverage:
   ```bash
   npm run test:coverage
   ```
3. Identify uncovered code paths:
   ```bash
   open coverage/lcov-report/index.html
   ```
4. Add tests for uncovered code
5. Check for files excluded from coverage

## Debugging Issues

### React Native Debugger Connection

**Issue**: Unable to connect to React Native Debugger

**Symptoms**:
- Debugger doesn't connect
- "Unable to connect to remote debugger" message
- Debugger connects but doesn't show app state

**Solutions**:
1. Ensure debugger is running before starting the app
2. Enable remote debugging in the app:
   - Shake device or press Cmd+D (iOS) or Cmd+M (Android)
   - Select "Debug JS Remotely"
3. Check debugger port (default is 8081):
   ```bash
   open "rndebugger://set-debugger-loc?host=localhost&port=8081"
   ```
4. Disable other debuggers or browser devtools
5. Restart the app and debugger

### Flipper Connection Issues

**Issue**: Flipper doesn't connect or plugins don't work

**Symptoms**:
- Flipper doesn't detect the app
- Plugins don't load
- Connection drops frequently

**Solutions**:
1. Check Flipper installation and version
2. Verify Flipper dependencies in `package.json`
3. Check Android USB debugging is enabled
4. For iOS, check the device is trusted
5. Restart Flipper and the app
6. Clear Flipper cache:
   - Help > Clear All Stored Data

### Breakpoint Issues

**Issue**: Breakpoints not working or inconsistent

**Symptoms**:
- Breakpoints don't pause execution
- Breakpoints pause at wrong locations
- Variables not available in scope

**Solutions**:
1. Ensure source maps are correctly generated
2. Check if the code is minified or transformed
3. Try using `debugger` statements instead:
   ```javascript
   function myFunction() {
     debugger;  // Execution will pause here
     // rest of the function
   }
   ```
4. Restart the debugger and app
5. Check for source map configuration in `metro.config.js`

### Console Logging Issues

**Issue**: Console logs not appearing

**Symptoms**:
- `console.log` statements don't show output
- Logs appear in wrong order
- Logs show [object Object] instead of content

**Solutions**:
1. Check if logs are being filtered
2. Use better logging:
   ```javascript
   console.log('Object:', JSON.stringify(myObject, null, 2));
   ```
3. Use custom logger with levels:
   ```javascript
   import { getLogger } from '../logging';
   const logger = getLogger().createTaggedLogger('MyComponent');
   logger.info('This is an info message');
   logger.error('This is an error message');
   ```
4. Check if production mode is disabling logs
5. Use React Native Debugger's console tab

## Performance Issues

### Slow Rendering

**Issue**: UI renders slowly or with lag

**Symptoms**:
- Janky animations
- Delayed response to user input
- Frame drops

**Solutions**:
1. Use the Performance Monitor:
   ```javascript
   import { PerformanceMonitor } from 'src/shared/utils/performance-monitoring';
   PerformanceMonitor.startScreenTransition('MyScreen');
   // ... screen renders ...
   PerformanceMonitor.endScreenTransition('MyScreen');
   ```
2. Check for unnecessary re-renders:
   - Use React DevTools Profiler
   - Implement `React.memo` for functional components
   - Use `shouldComponentUpdate` for class components
3. Optimize list rendering:
   - Use `FlatList` instead of mapping arrays
   - Implement `getItemLayout` for fixed-size items
   - Use `keyExtractor` properly
4. Reduce component complexity
5. Use performance optimization hooks:
   ```javascript
   import { usePerformanceOptimization } from 'src/presentation/hooks/usePerformanceOptimization';
   const { optimizeList, optimizeImages } = usePerformanceOptimization();
   ```

### Memory Leaks

**Issue**: App memory usage increases over time

**Symptoms**:
- Increasing memory usage
- App crashes after extended use
- Slow performance over time

**Solutions**:
1. Monitor memory usage:
   ```javascript
   import { MemoryMonitor } from 'src/shared/utils/memory-monitor';
   MemoryMonitor.startMonitoring();
   const usage = MemoryMonitor.getMemoryUsage();
   console.log('Memory usage:', usage);
   ```
2. Check for unsubscribed listeners:
   ```javascript
   // Wrong
   useEffect(() => {
     const subscription = someEvent.subscribe(handler);
   }, []);
   
   // Correct
   useEffect(() => {
     const subscription = someEvent.subscribe(handler);
     return () => subscription.unsubscribe();
   }, []);
   ```
3. Avoid creating functions in render:
   ```javascript
   // Wrong
   <Button onPress={() => handlePress(id)} />
   
   // Better
   const handlePressItem = useCallback(() => handlePress(id), [id]);
   <Button onPress={handlePressItem} />
   ```
4. Clean up resources in `componentWillUnmount` or effect cleanup
5. Use the React DevTools Profiler to identify components that render too often

### Bundle Size Issues

**Issue**: Large JavaScript bundle size

**Symptoms**:
- Slow app startup
- Large app download size
- Out of memory errors during build

**Solutions**:
1. Analyze bundle size:
   ```bash
   npm run analyze:bundle
   ```
2. Use code splitting and lazy loading:
   ```javascript
   const LazyComponent = React.lazy(() => import('./LazyComponent'));
   ```
3. Remove unused dependencies
4. Use tree-shaking compatible imports:
   ```javascript
   // Wrong
   import lodash from 'lodash';
   
   // Better
   import get from 'lodash/get';
   ```
5. Optimize images and assets:
   ```javascript
   import { OptimizedImage } from 'src/presentation/components/ui/OptimizedImage';
   <OptimizedImage source={source} />
   ```

## Navigation Issues

### Navigation Type Errors

**Issue**: TypeScript errors in navigation

**Symptoms**:
- Type errors in navigation props
- Missing route parameters
- Incompatible navigation types

**Solutions**:
1. Define proper navigation types:
   ```typescript
   type RootStackParamList = {
     Home: undefined;
     Profile: { userId: string };
     Settings: undefined;
   };
   
   type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;
   ```
2. Use typed navigation hooks:
   ```typescript
   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
   const route = useRoute<RouteProp<RootStackParamList, 'Profile'>>();
   ```
3. Check for circular dependencies in navigation files
4. Verify React Navigation version compatibility
5. Use the navigation validation utility:
   ```typescript
   import { validateNavigation } from 'src/presentation/navigation/validation';
   validateNavigation(navigation, route);
   ```

### Navigation State Issues

**Issue**: Navigation state not updating or incorrect

**Symptoms**:
- Wrong screen displayed
- Navigation state resets unexpectedly
- Back button behavior issues

**Solutions**:
1. Check navigation state persistence:
   ```javascript
   const persistenceKey = 'navigation-state';
   <NavigationContainer
     initialState={initialState}
     onStateChange={(state) => AsyncStorage.setItem(persistenceKey, JSON.stringify(state))}
   >
   ```
2. Verify navigation guards:
   ```javascript
   import { useNavigationGuards } from 'src/presentation/navigation/guards';
   useNavigationGuards(navigation, route);
   ```
3. Check for conflicting navigation actions
4. Ensure proper navigation hierarchy
5. Use navigation events for debugging:
   ```javascript
   React.useEffect(() => {
     const unsubscribe = navigation.addListener('state', (e) => {
       console.log('Navigation state changed:', e.data);
     });
     return unsubscribe;
   }, [navigation]);
   ```

### Deep Linking Issues

**Issue**: Deep links not working properly

**Symptoms**:
- App doesn't open from deep links
- Deep links open wrong screen
- Parameters not passed correctly

**Solutions**:
1. Check deep link configuration:
   ```javascript
   // In app.json
   "expo": {
     "scheme": "advantage",
     "linking": {
       "prefixes": ["advantage://", "https://advantage-app.com"],
       "config": {
         "screens": {
           "Home": "home",
           "Profile": {
             "path": "profile/:userId",
             "parse": {
               "userId": (userId) => userId
             }
           }
         }
       }
     }
   }
   ```
2. Test deep links:
   ```bash
   # iOS
   xcrun simctl openurl booted "advantage://profile/123"
   
   # Android
   adb shell am start -W -a android.intent.action.VIEW -d "advantage://profile/123"
   ```
3. Check platform-specific setup:
   - iOS: Associated Domains in Xcode
   - Android: Intent filters in AndroidManifest.xml
4. Verify linking configuration in `src/presentation/navigation/linking.ts`
5. Use the linking testing utility:
   ```javascript
   import { testDeepLink } from 'src/presentation/navigation/__tests__/linking.test';
   testDeepLink('advantage://profile/123');
   ```

## State Management Issues

### Zustand Store Issues

**Issue**: State not updating or incorrect

**Symptoms**:
- UI doesn't reflect state changes
- State resets unexpectedly
- Multiple stores conflict

**Solutions**:
1. Check store implementation:
   ```typescript
   import create from 'zustand';
   
   interface AuthState {
     user: User | null;
     setUser: (user: User | null) => void;
   }
   
   export const useAuthStore = create<AuthState>((set) => ({
     user: null,
     setUser: (user) => set({ user }),
   }));
   ```
2. Use selectors for performance:
   ```typescript
   // Wrong
   const user = useAuthStore(state => state.user);
   
   // Better
   const user = useAuthStore(useCallback(state => state.user, []));
   ```
3. Check for store persistence issues:
   ```typescript
   import { persist } from 'zustand/middleware';
   
   export const useAuthStore = create(
     persist(
       (set) => ({
         user: null,
         setUser: (user) => set({ user }),
       }),
       {
         name: 'auth-storage',
         getStorage: () => AsyncStorage,
       }
     )
   );
   ```
4. Verify store initialization timing
5. Use the Zustand DevTools for debugging:
   ```typescript
   import { devtools } from 'zustand/middleware';
   
   export const useAuthStore = create(
     devtools(
       (set) => ({
         user: null,
         setUser: (user) => set({ user }),
       }),
       { name: 'Auth Store' }
     )
   );
   ```

### React Query Issues

**Issue**: Data fetching or caching problems

**Symptoms**:
- Data not loading
- Stale data displayed
- Infinite loading states

**Solutions**:
1. Check query configuration:
   ```typescript
   const { data, isLoading, error } = useQuery({
     queryKey: ['user', userId],
     queryFn: () => fetchUser(userId),
     staleTime: 5 * 60 * 1000, // 5 minutes
     cacheTime: 60 * 60 * 1000, // 1 hour
   });
   ```
2. Verify query keys are consistent
3. Handle loading and error states:
   ```typescript
   if (isLoading) return <LoadingSpinner />;
   if (error) return <ErrorMessage error={error} />;
   ```
4. Use the React Query DevTools:
   ```jsx
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   
   function App() {
     return (
       <QueryClientProvider client={queryClient}>
         {/* Your app components */}
         <ReactQueryDevtools />
       </QueryClientProvider>
     );
   }
   ```
5. Check for query invalidation issues:
   ```typescript
   const queryClient = useQueryClient();
   queryClient.invalidateQueries({ queryKey: ['user', userId] });
   ```

### Form State Issues

**Issue**: Form validation or submission problems

**Symptoms**:
- Validation errors not showing
- Form submission fails
- Form state resets unexpectedly

**Solutions**:
1. Check form validation setup:
   ```typescript
   import { useFormValidation } from 'src/presentation/hooks/useFormValidation';
   
   const { validate, errors } = useFormValidation({
     email: {
       required: true,
       email: true,
     },
     password: {
       required: true,
       minLength: 8,
     },
   });
   
   const isValid = validate({ email, password });
   ```
2. Verify form submission logic:
   ```typescript
   const handleSubmit = async () => {
     if (!validate({ email, password })) {
       return;
     }
     
     try {
       setSubmitting(true);
       await authService.login(email, password);
       navigation.navigate('Home');
     } catch (error) {
       setError(error.message);
     } finally {
       setSubmitting(false);
     }
   };
   ```
3. Check for form reset issues:
   ```typescript
   const resetForm = () => {
     setEmail('');
     setPassword('');
     setErrors({});
   };
   ```
4. Use the form validation testing utility:
   ```typescript
   import { testFormValidation } from 'src/shared/utils/__tests__/form-validation.test';
   testFormValidation({ email: 'invalid-email', password: '123' });
   ```
5. Check for unintended re-renders causing form state loss

## API and Network Issues

### API Request Failures

**Issue**: API requests fail or return errors

**Symptoms**:
- Network request errors
- Timeout errors
- Authentication failures

**Solutions**:
1. Check API endpoint configuration:
   ```typescript
   const API_URL = 'https://api.advantage-app.com';
   ```
2. Verify authentication tokens:
   ```typescript
   const headers = {
     'Authorization': `Bearer ${token}`,
     'Content-Type': 'application/json',
   };
   ```
3. Implement retry logic:
   ```typescript
   import { NetworkErrorHandler } from 'src/shared/utils/network-error-handler';
   
   try {
     await api.fetchData();
   } catch (error) {
     NetworkErrorHandler.handleError(error);
   }
   ```
4. Check for CORS issues (web only)
5. Use the network inspector to debug requests:
   ```javascript
   // In Flipper or React Native Debugger
   ```

### Offline Support Issues

**Issue**: App doesn't work properly offline

**Symptoms**:
- App crashes when offline
- Data not available offline
- Pending operations not syncing

**Solutions**:
1. Check offline detection:
   ```typescript
   import { useNetworkStatus } from 'src/presentation/hooks/useNetworkStatus';
   
   const { isConnected, isInternetReachable } = useNetworkStatus();
   ```
2. Implement offline notification:
   ```jsx
   import { OfflineNotification } from 'src/presentation/components/feedback/OfflineNotification';
   
   {!isConnected && <OfflineNotification />}
   ```
3. Use offline cache:
   ```typescript
   import { OfflineCache } from 'src/shared/utils/offline-cache';
   
   // Store data in cache
   await OfflineCache.set('user', userData);
   
   // Get data from cache
   const cachedUser = await OfflineCache.get('user');
   ```
4. Implement offline API client:
   ```typescript
   import { OfflineApiClient } from 'src/shared/utils/offline-api-client';
   
   const apiClient = new OfflineApiClient();
   const data = await apiClient.get('/users');
   ```
5. Use offline sync:
   ```typescript
   import { useOfflineSync } from 'src/presentation/hooks/useOfflineSync';
   
   const { syncPendingOperations } = useOfflineSync();
   
   // Sync when back online
   useEffect(() => {
     if (isConnected) {
       syncPendingOperations();
     }
   }, [isConnected, syncPendingOperations]);
   ```

### Authentication Issues

**Issue**: Authentication problems

**Symptoms**:
- Unable to log in
- Session expires unexpectedly
- Token refresh failures

**Solutions**:
1. Check authentication service:
   ```typescript
   import { AuthService } from 'src/application/services/AuthService';
   
   try {
     await AuthService.login(email, password);
   } catch (error) {
     console.error('Login failed:', error);
   }
   ```
2. Verify token storage:
   ```typescript
   import { authStore } from 'src/application/stores/authStore';
   
   // Store token
   authStore.setToken(token);
   
   // Get token
   const token = authStore.getToken();
   ```
3. Implement token refresh:
   ```typescript
   import { AuthService } from 'src/application/services/AuthService';
   
   try {
     await AuthService.refreshToken();
   } catch (error) {
     // Token refresh failed, log out user
     AuthService.logout();
   }
   ```
4. Check for token expiration handling
5. Use the authentication testing utility:
   ```typescript
   import { testAuthentication } from 'src/application/usecases/auth/__tests__/AuthUseCase.test';
   testAuthentication(email, password);
   ```

## Platform-Specific Issues

### iOS-Specific Issues

**Issue**: Problems only on iOS devices

**Symptoms**:
- iOS-specific crashes
- Layout issues on iOS
- iOS-specific API failures

**Solutions**:
1. Check iOS-specific code:
   ```typescript
   import { Platform } from 'react-native';
   
   if (Platform.OS === 'ios') {
     // iOS-specific code
   }
   ```
2. Verify iOS permissions:
   ```xml
   <!-- In Info.plist -->
   <key>NSCameraUsageDescription</key>
   <string>We need access to your camera to take photos</string>
   ```
3. Check iOS-specific styles:
   ```typescript
   import { iosStyles } from 'src/shared/utils/platform-specific/ios-styles';
   
   const styles = StyleSheet.create({
     container: {
       ...commonStyles.container,
       ...Platform.select({
         ios: iosStyles.container,
       }),
     },
   });
   ```
4. Use iOS-specific components:
   ```jsx
   import { IOSStatusBar } from 'src/presentation/components/platform-specific/IOSStatusBar';
   import { IOSKeyboardAvoidingView } from 'src/presentation/components/platform-specific/IOSKeyboardAvoidingView';
   import { IOSSafeAreaView } from 'src/presentation/components/platform-specific/IOSSafeAreaView';
   
   <IOSSafeAreaView>
     <IOSStatusBar />
     <IOSKeyboardAvoidingView>
       {/* Content */}
     </IOSKeyboardAvoidingView>
   </IOSSafeAreaView>
   ```
5. Test on multiple iOS devices and versions

### Android-Specific Issues

**Issue**: Problems only on Android devices

**Symptoms**:
- Android-specific crashes
- Layout issues on Android
- Android-specific API failures

**Solutions**:
1. Check Android-specific code:
   ```typescript
   import { Platform } from 'react-native';
   
   if (Platform.OS === 'android') {
     // Android-specific code
   }
   ```
2. Verify Android permissions:
   ```xml
   <!-- In AndroidManifest.xml -->
   <uses-permission android:name="android.permission.CAMERA" />
   ```
3. Check Android-specific styles:
   ```typescript
   import { androidStyles } from 'src/shared/utils/platform-specific/android-styles';
   
   const styles = StyleSheet.create({
     container: {
       ...commonStyles.container,
       ...Platform.select({
         android: androidStyles.container,
       }),
     },
   });
   ```
4. Use Android-specific components:
   ```jsx
   import { AndroidStatusBar } from 'src/presentation/components/platform-specific/AndroidStatusBar';
   import { AndroidBackHandler } from 'src/presentation/components/platform-specific/AndroidBackHandler';
   import { AndroidRipple } from 'src/presentation/components/platform-specific/AndroidRipple';
   
   <View>
     <AndroidStatusBar />
     <AndroidBackHandler onBack={handleBack} />
     <AndroidRipple>
       {/* Content */}
     </AndroidRipple>
   </View>
   ```
5. Test on multiple Android devices and versions

## Common Error Messages

### "Unable to resolve module"

**Issue**: Metro bundler can't find a module

**Solutions**:
1. Check import path:
   ```typescript
   // Wrong
   import { Button } from './button';
   
   // Correct (if file is Button.tsx)
   import { Button } from './Button';
   ```
2. Check module installation:
   ```bash
   npm install missing-module
   ```
3. Clear Metro cache:
   ```bash
   npx react-native start --reset-cache
   ```
4. Check module aliases in `metro.config.js`
5. Check for circular dependencies

### "Invariant Violation: Native module not found"

**Issue**: Native module linking issue

**Solutions**:
1. Check module installation:
   ```bash
   npm install react-native-module
   ```
2. Link the module:
   ```bash
   npx react-native link react-native-module
   ```
3. Rebuild the app:
   ```bash
   npx react-native run-ios
   npx react-native run-android
   ```
4. Check module compatibility with React Native version
5. Check for manual linking steps in module documentation

### "TypeError: undefined is not an object"

**Issue**: Accessing properties of undefined

**Solutions**:
1. Use optional chaining:
   ```typescript
   // Wrong
   const name = user.profile.name;
   
   // Better
   const name = user?.profile?.name;
   ```
2. Add null checks:
   ```typescript
   if (user && user.profile) {
     const name = user.profile.name;
   }
   ```
3. Use default values:
   ```typescript
   const name = user?.profile?.name ?? 'Unknown';
   ```
4. Check component props:
   ```typescript
   function MyComponent({ user = {} }) {
     // ...
   }
   ```
5. Use TypeScript to catch these issues at compile time

### "Warning: Cannot update a component while rendering a different component"

**Issue**: State updates during render

**Solutions**:
1. Move state updates to effects:
   ```typescript
   // Wrong
   function MyComponent() {
     const [data, setData] = useState(null);
     if (!data) {
       setData(fetchData());  // Wrong: updating state during render
     }
     return <View>{data}</View>;
   }
   
   // Better
   function MyComponent() {
     const [data, setData] = useState(null);
     useEffect(() => {
       if (!data) {
         setData(fetchData());
       }
     }, [data]);
     return <View>{data}</View>;
   }
   ```
2. Use lazy initialization:
   ```typescript
   const [data, setData] = useState(() => {
     return fetchInitialData();
   });
   ```
3. Check for state updates in render methods
4. Use refs for values that don't trigger re-renders
5. Check for updates in child component renders

### "Maximum update depth exceeded"

**Issue**: Infinite render loop

**Solutions**:
1. Check effect dependencies:
   ```typescript
   // Wrong
   useEffect(() => {
     setCount(count + 1);  // This will cause an infinite loop
   }, [count]);
   
   // Better
   useEffect(() => {
     setCount(prevCount => prevCount + 1);  // This won't cause an infinite loop
   }, []);
   ```
2. Check state updates in render
3. Use functional updates:
   ```typescript
   // Wrong
   const increment = () => setCount(count + 1);
   
   // Better
   const increment = () => setCount(prevCount => prevCount + 1);
   ```
4. Check for circular dependencies between components
5. Use the React DevTools to identify re-render cycles

## Additional Resources

- [React Native Debugging Documentation](https://reactnative.dev/docs/debugging)
- [React Native Performance Documentation](https://reactnative.dev/docs/performance)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Detox Documentation](https://github.com/wix/Detox/blob/master/docs/README.md)
- [Flipper Documentation](https://fbflipper.com/docs/getting-started/index)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
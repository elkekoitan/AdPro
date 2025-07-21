/**
 * Navigation Index
 * Tüm navigation exports'ları
 */

// Types
export * from './types';

// Hooks
export * from './hooks';

// Guards
export * from './guards';

// Navigators
export * from './navigators';

// Linking
export * from './linking';

// Validation
export * from './validation';

// Re-export React Navigation types for convenience
export type {
  NavigationProp,
  RouteProp,
  ParamListBase,
  NavigationState as RNNavigationState,
  PartialState,
  NavigationAction as RNNavigationAction,
  NavigationContainerRef,
} from '@react-navigation/native';

export type {
  StackNavigationProp,
  StackScreenProps as RNStackScreenProps,
  StackNavigationOptions,
  StackHeaderProps,
} from '@react-navigation/stack';

export type {
  BottomTabNavigationProp,
  BottomTabScreenProps as RNBottomTabScreenProps,
  BottomTabNavigationOptions,
  BottomTabHeaderProps,
} from '@react-navigation/bottom-tabs';

// Re-export React Navigation components for convenience
export {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useNavigation,
  useRoute,
  useFocusEffect,
  useNavigationState as useRNNavigationState,
  useIsFocused,
  useScrollToTop,
} from '@react-navigation/native';

export {
  createStackNavigator,
  CardStyleInterpolators,
  HeaderStyleInterpolators,
  TransitionPresets,
} from '@react-navigation/stack';

export {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

// Navigation utilities
export const NavigationUtils = {
  /**
   * Creates a navigation ref for imperative navigation
   */
  createNavigationRef: () => {
    const { createNavigationContainerRef } = require('@react-navigation/native');
    return createNavigationContainerRef();
  },

  /**
   * Checks if a route name is valid
   */
  isValidRoute: (routeName: string, validRoutes: string[]): boolean => {
    return validRoutes.includes(routeName);
  },

  /**
   * Extracts route name from navigation state
   */
  getCurrentRouteName: (state: any): string | undefined => {
    if (!state || !state.routes || state.routes.length === 0) {
      return undefined;
    }

    const route = state.routes[state.index];
    
    if (route.state) {
      return NavigationUtils.getCurrentRouteName(route.state);
    }

    return route.name;
  },

  /**
   * Builds navigation params for deep linking
   */
  buildNavigationParams: (
    screen: string,
    params?: any,
    nested?: { screen: string; params?: any }
  ) => {
    const navigationParams: any = { screen };
    
    if (params) {
      navigationParams.params = params;
    }
    
    if (nested) {
      navigationParams.params = {
        ...navigationParams.params,
        ...nested,
      };
    }
    
    return navigationParams;
  },

  /**
   * Validates navigation parameters
   */
  validateParams: (params: any, schema: Record<string, any>): boolean => {
    if (!params || !schema) return true;
    
    for (const [key, validator] of Object.entries(schema)) {
      if (validator.required && !(key in params)) {
        console.warn(`Required parameter '${key}' is missing`);
        return false;
      }
      
      if (key in params && validator.type) {
        const paramType = typeof params[key];
        if (paramType !== validator.type) {
          console.warn(`Parameter '${key}' should be of type '${validator.type}', got '${paramType}'`);
          return false;
        }
      }
    }
    
    return true;
  },
};
/**
 * Root Navigator
 * Main navigation structure with authentication flow
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuthStore } from '../../../application/stores/authStore';
import { AuthService } from '../../../application/services/AuthService';
import { MockAuthRepository } from '../../../infrastructure/repositories/MockAuthRepository';
import { SupabaseAuthRepository } from '../../../infrastructure/repositories/SupabaseAuthRepository';
import { linkingConfig, useDeepLinking } from '../linking';
import { Logger } from '../../../shared/utils/debug-helpers';

const TAG = 'RootNavigator';

// Initialize auth service with real Supabase for testing
const authRepository = new SupabaseAuthRepository();
const authService = new AuthService(authRepository);

// Loading screen component
const LoadingScreen = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

const Stack = createStackNavigator<RootStackParamList>();

// Auth-aware navigator component
function AuthAwareNavigator() {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuthStore();

  // Initialize authentication on mount
  useEffect(() => {
    if (!isInitialized) {
      Logger.info(TAG, 'Initializing authentication service');
      authService.initialize().catch((error) => {
        Logger.error(TAG, 'Failed to initialize auth service', error);
      });
    }
  }, [isInitialized]);

  // Show loading while initializing or loading
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  // Determine which navigator to show based on auth state
  if (!isAuthenticated || !user) {
    Logger.info(TAG, 'User not authenticated, showing auth flow');
    return <AuthNavigator />;
  }

  // Check email verification
  if (!user.emailVerified) {
    Logger.info(TAG, 'User email not verified, staying in auth flow');
    return <AuthNavigator />;
  }

  // Check onboarding completion (business profile required)
  if (!user.businessProfile || !user.businessProfile.name) {
    Logger.info(TAG, 'User onboarding not completed, staying in auth flow');
    return <AuthNavigator />;
  }

  // User is fully authenticated and verified
  Logger.info(TAG, 'User authenticated and verified, showing main app');
  return <MainNavigator />;
}

// Modal navigator component
const ModalNavigator = () => {
  const { useNavigation } = require('@react-navigation/native');
  const navigation = useNavigation();
  
  return (
    <View style={modalStyles.container}>
      <View style={modalStyles.modal}>
        <Text style={modalStyles.title}>Modal Screen</Text>
        <Text style={modalStyles.subtitle}>This modal is not yet implemented</Text>
        
        <Text 
          style={modalStyles.closeButton}
          onPress={() => navigation.goBack()}
        >
          Close
        </Text>
      </View>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export function RootNavigator() {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuthStore();

  // Initialize authentication on mount
  useEffect(() => {
    if (!isInitialized) {
      Logger.info(TAG, 'Initializing authentication service');
      authService.initialize().catch((error) => {
        Logger.error(TAG, 'Failed to initialize auth service', error);
      });
    }
  }, [isInitialized]);

  // Show loading while initializing or loading
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'card',
      }}
    >
      {isAuthenticated && user && user.emailVerified && user.businessProfile?.name ? (
        // Authenticated and verified user flow
        <>
          <Stack.Screen 
            name="Main" 
            component={MainNavigator}
            options={{
              animationEnabled: false,
            }}
          />
          
          <Stack.Group 
            screenOptions={{ 
              presentation: 'modal',
              headerShown: false,
            }}
          >
            <Stack.Screen 
              name="Modal" 
              component={ModalNavigator}
            />
          </Stack.Group>
        </>
      ) : (
        // Unauthenticated or unverified user flow
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            animationEnabled: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
}

// Navigation container with auth integration and deep linking
export function AppNavigator() {
  const [isReady, setIsReady] = useState(false);
  const { lastUrl } = useDeepLinking();

  useEffect(() => {
    const prepareNavigation = async () => {
      try {
        Logger.info(TAG, 'Preparing navigation');
        
        // Navigation hazırlık işlemleri
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsReady(true);
        Logger.info(TAG, 'Navigation ready');
      } catch (error) {
        Logger.error(TAG, 'Navigation preparation error:', error);
        setIsReady(true); // Hata durumunda da devam et
      }
    };

    prepareNavigation();
  }, []);

  // Deep link URL değişikliklerini logla
  useEffect(() => {
    if (lastUrl) {
      Logger.info(TAG, 'Deep link URL processed:', lastUrl);
    }
  }, [lastUrl]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      linking={linkingConfig}
      onReady={() => {
        Logger.info(TAG, 'Navigation container ready');
      }}
      onStateChange={(state) => {
        Logger.debug(TAG, 'Navigation state changed:', state);
      }}
      onUnhandledAction={(action) => {
        Logger.warn(TAG, 'Unhandled navigation action:', action);
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
/**
 * Auth Navigator
 * Authentication flow navigator with proper state handling
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import type { AuthStackParamList, AuthStackScreenProps } from '../types';
import { useGuestGuard } from '../guards';

// Import authentication screens
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  EmailVerificationScreen,
  OnboardingScreen,
} from '@/presentation/screens/auth';

// Loading screen component
const LoadingScreen = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  // Use guest guard to redirect authenticated users
  const { isChecking } = useGuestGuard('Main');

  // Show loading screen while checking authentication
  if (isChecking) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#333',
        },
        headerTintColor: '#007AFF',
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{
          title: 'Welcome',
          headerShown: false,
        }}
      />
      
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Giriş Yap',
          headerShown: true,
          headerBackTitle: 'Geri',
        }}
      />
      
      {/* SignIn is an alias for Login screen - they share the same component */}
      <Stack.Screen 
        name="SignIn" 
        component={LoginScreen}
        options={{
          title: 'Giriş Yap',
          headerShown: true,
          headerBackTitle: 'Geri',
        }}
      />
      
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Kayıt Ol',
          headerShown: true,
          headerBackTitle: 'Geri',
        }}
      />
      
      <Stack.Screen 
        name="SignUp" 
        component={RegisterScreen}
        options={{
          title: 'Hesap Oluştur',
          headerShown: true,
          headerBackTitle: 'Geri',
        }}
      />
      
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Şifremi Unuttum',
          headerShown: true,
          headerBackTitle: 'Geri',
        }}
      />
      
      <Stack.Screen 
        name="EmailVerification" 
        component={EmailVerificationScreen}
        options={{
          title: 'E-posta Doğrulama',
          headerShown: true,
          headerBackTitle: 'Geri',
          gestureEnabled: false, // Disable back gesture
        }}
      />
      
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{
          title: 'Hoş Geldiniz',
          headerShown: false,
          gestureEnabled: false, // Disable back gesture
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
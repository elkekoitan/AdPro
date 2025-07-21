/**
 * Navigation Test Component
 * Test component for verifying navigation guards functionality
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../../application/stores/authStore';
import { useAuthGuard, useGuestGuard, useEmailVerificationGuard, useOnboardingGuard } from '../guards';
import { createMockUser } from '../../../shared/utils/test-helpers';

export const NavigationTestComponent = () => {
  const [testMode, setTestMode] = useState<'auth' | 'guest' | 'email' | 'onboarding'>('auth');
  const { login, logout, updateUser, setInitialized } = useAuthStore();

  // Initialize the store
  React.useEffect(() => {
    setInitialized(true);
  }, [setInitialized]);

  const handleLogin = () => {
    const mockUser = createMockUser({
      emailVerified: true,
      businessProfile: {
        id: 'business-1',
        name: 'Test Business',
        industry: 'restaurant',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const mockTokens = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    };

    login(mockUser, mockTokens);
  };

  const handleLoginUnverified = () => {
    const mockUser = createMockUser({
      emailVerified: false,
      businessProfile: {
        id: 'business-1',
        name: 'Test Business',
        industry: 'restaurant',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const mockTokens = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: new Date(Date.now() + 3600000),
    };

    login(mockUser, mockTokens);
  };

  const handleLoginNoOnboarding = () => {
    const mockUser = createMockUser({
      emailVerified: true,
      businessProfile: undefined,
    });

    const mockTokens = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: new Date(Date.now() + 3600000),
    };

    login(mockUser, mockTokens);
  };

  const handleLogout = () => {
    logout();
  };

  const handleVerifyEmail = () => {
    updateUser({ emailVerified: true });
  };

  const handleCompleteOnboarding = () => {
    updateUser({
      businessProfile: {
        id: 'business-1',
        name: 'Test Business',
        industry: 'restaurant',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation Guards Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setTestMode('auth')}>
          <Text style={styles.buttonText}>Test Auth Guard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => setTestMode('guest')}>
          <Text style={styles.buttonText}>Test Guest Guard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => setTestMode('email')}>
          <Text style={styles.buttonText}>Test Email Guard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => setTestMode('onboarding')}>
          <Text style={styles.buttonText}>Test Onboarding Guard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLogin}>
          <Text style={styles.actionButtonText}>Login (Verified)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleLoginUnverified}>
          <Text style={styles.actionButtonText}>Login (Unverified)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleLoginNoOnboarding}>
          <Text style={styles.actionButtonText}>Login (No Onboarding)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <Text style={styles.actionButtonText}>Logout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleVerifyEmail}>
          <Text style={styles.actionButtonText}>Verify Email</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleCompleteOnboarding}>
          <Text style={styles.actionButtonText}>Complete Onboarding</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.testContainer}>
        {testMode === 'auth' && <AuthGuardTest />}
        {testMode === 'guest' && <GuestGuardTest />}
        {testMode === 'email' && <EmailGuardTest />}
        {testMode === 'onboarding' && <OnboardingGuardTest />}
      </View>
    </View>
  );
};

const AuthGuardTest = () => {
  const { isChecking, isAuthenticated, user } = useAuthGuard();

  return (
    <View style={styles.testResult}>
      <Text style={styles.testTitle}>Auth Guard Test</Text>
      <Text>Checking: {isChecking ? 'Yes' : 'No'}</Text>
      <Text>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
      <Text>User: {user ? user.name : 'None'}</Text>
    </View>
  );
};

const GuestGuardTest = () => {
  const { isChecking, isGuest } = useGuestGuard();

  return (
    <View style={styles.testResult}>
      <Text style={styles.testTitle}>Guest Guard Test</Text>
      <Text>Checking: {isChecking ? 'Yes' : 'No'}</Text>
      <Text>Is Guest: {isGuest ? 'Yes' : 'No'}</Text>
    </View>
  );
};

const EmailGuardTest = () => {
  const { isChecking, isVerified, userEmail } = useEmailVerificationGuard();

  return (
    <View style={styles.testResult}>
      <Text style={styles.testTitle}>Email Verification Guard Test</Text>
      <Text>Checking: {isChecking ? 'Yes' : 'No'}</Text>
      <Text>Verified: {isVerified ? 'Yes' : 'No'}</Text>
      <Text>Email: {userEmail || 'None'}</Text>
    </View>
  );
};

const OnboardingGuardTest = () => {
  const { isChecking, isCompleted, businessProfile } = useOnboardingGuard();

  return (
    <View style={styles.testResult}>
      <Text style={styles.testTitle}>Onboarding Guard Test</Text>
      <Text>Checking: {isChecking ? 'Yes' : 'No'}</Text>
      <Text>Completed: {isCompleted ? 'Yes' : 'No'}</Text>
      <Text>Business: {businessProfile?.name || 'None'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    margin: 5,
    minWidth: 120,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 6,
    margin: 3,
    minWidth: 100,
  },
  actionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
  },
  testContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  testResult: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
});
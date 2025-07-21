/**
 * Dashboard Navigator
 * Dashboard ekranları için stack navigator
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createStackNavigator, CardStyleInterpolators, TransitionPresets } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { DashboardStackParamList, DashboardStackScreenProps } from '../types';
import { Logger } from '../../../shared/utils/debug-helpers';

// Import screens
import { MainDashboardScreen } from '../../screens/dashboard/MainDashboardScreen';
import { NotificationCenterScreen } from '../../screens/profile/NotificationCenterScreen';

const TAG = 'DashboardNavigator';

// Placeholder screen component for screens that are not yet implemented
const PlaceholderScreen = ({ route }: DashboardStackScreenProps<keyof DashboardStackParamList>) => {
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  
  // Log screen navigation for debugging
  React.useEffect(() => {
    Logger.info(TAG, `Navigated to placeholder screen: ${route.name}`);
  }, [route.name]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.name} Screen</Text>
      <Text style={styles.subtitle}>Bu ekran henüz uygulanmadı</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Geri dön butonu"
          accessibilityHint="Ana dashboard ekranına geri dönmek için dokunun"
        >
          <Text style={styles.buttonText}>Geri Dön</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('MainDashboard')}
          accessibilityLabel="Ana sayfaya dön butonu"
          accessibilityHint="Ana dashboard ekranına doğrudan gitmek için dokunun"
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});

const Stack = createStackNavigator<DashboardStackParamList>();

// Custom transition configurations
const screenTransitionConfig = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

export function DashboardNavigator() {
  // Log when the navigator is mounted
  React.useEffect(() => {
    Logger.info(TAG, 'DashboardNavigator mounted');
    return () => {
      Logger.info(TAG, 'DashboardNavigator unmounted');
    };
  }, []);

  return (
    <Stack.Navigator
      initialRouteName="MainDashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#000',
        },
        headerTintColor: '#007AFF',
        headerBackTitle: 'Geri',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        ...Platform.select({
          ios: {
            ...TransitionPresets.SlideFromRightIOS,
          },
          android: {
            ...TransitionPresets.RevealFromBottomAndroid,
          },
          default: {
            ...TransitionPresets.DefaultTransition,
          },
        }),
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        transitionSpec: {
          open: screenTransitionConfig,
          close: screenTransitionConfig,
        },
      }}
    >
      <Stack.Screen 
        name="MainDashboard" 
        component={MainDashboardScreen}
        options={{
          title: 'Dashboard',
          headerShown: true,
          animationEnabled: true,
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            Logger.info(TAG, 'MainDashboard screen focused');
          },
          blur: () => {
            Logger.info(TAG, 'MainDashboard screen blurred');
          },
        })}
      />
      
      <Stack.Screen 
        name="QuickActions" 
        component={PlaceholderScreen}
        options={{
          title: 'Hızlı İşlemler',
          headerShown: true,
          animationEnabled: true,
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            Logger.info(TAG, 'QuickActions screen focused');
          },
        })}
      />
      
      <Stack.Screen 
        name="AIInsights" 
        component={PlaceholderScreen}
        options={{
          title: 'AI İçgörüler',
          headerShown: true,
          animationEnabled: true,
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            Logger.info(TAG, 'AIInsights screen focused');
          },
        })}
      />
      
      <Stack.Screen 
        name="NotificationCenter" 
        component={NotificationCenterScreen}
        options={{
          title: 'Bildirim Merkezi',
          headerShown: true,
          animationEnabled: true,
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            Logger.info(TAG, 'NotificationCenter screen focused');
          },
        })}
      />
    </Stack.Navigator>
  );
}
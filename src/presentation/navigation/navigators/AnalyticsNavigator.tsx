/**
 * Analytics Navigator
 * Analitik ekranları için stack navigator
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { AnalyticsStackParamList, AnalyticsStackScreenProps } from '../types';
import { AdvancedAnalyticsScreen } from '../../screens/analytics/AdvancedAnalyticsScreen';

// Placeholder screen component
const PlaceholderScreen = ({ route }: AnalyticsStackScreenProps<keyof AnalyticsStackParamList>) => {
  const navigation = useNavigation<NavigationProp<AnalyticsStackParamList>>();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.name} Screen</Text>
      <Text style={styles.subtitle}>Bu ekran henüz uygulanmadı</Text>
      
      {route.name === 'AnalyticsDashboard' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('AdvancedAnalytics')}
          >
            <Text style={styles.buttonText}>Gelişmiş Analitik</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('CreateReport')}
          >
            <Text style={styles.buttonText}>Rapor Oluştur</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('ReportDetails', { reportId: 'test-report-123' })}
          >
            <Text style={styles.buttonText}>Rapor Detayları</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('PerformanceMetrics')}
          >
            <Text style={styles.buttonText}>Performans Metrikleri</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center' as const,
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
    alignItems: 'center' as const,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
};

const Stack = createStackNavigator<AnalyticsStackParamList>();

export function AnalyticsNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AnalyticsDashboard"
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
      }}
    >
      <Stack.Screen 
        name="AnalyticsDashboard" 
        component={PlaceholderScreen}
        options={{
          title: 'Analitik Dashboard',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="AdvancedAnalytics" 
        component={AdvancedAnalyticsScreen}
        options={{
          title: 'Gelişmiş Analitik',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="ReportDetails" 
        component={PlaceholderScreen}
        options={{
          title: 'Rapor Detayları',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="CreateReport" 
        component={PlaceholderScreen}
        options={{
          title: 'Rapor Oluştur',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="PerformanceMetrics" 
        component={PlaceholderScreen}
        options={{
          title: 'Performans Metrikleri',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
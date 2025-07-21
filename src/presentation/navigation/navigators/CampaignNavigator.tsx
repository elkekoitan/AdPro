/**
 * Campaign Navigator
 * Kampanya ekranları için stack navigator
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { CampaignStackParamList, CampaignStackScreenProps } from '../types';
import { MultiPlatformCampaignScreen } from '../../screens/campaign/MultiPlatformCampaignScreen';

// Placeholder screen component
const PlaceholderScreen = ({ route }: CampaignStackScreenProps<keyof CampaignStackParamList>) => {
  const navigation = useNavigation<NavigationProp<CampaignStackParamList>>();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.name} Screen</Text>
      <Text style={styles.subtitle}>Bu ekran henüz uygulanmadı</Text>
      
      {route.name === 'CampaignList' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('CreateCampaign')}
          >
            <Text style={styles.buttonText}>Yeni Kampanya</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('CampaignDetails', { campaignId: 'test-123' })}
          >
            <Text style={styles.buttonText}>Kampanya Detayları</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('MultiPlatformCampaign')}
          >
            <Text style={styles.buttonText}>Multi-Platform Kampanya</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {route.name === 'CampaignDetails' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('EditCampaign', { campaignId: 'test-123' })}
          >
            <Text style={styles.buttonText}>Kampanyayı Düzenle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('CampaignPreview', { campaignId: 'test-123' })}
          >
            <Text style={styles.buttonText}>Kampanya Önizleme</Text>
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

const Stack = createStackNavigator<CampaignStackParamList>();

export function CampaignNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="CampaignList"
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
        name="CampaignList" 
        component={PlaceholderScreen}
        options={{
          title: 'Kampanyalar',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="CampaignDetails" 
        component={PlaceholderScreen}
        options={{
          title: 'Kampanya Detayları',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="CreateCampaign" 
        component={PlaceholderScreen}
        options={{
          title: 'Yeni Kampanya',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="EditCampaign" 
        component={PlaceholderScreen}
        options={{
          title: 'Kampanyayı Düzenle',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="CampaignPreview" 
        component={PlaceholderScreen}
        options={{
          title: 'Kampanya Önizleme',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="MultiPlatformCampaign" 
        component={MultiPlatformCampaignScreen}
        options={{
          title: 'Multi-Platform Kampanya',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
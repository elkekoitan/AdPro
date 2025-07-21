/**
 * Profile Navigator
 * Profil ekranları için stack navigator
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { ProfileStackParamList, ProfileStackScreenProps } from '../types';

// Import implemented screens
import { ProfileScreen } from '../../screens/profile/ProfileScreen';
import { SettingsDashboardScreen } from '../../screens/profile/SettingsDashboardScreen';
import { NotificationCenterScreen } from '../../screens/profile/NotificationCenterScreen';
import { BusinessListScreen } from '../../screens/profile/BusinessListScreen';
import { ContentLibraryScreen } from '../../screens/profile/ContentLibraryScreen';
import { AIAgentChatScreen } from '../../screens/ai-agent/AIAgentChatScreen';

// Placeholder screen component for screens not yet implemented
const PlaceholderScreen = ({ route }: ProfileStackScreenProps<keyof ProfileStackParamList>) => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.name} Screen</Text>
      <Text style={styles.subtitle}>Bu ekran henüz uygulanmadı</Text>
      
      {route.name === 'BusinessProfile' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('ProfileMain')}
          >
            <Text style={styles.buttonText}>Profil'e Dön</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {route.name === 'EditProfile' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('ProfileMain')}
          >
            <Text style={styles.buttonText}>Profil'e Dön</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {route.name === 'BusinessList' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('ProfileMain')}
          >
            <Text style={styles.buttonText}>Profil'e Dön</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {route.name === 'ContentLibrary' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('ProfileMain')}
          >
            <Text style={styles.buttonText}>Profil'e Dön</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {route.name === 'AIAgentChat' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('ProfileMain')}
          >
            <Text style={styles.buttonText}>Profil'e Dön</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {route.name === 'Help' || route.name === 'About' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.buttonText}>Ayarlar'a Dön</Text>
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

const Stack = createStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
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
        name="ProfileMain" 
        component={ProfileScreen}
        options={{
          title: 'Profil',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="EditProfile" 
        component={PlaceholderScreen}
        options={{
          title: 'Profili Düzenle',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="BusinessProfile" 
        component={PlaceholderScreen}
        options={{
          title: 'İşletme Profili',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="Settings" 
        component={SettingsDashboardScreen}
        options={{
          title: 'Ayarlar',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="SettingsDashboard" 
        component={SettingsDashboardScreen}
        options={{
          title: 'Ayarlar',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="BusinessList" 
        component={BusinessListScreen}
        options={{
          title: 'İşletme Listesi',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="ContentLibrary" 
        component={ContentLibraryScreen}
        options={{
          title: 'İçerik Kütüphanesi',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="AIAgentChat" 
        component={AIAgentChatScreen}
        options={{
          title: 'AI Asistan',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="Help" 
        component={PlaceholderScreen}
        options={{
          title: 'Yardım',
          headerShown: true,
        }}
      />
      
      <Stack.Screen 
        name="About" 
        component={PlaceholderScreen}
        options={{
          title: 'Hakkında',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
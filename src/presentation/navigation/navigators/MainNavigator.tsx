/**
 * Main Navigator
 * Ana uygulama için tab navigator
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../types';
import { DashboardNavigator } from './DashboardNavigator';
import { CampaignNavigator } from './CampaignNavigator';
import { AnalyticsNavigator } from './AnalyticsNavigator';
import { ProfileNavigator } from './ProfileNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icon component (placeholder)
const TabIcon = ({ name, focused, color, size }: {
  name: string;
  focused: boolean;
  color: string;
  size: number;
}) => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ 
        fontSize: size - 4, 
        color, 
        fontWeight: focused ? 'bold' : 'normal' 
      }}>
        {getIconText(name)}
      </Text>
    </View>
  );
};

const getIconText = (name: string): string => {
  switch (name) {
    case 'Dashboard':
      return '📊';
    case 'Campaigns':
      return '🎯';
    case 'Analytics':
      return '📈';
    case 'Profile':
      return '👤';
    default:
      return '•';
  }
};

export function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon 
            name={route.name} 
            focused={focused} 
            color={color} 
            size={size} 
          />
        ),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Dashboard',
          title: 'Ana Sayfa',
        }}
      />
      
      <Tab.Screen 
        name="Campaigns" 
        component={CampaignNavigator}
        options={{
          tabBarLabel: 'Kampanyalar',
          title: 'Kampanyalar',
        }}
      />
      
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsNavigator}
        options={{
          tabBarLabel: 'Analitik',
          title: 'Analitik',
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profil',
          title: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}
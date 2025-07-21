/**
 * DashboardHeader Component
 * Dashboard ekranının üst kısmında yer alan başlık ve bilgi bileşeni
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DashboardHeaderProps {
  userName: string;
  lastUpdated: Date;
  isConnected: boolean;
  onRefresh?: () => void;
}

export function DashboardHeader({ 
  userName, 
  lastUpdated, 
  isConnected,
  onRefresh 
}: DashboardHeaderProps) {
  // Animation values
  const translateYAnim = useRef(new Animated.Value(-20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const refreshingAnim = useRef(new Animated.Value(0)).current;
  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };
  
  // Animate on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Handle refresh button press
  const handleRefresh = () => {
    if (onRefresh) {
      // Start rotation animation
      Animated.loop(
        Animated.timing(refreshingAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      
      // Call refresh function
      onRefresh();
      
      // Stop animation after 2 seconds
      setTimeout(() => {
        refreshingAnim.setValue(0);
      }, 2000);
    }
  };
  
  // Rotate animation interpolation
  const rotate = refreshingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: translateYAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.userName}>{userName}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.connectionIndicator, 
            { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
          ]} />
          <Text style={styles.lastUpdatedText}>
            Son güncelleme: {formatTime(lastUpdated)}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={!isConnected}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons 
              name="refresh" 
              size={18} 
              color={isConnected ? '#007AFF' : '#999'} 
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      {/* Date display */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('tr-TR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  greetingContainer: {
    marginBottom: 4,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666',
  },
  refreshButton: {
    padding: 6,
  },
  dateContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
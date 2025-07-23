/**
 * SettingsDashboardScreen Component
 * User settings and configuration options
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Type assertion to fix React Native compatibility
const IoniconsIcon = Ionicons as any;
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { ProfileStackParamList } from '../../navigation/types';
import { useAuthUser, useAuthActions } from '../../../application/stores/authStore';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';

export function SettingsDashboardScreen() {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const user = useAuthUser();
  const { updateProfile } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for settings
  const [settings, setSettings] = useState({
    notifications: {
      email: user?.preferences.notifications.email || false,
      push: user?.preferences.notifications.push || false,
      sms: user?.preferences.notifications.sms || false,
    },
    theme: user?.preferences.theme || 'auto',
    language: user?.preferences.language || 'tr',
  });

  // Handle theme change
  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    setSettings(prev => ({
      ...prev,
      theme,
    }));
  };

  // Handle language change
  const handleLanguageChange = (language: string) => {
    setSettings(prev => ({
      ...prev,
      language,
    }));
  };

  // Handle notification toggle
  const handleNotificationToggle = (type: 'email' | 'push' | 'sms') => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
  };

  // Save settings
  const saveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // In a real app, we would call an API to update user preferences
      // For now, we'll just update the local state
      setTimeout(() => {
        updateProfile({
          preferences: {
            ...user.preferences,
            notifications: settings.notifications,
            theme: settings.theme as 'light' | 'dark' | 'auto',
            language: settings.language,
          },
        });
        
        setIsSaving(false);
        Alert.alert('Başarılı', 'Ayarlarınız kaydedildi.');
      }, 1000);
    } catch (error) {
      setIsSaving(false);
      Alert.alert('Hata', 'Ayarlar kaydedilirken bir hata oluştu.');
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Ayarlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.screenTitle}>Ayarlar</Text>
        
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirim Ayarları</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IoniconsIcon name="mail" size={22} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>E-posta Bildirimleri</Text>
                <Text style={styles.settingDescription}>
                  Kampanya güncellemeleri ve önemli duyurular
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications.email}
              onValueChange={() => handleNotificationToggle('email')}
              trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IoniconsIcon name="notifications" size={22} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>Push Bildirimleri</Text>
                <Text style={styles.settingDescription}>
                  Anlık güncellemeler ve uyarılar
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications.push}
              onValueChange={() => handleNotificationToggle('push')}
              trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IoniconsIcon name="chatbubble" size={22} color="#666" style={styles.settingIcon} />
              <View>
                <Text style={styles.settingLabel}>SMS Bildirimleri</Text>
                <Text style={styles.settingDescription}>
                  Kritik uyarılar ve doğrulama kodları
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications.sms}
              onValueChange={() => handleNotificationToggle('sms')}
              trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.advancedButton}
            onPress={() => {/* navigation.navigate('NotificationCenter') */}}
          >
            <Text style={styles.advancedButtonText}>Gelişmiş Bildirim Ayarları</Text>
            <IoniconsIcon name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görünüm</Text>
          
          <Text style={styles.groupLabel}>Tema</Text>
          <View style={styles.optionGroup}>
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                settings.theme === 'light' && styles.optionButtonSelected
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <IoniconsIcon 
                name="sunny" 
                size={22} 
                color={settings.theme === 'light' ? '#FFFFFF' : '#666'} 
              />
              <Text style={[
                styles.optionText,
                settings.theme === 'light' && styles.optionTextSelected
              ]}>
                Açık
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                settings.theme === 'dark' && styles.optionButtonSelected
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <IoniconsIcon 
                name="moon" 
                size={22} 
                color={settings.theme === 'dark' ? '#FFFFFF' : '#666'} 
              />
              <Text style={[
                styles.optionText,
                settings.theme === 'dark' && styles.optionTextSelected
              ]}>
                Koyu
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                settings.theme === 'auto' && styles.optionButtonSelected
              ]}
              onPress={() => handleThemeChange('auto')}
            >
              <IoniconsIcon 
                name="contrast" 
                size={22} 
                color={settings.theme === 'auto' ? '#FFFFFF' : '#666'} 
              />
              <Text style={[
                styles.optionText,
                settings.theme === 'auto' && styles.optionTextSelected
              ]}>
                Otomatik
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dil</Text>
          
          <View style={styles.optionGroup}>
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                settings.language === 'tr' && styles.optionButtonSelected
              ]}
              onPress={() => handleLanguageChange('tr')}
            >
              <Text style={[
                styles.optionText,
                settings.language === 'tr' && styles.optionTextSelected
              ]}>
                Türkçe
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                settings.language === 'en' && styles.optionButtonSelected
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[
                styles.optionText,
                settings.language === 'en' && styles.optionTextSelected
              ]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Güvenlik</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IoniconsIcon name="lock-closed" size={22} color="#666" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Şifre Değiştir</Text>
            </View>
            <IoniconsIcon name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IoniconsIcon name="finger-print" size={22} color="#666" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Biyometrik Kimlik Doğrulama</Text>
            </View>
            <IoniconsIcon name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IoniconsIcon name="shield" size={22} color="#666" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>İki Faktörlü Doğrulama</Text>
            </View>
            <IoniconsIcon name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
        </View>
        
        {/* About & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hakkında & Destek</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IoniconsIcon name="help-circle" size={22} color="#666" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Yardım Merkezi</Text>
            </View>
            <IoniconsIcon name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IoniconsIcon name="document-text" size={22} color="#666" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Kullanım Koşulları</Text>
            </View>
            <IoniconsIcon name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IoniconsIcon name="shield-checkmark" size={22} color="#666" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Gizlilik Politikası</Text>
            </View>
            <IoniconsIcon name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IoniconsIcon name="information-circle" size={22} color="#666" style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Uygulama Hakkında</Text>
            </View>
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>v1.0.0</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Ayarları Kaydet</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  advancedButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 4,
  },
  groupLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  optionGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#333',
    fontWeight: '500',
    marginLeft: 6,
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  versionContainer: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 12,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
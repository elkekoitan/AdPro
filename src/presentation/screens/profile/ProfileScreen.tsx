/**
 * ProfileScreen Component
 * User profile information display screen
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
const IoniconsIcon = Ionicons as any;
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { ProfileStackParamList } from '../../navigation/types';
import { useAuthUser } from '../../../application/stores/authStore';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const user = useAuthUser();
  const [isLoading, setIsLoading] = useState(false);

  // Handle navigation to edit profile
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  // Handle navigation to settings
  const handleNavigateToSettings = () => {
    navigation.navigate('Settings');
  };

  // Handle navigation to business profile
  const handleBusinessProfile = () => {
    navigation.navigate('BusinessProfile');
  };
  
  // Handle navigation to AI Agent Chat
  const handleNavigateToAIAgent = () => {
    navigation.navigate('AIAgentChat');
  };

  // Handle logout (placeholder)
  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: () => {
            setIsLoading(true);
            // Simulate logout process
            setTimeout(() => {
              // In a real app, we would call the logout function from authStore
              // useAuthStore.getState().logout();
              setIsLoading(false);
              // Navigate to auth screen would happen automatically via auth guard
            }, 1000);
          }
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Kullanıcı bilgileri yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <Text style={styles.avatarText}>
                  {user.name.substring(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleEditProfile}>
              <IoniconsIcon name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          <View style={styles.subscriptionBadge}>
            <Text style={styles.subscriptionText}>
              {user.subscriptionTier?.charAt(0).toUpperCase() + user.subscriptionTier?.slice(1)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <IoniconsIcon name="person" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Profili Düzenle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleNavigateToSettings}>
            <IoniconsIcon name="settings" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Ayarlar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleNavigateToAIAgent}>
            <IoniconsIcon name="chatbubble-ellipses" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>AI Asistan</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
          
          <View style={styles.infoItem}>
            <IoniconsIcon name="mail" size={20} color="#666" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>E-posta</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            <View style={styles.verificationBadge}>
              <IoniconsIcon 
                name={user.emailVerified ? "checkmark-circle" : "alert-circle"} 
                size={16} 
                color={user.emailVerified ? "#4CAF50" : "#FFC107"} 
              />
              <Text style={[
                styles.verificationText, 
                { color: user.emailVerified ? "#4CAF50" : "#FFC107" }
              ]}>
                {user.emailVerified ? "Doğrulandı" : "Doğrulanmadı"}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <IoniconsIcon name="call" size={20} color="#666" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Telefon</Text>
              <Text style={styles.infoValue}>
                {user.phoneNumber || "Telefon numarası eklenmedi"}
              </Text>
            </View>
            {user.phoneNumber && (
              <View style={styles.verificationBadge}>
                <IoniconsIcon 
                  name={user.phoneVerified ? "checkmark-circle" : "alert-circle"} 
                  size={16} 
                  color={user.phoneVerified ? "#4CAF50" : "#FFC107"} 
                />
                <Text style={[
                  styles.verificationText, 
                  { color: user.phoneVerified ? "#4CAF50" : "#FFC107" }
                ]}>
                  {user.phoneVerified ? "Doğrulandı" : "Doğrulanmadı"}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.infoItem}>
            <IoniconsIcon name="calendar" size={20} color="#666" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Üyelik Tarihi</Text>
              <Text style={styles.infoValue}>
                {new Date(user.createdAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <IoniconsIcon name="time" size={20} color="#666" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Son Giriş</Text>
              <Text style={styles.infoValue}>
                {user.lastLoginAt 
                  ? new Date(user.lastLoginAt).toLocaleDateString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : "Bilgi yok"
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Business Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İşletme Profili</Text>
          
          {user.businessProfile ? (
            <>
              <View style={styles.businessCard}>
                {user.businessProfile.logo ? (
                  <Image 
                    source={{ uri: user.businessProfile.logo }} 
                    style={styles.businessLogo} 
                  />
                ) : (
                  <View style={styles.businessLogoPlaceholder}>
                    <IoniconsIcon name="business" size={24} color="#007AFF" />
                  </View>
                )}
                
                <View style={styles.businessInfo}>
                  <Text style={styles.businessName}>{user.businessProfile.name}</Text>
                  <Text style={styles.businessIndustry}>{user.businessProfile.industry}</Text>
                  {user.businessProfile.website && (
                    <Text style={styles.businessWebsite}>{user.businessProfile.website}</Text>
                  )}
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.businessButton} 
                onPress={handleBusinessProfile}
              >
                <Text style={styles.businessButtonText}>İşletme Profilini Görüntüle</Text>
                <IoniconsIcon name="chevron-forward" size={16} color="#007AFF" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyBusinessContainer}>
              <IoniconsIcon name="business" size={40} color="#CCC" />
              <Text style={styles.emptyBusinessText}>
                Henüz bir işletme profili oluşturmadınız
              </Text>
              <TouchableOpacity 
                style={styles.createBusinessButton} 
                onPress={handleBusinessProfile}
              >
                <Text style={styles.createBusinessButtonText}>İşletme Profili Oluştur</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tercihler</Text>
          
          <View style={styles.preferenceItem}>
            <IoniconsIcon name="globe" size={20} color="#666" style={styles.preferenceIcon} />
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Dil</Text>
              <Text style={styles.preferenceValue}>
                {user.preferences.language === 'tr' ? 'Türkçe' : 'English'}
              </Text>
            </View>
            <TouchableOpacity style={styles.preferenceEditButton} onPress={handleNavigateToSettings}>
              <IoniconsIcon name="pencil" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.preferenceItem}>
            <IoniconsIcon name="notifications" size={20} color="#666" style={styles.preferenceIcon} />
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Bildirimler</Text>
              <Text style={styles.preferenceValue}>
                {user.preferences.notifications.push ? 'Açık' : 'Kapalı'}
              </Text>
            </View>
            <TouchableOpacity style={styles.preferenceEditButton} onPress={handleNavigateToSettings}>
              <IoniconsIcon name="pencil" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.preferenceItem}>
            <IoniconsIcon name="moon" size={20} color="#666" style={styles.preferenceIcon} />
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Tema</Text>
              <Text style={styles.preferenceValue}>
                {user.preferences.theme === 'light' 
                  ? 'Açık' 
                  : user.preferences.theme === 'dark' 
                    ? 'Koyu' 
                    : 'Otomatik'}
              </Text>
            </View>
            <TouchableOpacity style={styles.preferenceEditButton} onPress={handleNavigateToSettings}>
                <IoniconsIcon name="pencil" size={16} color="#007AFF" />
              </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <IoniconsIcon name="log-out" size={18} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
            </>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderAvatar: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  subscriptionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  subscriptionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    marginLeft: 8,
    color: '#333',
    fontWeight: '500',
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  businessLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  businessLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  businessIndustry: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  businessWebsite: {
    fontSize: 14,
    color: '#007AFF',
  },
  businessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  businessButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 4,
  },
  emptyBusinessContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyBusinessText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  createBusinessButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createBusinessButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceIcon: {
    marginRight: 12,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 12,
    color: '#666',
  },
  preferenceValue: {
    fontSize: 16,
    color: '#333',
  },
  preferenceEditButton: {
    padding: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});
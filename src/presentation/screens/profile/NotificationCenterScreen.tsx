/**
 * NotificationCenterScreen Component
 * Notification management and display
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Switch,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { DashboardStackParamList } from '../../navigation/types';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';

// Mock notification types
type NotificationType = 'campaign' | 'analytics' | 'system' | 'ai_insight';

// Mock notification interface
interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: Date;
  actionable: boolean;
  actionText?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Kampanya Performansı',
    message: 'Yaz Kampanyanız hedefin %15 üzerinde performans gösteriyor!',
    type: 'campaign',
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    actionable: true,
    actionText: 'Detayları Gör',
  },
  {
    id: '2',
    title: 'Analitik Raporu Hazır',
    message: 'Haftalık performans raporunuz hazırlandı.',
    type: 'analytics',
    isRead: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    actionable: true,
    actionText: 'Raporu Aç',
  },
  {
    id: '3',
    title: 'Sistem Güncellemesi',
    message: 'AdVantage uygulaması başarıyla güncellendi.',
    type: 'system',
    isRead: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    actionable: false,
  },
  {
    id: '4',
    title: 'AI Önerisi',
    message: 'Hedef kitleniz için yeni içerik önerileri oluşturuldu.',
    type: 'ai_insight',
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    actionable: true,
    actionText: 'Önerileri Gör',
  },
  {
    id: '5',
    title: 'Kampanya Sona Eriyor',
    message: 'Kış Kampanyanız 2 gün içinde sona erecek.',
    type: 'campaign',
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    actionable: true,
    actionText: 'Kampanyayı Uzat',
  },
  {
    id: '6',
    title: 'Yeni Takipçiler',
    message: 'Instagram hesabınız bu hafta 27 yeni takipçi kazandı.',
    type: 'analytics',
    isRead: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    actionable: true,
    actionText: 'Analizi Gör',
  },
  {
    id: '7',
    title: 'Bakım Bildirimi',
    message: 'Yarın 02:00-04:00 saatleri arasında planlı bakım yapılacaktır.',
    type: 'system',
    isRead: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
    actionable: false,
  },
  {
    id: '8',
    title: 'AI İçerik Önerisi',
    message: 'Hedef kitleniz için 3 yeni içerik önerisi oluşturuldu.',
    type: 'ai_insight',
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 90), // 90 minutes ago
    actionable: true,
    actionText: 'İçerikleri Gör',
  },
];

export function NotificationCenterScreen() {
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [notificationSettings, setNotificationSettings] = useState({
    campaign: true,
    analytics: true,
    system: true,
    ai_insight: true,
  });

  // Load notifications
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setRefreshing(false);
    }, 1000);
  };

  // Handle notification action
  const handleNotificationAction = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(item => 
        item.id === notification.id ? { ...item, isRead: true } : item
      )
    );

    // Handle different notification types
    switch (notification.type) {
      case 'campaign':
        // Navigate to campaign details
        // navigation.navigate('CampaignDetails', { campaignId: '123' });
        break;
      case 'analytics':
        // Navigate to analytics
        // navigation.navigate('AnalyticsDashboard');
        break;
      case 'ai_insight':
        // Navigate to AI insights
        // navigation.navigate('AIInsights');
        break;
      default:
        break;
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(item => ({ ...item, isRead: true }))
    );
  };

  // Delete all notifications
  const deleteAllNotifications = () => {
    setNotifications([]);
  };

  // Toggle notification type setting
  const toggleNotificationType = (type: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' ? true : notification.type === filter
  );

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} dakika önce`;
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else {
      return `${diffDays} gün önce`;
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'campaign':
        return 'megaphone';
      case 'analytics':
        return 'stats-chart';
      case 'system':
        return 'cog';
      case 'ai_insight':
        return 'bulb';
      default:
        return 'notifications';
    }
  };

  // Get color for notification type
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'campaign':
        return '#FF9500';
      case 'analytics':
        return '#5856D6';
      case 'system':
        return '#007AFF';
      case 'ai_insight':
        return '#34C759';
      default:
        return '#666';
    }
  };

  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification
      ]}
      onPress={() => handleNotificationAction(item)}
    >
      <View style={[
        styles.notificationIconContainer,
        { backgroundColor: `${getNotificationColor(item.type)}20` }
      ]}>
        <Ionicons 
          name={getNotificationIcon(item.type)} 
          size={20} 
          color={getNotificationColor(item.type)} 
        />
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        
        <Text style={styles.notificationMessage}>{item.message}</Text>
        
        {item.actionable && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleNotificationAction(item)}
          >
            <Text style={styles.actionButtonText}>{item.actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {!item.isRead && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  // Render filter button
  const renderFilterButton = (filterType: NotificationType | 'all', label: string) => (
    <TouchableOpacity 
      style={[
        styles.filterButton,
        filter === filterType && styles.filterButtonActive
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={60} color="#CCC" />
      <Text style={styles.emptyTitle}>Bildirim Yok</Text>
      <Text style={styles.emptyMessage}>
        Şu anda hiç bildiriminiz bulunmuyor. Yeni bildirimler geldiğinde burada görünecekler.
      </Text>
    </View>
  );

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bildirimler</Text>
          
          <View style={styles.headerActions}>
            {notifications.length > 0 && (
              <>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={markAllAsRead}
                >
                  <Ionicons name="checkmark-done" size={20} color="#007AFF" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={deleteAllNotifications}
                >
                  <Ionicons name="trash" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        
        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {renderFilterButton('all', 'Tümü')}
          {renderFilterButton('campaign', 'Kampanyalar')}
          {renderFilterButton('analytics', 'Analitik')}
          {renderFilterButton('ai_insight', 'AI Önerileri')}
          {renderFilterButton('system', 'Sistem')}
        </ScrollView>
        
        {/* Notifications List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Bildirimler yükleniyor...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#007AFF']}
                tintColor="#007AFF"
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
        
        {/* Settings Section */}
        <View style={styles.settingsContainer}>
          <Text style={styles.settingsTitle}>Bildirim Ayarları</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="megaphone" 
                size={20} 
                color="#FF9500" 
                style={styles.settingIcon} 
              />
              <Text style={styles.settingLabel}>Kampanya Bildirimleri</Text>
            </View>
            <Switch
              value={notificationSettings.campaign}
              onValueChange={() => toggleNotificationType('campaign')}
              trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="stats-chart" 
                size={20} 
                color="#5856D6" 
                style={styles.settingIcon} 
              />
              <Text style={styles.settingLabel}>Analitik Bildirimleri</Text>
            </View>
            <Switch
              value={notificationSettings.analytics}
              onValueChange={() => toggleNotificationType('analytics')}
              trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="bulb" 
                size={20} 
                color="#34C759" 
                style={styles.settingIcon} 
              />
              <Text style={styles.settingLabel}>AI Önerileri</Text>
            </View>
            <Switch
              value={notificationSettings.ai_insight}
              onValueChange={() => toggleNotificationType('ai_insight')}
              trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="cog" 
                size={20} 
                color="#007AFF" 
                style={styles.settingIcon} 
              />
              <Text style={styles.settingLabel}>Sistem Bildirimleri</Text>
            </View>
            <Switch
              value={notificationSettings.system}
              onValueChange={() => toggleNotificationType('system')}
              trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.advancedButton}
            onPress={() => navigation.navigate('SettingsDashboard')}
          >
            <Text style={styles.advancedButtonText}>Gelişmiş Bildirim Ayarları</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#F0F8FF',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    maxWidth: '80%',
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  settingsTitle: {
    fontSize: 16,
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
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
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
});
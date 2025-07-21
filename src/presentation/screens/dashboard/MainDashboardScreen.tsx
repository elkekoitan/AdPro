/**
 * MainDashboardScreen
 * Ana dashboard ekranı
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DashboardStackScreenProps } from '../../navigation/types';
import { DashboardService } from '../../../application/services/DashboardService';
import { MockDashboardRepository } from '../../../infrastructure/repositories/MockDashboardRepository';
import { DashboardData } from '../../../domain/entities/Dashboard';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useRetry } from '../../hooks/useRetry';
import { ErrorFallback } from '../../components/error/ErrorFallback';
import { Logger } from '../../../shared/utils/debug-helpers';
import { useDashboardNavigation } from '../../navigation/hooks/useDashboardNavigation';

// Dashboard components will be imported here
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { CampaignCard } from '../../components/dashboard/CampaignCard';
import { AIInsightCard } from '../../components/dashboard/AIInsightCard';
import { QuickActionCard } from '../../components/dashboard/QuickActionCard';
import { EmptyStateView } from '../../components/dashboard/EmptyStateView';

// Initialize services
const dashboardRepository = new MockDashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);

// Mock user ID (in a real app, this would come from authentication)
const MOCK_USER_ID = 'user_1';

export function MainDashboardScreen({ navigation }: DashboardStackScreenProps<'MainDashboard'>) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const { isConnected } = useNetworkStatus();
  const { retry, isRetrying } = useRetry();
  const dashboardNavigation = useDashboardNavigation();

  const TAG = 'MainDashboardScreen';
  
  // Animation effect when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset opacity to 0 when screen is about to focus
      fadeAnim.setValue(0);
      
      // Animate to full opacity
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      return () => {
        // Optional cleanup if needed
      };
    }, [fadeAnim])
  );

  // Load dashboard data
  const loadDashboardData = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (!refreshing) {
        setLoading(true);
      }
      
      setError(null);
      
      Logger.info(TAG, 'Dashboard verileri yükleniyor', { refresh });
      
      let data;
      if (refresh) {
        data = await dashboardService.refreshDashboard(MOCK_USER_ID);
      } else {
        data = await dashboardService.getDashboardData(MOCK_USER_ID);
      }
      
      setDashboardData(data);
      Logger.info(TAG, 'Dashboard verileri başarıyla yüklendi', { 
        campaignCount: data.campaigns.length,
        insightCount: data.insights.length 
      });
    } catch (err) {
      Logger.error(TAG, 'Dashboard verileri yüklenirken hata oluştu', err);
      setError(err instanceof Error ? err : new Error('Dashboard verileri yüklenemedi'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  // Load data on initial render
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (dashboardData && dashboardService.shouldRefreshDashboard(dashboardData)) {
        loadDashboardData(true);
      }
    }, [dashboardData])
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  // Handle insight dismiss
  const handleDismissInsight = useCallback(async (insightId: string) => {
    try {
      await dashboardService.dismissInsight(MOCK_USER_ID, insightId);
      
      // Update local state to reflect the change
      if (dashboardData) {
        const updatedInsights = dashboardData.insights.map(insight => 
          insight.id === insightId ? { ...insight, dismissed: true } : insight
        );
        
        setDashboardData({
          ...dashboardData,
          insights: updatedInsights
        });
      }
      
      Logger.info(TAG, 'Insight başarıyla kapatıldı', { insightId });
    } catch (err) {
      Logger.error(TAG, 'Insight kapatılırken hata oluştu', err);
      Alert.alert('Hata', 'Öngörü kapatılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [dashboardData]);

  // Handle quick action press
  const handleQuickActionPress = useCallback((actionId: string) => {
    try {
      Logger.info(TAG, 'Quick action pressed', { actionId });
      
      switch (actionId) {
        case 'create_campaign':
          navigation.navigate('Campaigns', { 
            screen: 'CreateCampaign' 
          });
          break;
        case 'connect_platform':
          navigation.navigate('Profile', { 
            screen: 'Settings',
            params: { section: 'connections' }
          });
          break;
        case 'generate_content':
          // Use the correct navigation path within the dashboard stack
          navigation.navigate('AIInsights');
          break;
        case 'view_analytics':
          navigation.navigate('Analytics', { 
            screen: 'AdvancedAnalytics' 
          });
          break;
        case 'notifications':
          // Navigate to notification center within dashboard stack
          navigation.navigate('NotificationCenter');
          break;
        case 'quick_actions':
          // Navigate to quick actions screen within dashboard stack
          navigation.navigate('QuickActions');
          break;
        default:
          Logger.warn(TAG, 'Bilinmeyen quick action', { actionId });
      }
    } catch (error) {
      Logger.error(TAG, 'Navigation error in handleQuickActionPress', error);
      Alert.alert('Hata', 'Ekrana geçiş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [navigation]);
  
  // Handle insight action press
  const handleInsightActionPress = useCallback((action: string) => {
    try {
      Logger.info(TAG, 'Insight action pressed', { action });
      
      // Parse action and navigate accordingly
      if (action.includes('kampanya')) {
        dashboardNavigation.navigateToCampaigns('CreateCampaign');
      } else if (action.includes('bütçe') || action.includes('optimize')) {
        dashboardNavigation.navigateToCampaigns('CampaignList');
      } else if (action.includes('platform') || action.includes('bağla')) {
        dashboardNavigation.navigateToProfile('Settings', { section: 'connections' });
      } else if (action.includes('içerik') || action.includes('metin')) {
        dashboardNavigation.navigateToAIInsights();
      } else {
        // Default to analytics for other actions
        dashboardNavigation.navigateToAnalytics('AdvancedAnalytics');
      }
    } catch (error) {
      Logger.error(TAG, 'Navigation error in handleInsightActionPress', error);
      Alert.alert('Hata', 'Ekrana geçiş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [dashboardNavigation]);

  // Handle campaign press
  const handleCampaignPress = useCallback((campaignId: string) => {
    try {
      Logger.info(TAG, 'Campaign pressed', { campaignId });
      dashboardNavigation.navigateToCampaigns('CampaignDetails', { campaignId });
    } catch (error) {
      Logger.error(TAG, 'Navigation error in handleCampaignPress', error);
      Alert.alert('Hata', 'Kampanya detaylarına geçiş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [dashboardNavigation]);

  // Handle view all insights
  const handleViewAllInsights = useCallback(() => {
    try {
      Logger.info(TAG, 'View all insights pressed');
      dashboardNavigation.navigateToAIInsights();
    } catch (error) {
      Logger.error(TAG, 'Navigation error in handleViewAllInsights', error);
      Alert.alert('Hata', 'AI İçgörüler ekranına geçiş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [dashboardNavigation]);

  // Handle view all campaigns
  const handleViewAllCampaigns = useCallback(() => {
    try {
      Logger.info(TAG, 'View all campaigns pressed');
      dashboardNavigation.navigateToCampaigns('CampaignList');
    } catch (error) {
      Logger.error(TAG, 'Navigation error in handleViewAllCampaigns', error);
      Alert.alert('Hata', 'Kampanya listesi ekranına geçiş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }, [dashboardNavigation]);

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Dashboard yükleniyor...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <ErrorFallback
        error={error}
        resetError={() => retry(() => loadDashboardData())}
        isRetrying={isRetrying}
        message="Dashboard verileri yüklenirken bir hata oluştu."
      />
    );
  }

  // Render empty state if no data
  if (!dashboardData) {
    return (
      <EmptyStateView
        title="Henüz veri yok"
        message="Dashboard verileriniz henüz yüklenmedi. Lütfen tekrar deneyin."
        buttonText="Yenile"
        onButtonPress={() => loadDashboardData(true)}
      />
    );
  }

  // Check if we have no campaigns and insights
  const isEmpty = dashboardData.campaigns.length === 0 && dashboardData.insights.length === 0;

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#007AFF']}
          tintColor="#007AFF"
        />
      }
      showsVerticalScrollIndicator={false}
      bounces={true}
      overScrollMode="always"
      decelerationRate={Platform.OS === 'ios' ? 'normal' : 0.98}
      scrollEventThrottle={16}
    >
      {/* Dashboard Header */}
      <DashboardHeader
        userName="Test Kullanıcı"
        lastUpdated={dashboardData.lastRefresh}
        isConnected={isConnected}
        onRefresh={handleRefresh}
      />

      {isEmpty ? (
        <EmptyStateView
          title="Dashboard'unuzu Kişiselleştirin"
          message="Kampanya oluşturarak veya sosyal medya hesaplarınızı bağlayarak başlayın."
          buttonText="Kampanya Oluştur"
          onButtonPress={() => handleQuickActionPress('create_campaign')}
        />
      ) : (
        <>
          {/* Overview Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genel Bakış</Text>
            <View style={styles.metricsContainer}>
              <MetricCard
                title="Toplam Kampanya"
                value={dashboardData.overview.totalCampaigns.value}
                trend={dashboardData.overview.totalCampaigns.trend}
                changePercentage={dashboardData.overview.totalCampaigns.changePercentage}
                icon="chart-line"
              />
              <MetricCard
                title="Aktif Kampanya"
                value={dashboardData.overview.activeCampaigns.value}
                trend={dashboardData.overview.activeCampaigns.trend}
                changePercentage={dashboardData.overview.activeCampaigns.changePercentage}
                icon="play-circle"
              />
              <MetricCard
                title="Toplam Harcama"
                value={dashboardData.overview.totalSpend.value}
                trend={dashboardData.overview.totalSpend.trend}
                changePercentage={dashboardData.overview.totalSpend.changePercentage}
                icon="money-bill"
                isCurrency
              />
              <MetricCard
                title="ROAS"
                value={dashboardData.overview.roas.value}
                trend={dashboardData.overview.roas.trend}
                changePercentage={dashboardData.overview.roas.changePercentage}
                icon="chart-pie"
                suffix="x"
                precision={2}
              />
            </View>
          </View>

          {/* Active Campaigns */}
          {dashboardData.campaigns.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Aktif Kampanyalar</Text>
                <TouchableOpacity onPress={handleViewAllCampaigns}>
                  <Text style={styles.viewAllText}>Tümünü Gör</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.campaignsContainer}>
                {dashboardData.campaigns.slice(0, 2).map(campaign => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onPress={() => handleCampaignPress(campaign.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* AI Insights */}
          {dashboardData.insights.filter(i => !i.dismissed).length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>AI Öngörüleri</Text>
                <TouchableOpacity onPress={handleViewAllInsights}>
                  <Text style={styles.viewAllText}>Tümünü Gör</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.insightsContainer}>
                {dashboardData.insights
                  .filter(insight => !insight.dismissed)
                  .slice(0, 3)
                  .map(insight => (
                    <AIInsightCard
                      key={insight.id}
                      insight={insight}
                      onDismiss={() => handleDismissInsight(insight.id)}
                      onActionPress={handleInsightActionPress}
                    />
                  ))}
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <View style={styles.quickActionsContainer}>
              {dashboardData.quickActions.map(action => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                  onPress={() => handleQuickActionPress(action.id)}
                />
              ))}
            </View>
          </View>
        </>
      )}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  campaignsContainer: {
    gap: 12,
  },
  insightsContainer: {
    gap: 12,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
});
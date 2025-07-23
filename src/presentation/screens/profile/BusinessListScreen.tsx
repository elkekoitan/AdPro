/**
 * BusinessListScreen Component
 * Business profile management screen
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { ProfileStackParamList } from '../../navigation/types';
import { useAuthUser } from '../../../application/stores/authStore';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';
import { EmptyStateErrorFallback } from '../../components/error/ErrorFallback';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useRetry } from '../../hooks/useRetry';
import { SearchInput } from '../../components/forms/FormInput';

interface BusinessProfile {
  id: string;
  name: string;
  industry: string;
  logo?: string;
  website?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export function BusinessListScreen() {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const user = useAuthUser();
  const { isConnected } = useNetworkStatus();
  const { execute, isRetrying, hasError, reset } = useRetry();
  
  const [isLoading, setIsLoading] = useState(true);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessProfile[]>([]);

  // Load business profiles
  useEffect(() => {
    loadBusinessProfiles();
  }, []);

  // Filter businesses when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBusinesses(businesses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = businesses.filter(business => 
      business.name.toLowerCase().includes(query) || 
      business.industry.toLowerCase().includes(query)
    );
    
    setFilteredBusinesses(filtered);
  }, [searchQuery, businesses]);

  // Load business profiles
  const loadBusinessProfiles = async () => {
    setIsLoading(true);
    
    try {
      await execute(async () => {
        // In a real app, we would fetch from API
        // For now, use mock data
        const mockBusinesses: BusinessProfile[] = [
          {
            id: 'business-1',
            name: 'Acme Corporation',
            industry: 'Technology',
            logo: 'https://via.placeholder.com/100',
            website: 'https://example.com',
            description: 'Leading technology solutions provider',
            isActive: true,
            createdAt: new Date(2023, 5, 15)
          },
          {
            id: 'business-2',
            name: 'Green Gardens',
            industry: 'Agriculture',
            logo: 'https://via.placeholder.com/100',
            website: 'https://greengardens.com',
            description: 'Sustainable farming solutions',
            isActive: true,
            createdAt: new Date(2023, 8, 22)
          },
          {
            id: 'business-3',
            name: 'City Cafe',
            industry: 'Food & Beverage',
            logo: 'https://via.placeholder.com/100',
            website: 'https://citycafe.com',
            description: 'Urban coffee experience',
            isActive: false,
            createdAt: new Date(2023, 2, 10)
          }
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setBusinesses(mockBusinesses);
        setFilteredBusinesses(mockBusinesses);
      });
    } catch (error) {
      console.error('Failed to load business profiles:', error);
      Alert.alert(
        'Yükleme Hatası',
        'İşletme profilleri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle business selection
  const handleSelectBusiness = (business: BusinessProfile) => {
    // navigation.navigate('BusinessProfile', { businessId: business.id });
    console.log('Business selected:', business.id);
  };

  // Handle create new business
  const handleCreateBusiness = () => {
    // navigation.navigate('BusinessProfile', { isNew: true });
    console.log('Create new business');
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Render business item
  const renderBusinessItem = ({ item }: { item: BusinessProfile }) => (
    <TouchableOpacity 
      style={styles.businessCard}
      onPress={() => handleSelectBusiness(item)}
    >
      <View style={styles.businessHeader}>
        {item.logo ? (
          <Image source={{ uri: item.logo }} style={styles.businessLogo} />
        ) : (
          <View style={styles.businessLogoPlaceholder}>
            <Ionicons name="business" size={24} color="#007AFF" />
          </View>
        )}
        
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{item.name}</Text>
          <Text style={styles.businessIndustry}>{item.industry}</Text>
          
          {item.website && (
            <Text style={styles.businessWebsite}>{item.website}</Text>
          )}
        </View>
        
        <View style={[
          styles.statusBadge,
          item.isActive ? styles.activeBadge : styles.inactiveBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.isActive ? styles.activeText : styles.inactiveText
          ]}>
            {item.isActive ? 'Aktif' : 'Pasif'}
          </Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.businessDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.businessFooter}>
        <Text style={styles.businessDate}>
          Oluşturulma: {item.createdAt.toLocaleDateString('tr-TR')}
        </Text>
        
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={16} color="#007AFF" />
          <Text style={styles.editButtonText}>Düzenle</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>İşletme profilleri yükleniyor...</Text>
        </View>
      );
    }

    if (hasError) {
      return (
        <EmptyStateErrorFallback
          title="Yükleme Hatası"
          message="İşletme profilleri yüklenirken bir hata oluştu."
          actionText="Tekrar Dene"
          onAction={loadBusinessProfiles}
        />
      );
    }

    if (businesses.length === 0) {
      return (
        <EmptyStateErrorFallback
          title="Henüz İşletme Yok"
          message="Henüz bir işletme profili oluşturmadınız. Yeni bir işletme profili oluşturmak için aşağıdaki butona tıklayın."
          actionText="İşletme Oluştur"
          onAction={handleCreateBusiness}
        />
      );
    }

    if (filteredBusinesses.length === 0) {
      return (
        <EmptyStateErrorFallback
          title="Sonuç Bulunamadı"
          message={`"${searchQuery}" araması için sonuç bulunamadı.`}
          actionText="Aramayı Temizle"
          onAction={handleClearSearch}
        />
      );
    }

    return null;
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <SearchInput
            placeholder="İşletme ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
            containerStyle={styles.searchContainer}
          />
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateBusiness}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Network Status Warning */}
        {!isConnected && (
          <View style={styles.offlineWarning}>
            <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
            <Text style={styles.offlineText}>
              Çevrimdışı mod - Veriler güncel olmayabilir
            </Text>
          </View>
        )}
        
        {/* Business List */}
        <FlatList
          data={filteredBusinesses}
          renderItem={renderBusinessItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshing={isLoading || isRetrying}
          onRefresh={loadBusinessProfiles}
          showsVerticalScrollIndicator={false}
        />
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flex: 1,
    marginBottom: 0,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    padding: 8,
    justifyContent: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  businessCard: {
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
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  businessLogoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  businessIndustry: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  businessWebsite: {
    fontSize: 12,
    color: '#007AFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeText: {
    color: '#4CAF50',
  },
  inactiveText: {
    color: '#F44336',
  },
  businessDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  businessDate: {
    fontSize: 12,
    color: '#999',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});
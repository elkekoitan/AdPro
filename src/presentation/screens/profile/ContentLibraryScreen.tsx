/**
 * ContentLibraryScreen Component
 * Content organization and management screen
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
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Type alias to handle Ionicons typing issues
const IoniconsIcon = Ionicons as any;
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { ProfileStackParamList } from '../../navigation/types';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';
import { EmptyStateErrorFallback } from '../../components/error/ErrorFallback';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useRetry } from '../../hooks/useRetry';
import { SearchInput } from '../../components/forms/FormInput';

interface ContentItem {
  id: string;
  title: string;
  type: 'image' | 'video' | 'carousel' | 'text';
  thumbnail?: string;
  platform: string;
  publishedAt: Date;
  status: 'published' | 'scheduled' | 'draft';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  tags: string[];
}

export function ContentLibraryScreen() {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { isConnected } = useNetworkStatus();
  const { execute, isRetrying, hasError, reset } = useRetry();
  
  const [isLoading, setIsLoading] = useState(true);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  
  const allTags = ['marketing', 'promotion', 'product', 'announcement', 'event', 'sale'];
  const contentTypes = ['image', 'video', 'carousel', 'text'];
  const platforms = ['instagram', 'facebook', 'twitter', 'linkedin'];

  // Load content items
  useEffect(() => {
    loadContentItems();
  }, []);

  // Filter content when search query or filters change
  useEffect(() => {
    let filtered = [...contentItems];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        item.tags.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(item => 
        selectedTypes.includes(item.type)
      );
    }
    
    // Apply platform filters
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(item => 
        selectedPlatforms.includes(item.platform)
      );
    }
    
    setFilteredContent(filtered);
  }, [searchQuery, contentItems, selectedTags, selectedTypes, selectedPlatforms]);

  // Load content items
  const loadContentItems = async () => {
    setIsLoading(true);
    
    try {
      await execute(async () => {
        // In a real app, we would fetch from API
        // For now, use mock data
        const mockContent: ContentItem[] = [
          {
            id: 'content-1',
            title: 'Summer Sale Announcement',
            type: 'image',
            thumbnail: 'https://via.placeholder.com/300x200',
            platform: 'instagram',
            publishedAt: new Date(2023, 5, 15),
            status: 'published',
            engagement: {
              likes: 245,
              comments: 32,
              shares: 18,
              views: 1250
            },
            tags: ['sale', 'promotion', 'summer']
          },
          {
            id: 'content-2',
            title: 'Product Demo Video',
            type: 'video',
            thumbnail: 'https://via.placeholder.com/300x200',
            platform: 'facebook',
            publishedAt: new Date(2023, 6, 22),
            status: 'published',
            engagement: {
              likes: 189,
              comments: 45,
              shares: 27,
              views: 2340
            },
            tags: ['product', 'demo', 'marketing']
          },
          {
            id: 'content-3',
            title: 'Customer Testimonials',
            type: 'carousel',
            thumbnail: 'https://via.placeholder.com/300x200',
            platform: 'linkedin',
            publishedAt: new Date(2023, 7, 10),
            status: 'published',
            engagement: {
              likes: 132,
              comments: 18,
              shares: 12,
              views: 980
            },
            tags: ['testimonial', 'customer', 'marketing']
          },
          {
            id: 'content-4',
            title: 'Upcoming Event Announcement',
            type: 'text',
            platform: 'twitter',
            publishedAt: new Date(2023, 8, 5),
            status: 'scheduled',
            engagement: {
              likes: 0,
              comments: 0,
              shares: 0,
              views: 0
            },
            tags: ['event', 'announcement']
          },
          {
            id: 'content-5',
            title: 'New Product Launch',
            type: 'image',
            thumbnail: 'https://via.placeholder.com/300x200',
            platform: 'instagram',
            publishedAt: new Date(2023, 8, 15),
            status: 'draft',
            engagement: {
              likes: 0,
              comments: 0,
              shares: 0,
              views: 0
            },
            tags: ['product', 'launch', 'marketing']
          }
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setContentItems(mockContent);
        setFilteredContent(mockContent);
      });
    } catch (error) {
      console.error('Failed to load content items:', error);
      Alert.alert(
        'Yükleme Hatası',
        'İçerik kütüphanesi yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle content item selection
  const handleSelectContent = (content: ContentItem) => {
    // In a real app, navigate to content detail screen
    Alert.alert('İçerik Seçildi', `${content.title} içeriği seçildi.`);
  };

  // Handle create new content
  const handleCreateContent = () => {
    // In a real app, navigate to content creation screen
    Alert.alert('Yeni İçerik', 'Yeni içerik oluşturma ekranı açılacak.');
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Handle type selection
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Handle platform selection
  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedTypes([]);
    setSelectedPlatforms([]);
    setSearchQuery('');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return '#4CAF50';
      case 'scheduled':
        return '#FF9800';
      case 'draft':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Yayında';
      case 'scheduled':
        return 'Zamanlandı';
      case 'draft':
        return 'Taslak';
      default:
        return status;
    }
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'logo-instagram';
      case 'facebook':
        return 'logo-facebook';
      case 'twitter':
        return 'logo-twitter';
      case 'linkedin':
        return 'logo-linkedin';
      default:
        return 'globe';
    }
  };

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      case 'carousel':
        return 'albums';
      case 'text':
        return 'document-text';
      default:
        return 'document';
    }
  };

  // Render content item
  const renderContentItem = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity 
      style={styles.contentCard}
      onPress={() => handleSelectContent(item)}
    >
      <View style={styles.contentHeader}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.contentThumbnail} />
        ) : (
          <View style={[styles.contentThumbnailPlaceholder, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <IoniconsIcon name={getContentTypeIcon(item.type)} size={24} color={getStatusColor(item.status)} />
          </View>
        )}
        
        <View style={styles.contentInfo}>
          <Text style={styles.contentTitle} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.contentMeta}>
            <View style={styles.platformBadge}>
              <IoniconsIcon name={getPlatformIcon(item.platform)} size={12} color="#FFFFFF" />
              <Text style={styles.platformText}>{item.platform}</Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
          
          <Text style={styles.contentDate}>
            {item.status === 'published' ? 'Yayınlandı: ' : item.status === 'scheduled' ? 'Zamanlandı: ' : 'Oluşturuldu: '}
            {item.publishedAt.toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>
      
      {item.status === 'published' && (
        <View style={styles.engagementContainer}>
          <View style={styles.engagementItem}>
            <IoniconsIcon name="heart" size={14} color="#F44336" />
            <Text style={styles.engagementText}>{item.engagement.likes}</Text>
          </View>
          
          <View style={styles.engagementItem}>
            <IoniconsIcon name="chatbubble" size={14} color="#2196F3" />
            <Text style={styles.engagementText}>{item.engagement.comments}</Text>
          </View>
          
          <View style={styles.engagementItem}>
            <IoniconsIcon name="share" size={14} color="#4CAF50" />
            <Text style={styles.engagementText}>{item.engagement.shares}</Text>
          </View>
          
          <View style={styles.engagementItem}>
            <IoniconsIcon name="eye" size={14} color="#9E9E9E" />
            <Text style={styles.engagementText}>{item.engagement.views}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.tagsContainer}>
        {item.tags.map(tag => (
          <View key={tag} style={styles.tagBadge}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.contentFooter}>
        <TouchableOpacity style={styles.actionButton}>
          <IoniconsIcon name="create-outline" size={16} color="#007AFF" />
          <Text style={styles.actionButtonText}>Düzenle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <IoniconsIcon name="copy-outline" size={16} color="#007AFF" />
          <Text style={styles.actionButtonText}>Çoğalt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <IoniconsIcon name="trash-outline" size={16} color="#FF3B30" />
          <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Sil</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render filter chips
  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    >
      {/* Content Type Filters */}
      {contentTypes.map(type => (
        <TouchableOpacity
          key={`type-${type}`}
          style={[
            styles.filterChip,
            selectedTypes.includes(type) && styles.filterChipSelected
          ]}
          onPress={() => handleTypeToggle(type)}
        >
          <IoniconsIcon 
            name={getContentTypeIcon(type)} 
            size={14} 
            color={selectedTypes.includes(type) ? '#FFFFFF' : '#666666'} 
          />
          <Text 
            style={[
              styles.filterChipText,
              selectedTypes.includes(type) && styles.filterChipTextSelected
            ]}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
      
      {/* Platform Filters */}
      {platforms.map(platform => (
        <TouchableOpacity
          key={`platform-${platform}`}
          style={[
            styles.filterChip,
            selectedPlatforms.includes(platform) && styles.filterChipSelected
          ]}
          onPress={() => handlePlatformToggle(platform)}
        >
          <IoniconsIcon 
            name={getPlatformIcon(platform)} 
            size={14} 
            color={selectedPlatforms.includes(platform) ? '#FFFFFF' : '#666666'} 
          />
          <Text 
            style={[
              styles.filterChipText,
              selectedPlatforms.includes(platform) && styles.filterChipTextSelected
            ]}
          >
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
      
      {/* Tag Filters */}
      {allTags.map(tag => (
        <TouchableOpacity
          key={`tag-${tag}`}
          style={[
            styles.filterChip,
            selectedTags.includes(tag) && styles.filterChipSelected
          ]}
          onPress={() => handleTagToggle(tag)}
        >
          <Text 
            style={[
              styles.filterChipText,
              selectedTags.includes(tag) && styles.filterChipTextSelected
            ]}
          >
            #{tag}
          </Text>
        </TouchableOpacity>
      ))}
      
      {/* Clear Filters */}
      {(selectedTags.length > 0 || selectedTypes.length > 0 || selectedPlatforms.length > 0) && (
        <TouchableOpacity
          style={[styles.filterChip, styles.clearFilterChip]}
          onPress={handleClearFilters}
        >
          <IoniconsIcon name="close-circle" size={14} color="#FFFFFF" />
          <Text style={[styles.filterChipText, styles.filterChipTextSelected]}>
            Temizle
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>İçerikler yükleniyor...</Text>
        </View>
      );
    }

    if (hasError) {
      return (
        <EmptyStateErrorFallback
          title="Yükleme Hatası"
          message="İçerikler yüklenirken bir hata oluştu."
          actionText="Tekrar Dene"
          onAction={loadContentItems}
        />
      );
    }

    if (contentItems.length === 0) {
      return (
        <EmptyStateErrorFallback
          title="Henüz İçerik Yok"
          message="Henüz bir içerik oluşturmadınız. Yeni bir içerik oluşturmak için aşağıdaki butona tıklayın."
          actionText="İçerik Oluştur"
          onAction={handleCreateContent}
        />
      );
    }

    if (filteredContent.length === 0) {
      return (
        <EmptyStateErrorFallback
          title="Sonuç Bulunamadı"
          message="Arama kriterlerinize uygun içerik bulunamadı."
          actionText="Filtreleri Temizle"
          onAction={handleClearFilters}
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
            placeholder="İçerik ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
            containerStyle={styles.searchContainer}
          />
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateContent}
          >
            <IoniconsIcon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Filters */}
        {renderFilterChips()}
        
        {/* Network Status Warning */}
        {!isConnected && (
          <View style={styles.offlineWarning}>
            <IoniconsIcon name="cloud-offline" size={16} color="#FFFFFF" />
            <Text style={styles.offlineText}>
              Çevrimdışı mod - Veriler güncel olmayabilir
            </Text>
          </View>
        )}
        
        {/* Content List */}
        <FlatList
          data={filteredContent}
          renderItem={renderContentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshing={isLoading || isRetrying}
          onRefresh={loadContentItems}
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
  },
  clearFilterChip: {
    backgroundColor: '#FF3B30',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
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
  contentCard: {
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
  contentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contentThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  contentThumbnailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  platformText: {
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  contentDate: {
    fontSize: 12,
    color: '#999',
  },
  engagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginVertical: 12,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tagBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 10,
    color: '#666',
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionButtonText: {
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
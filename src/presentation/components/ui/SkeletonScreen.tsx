/**
 * Skeleton Screen Components
 * 
 * Pre-built skeleton screen layouts for common screens.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { SkeletonLoader, SkeletonCard, SkeletonListItem } from './SkeletonLoader';

interface SkeletonScreenProps {
  style?: ViewStyle;
  testID?: string;
}

/**
 * Dashboard Skeleton Screen
 */
export const DashboardSkeletonScreen: React.FC<SkeletonScreenProps> = ({
  style,
  testID = 'dashboardSkeletonScreen',
}) => {
  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      testID={testID}
    >
      {/* Header */}
      <View style={styles.header} testID={`${testID}-header`}>
        <SkeletonLoader
          width={200}
          height={24}
          testID={`${testID}-title`}
        />
        <SkeletonLoader
          width={100}
          height={20}
          style={styles.subtitle}
          testID={`${testID}-subtitle`}
        />
      </View>
      
      {/* Metrics Row */}
      <View style={styles.metricsRow} testID={`${testID}-metrics`}>
        {[1, 2, 3].map(i => (
          <View key={i} style={styles.metricCard}>
            <SkeletonLoader
              width="60%"
              height={16}
              testID={`${testID}-metric-title-${i}`}
            />
            <SkeletonLoader
              width="80%"
              height={24}
              style={styles.metricValue}
              testID={`${testID}-metric-value-${i}`}
            />
          </View>
        ))}
      </View>
      
      {/* Main Content */}
      <View style={styles.section} testID={`${testID}-campaigns`}>
        <SkeletonLoader
          width={150}
          height={20}
          style={styles.sectionTitle}
          testID={`${testID}-campaigns-title`}
        />
        <View style={styles.cardsContainer}>
          {[1, 2].map(i => (
            <SkeletonCard
              key={i}
              style={styles.card}
              testID={`${testID}-campaign-card-${i}`}
            />
          ))}
        </View>
      </View>
      
      {/* AI Insights */}
      <View style={styles.section} testID={`${testID}-insights`}>
        <SkeletonLoader
          width={120}
          height={20}
          style={styles.sectionTitle}
          testID={`${testID}-insights-title`}
        />
        <View style={styles.insightCard}>
          <SkeletonLoader
            width="90%"
            height={16}
            testID={`${testID}-insight-title`}
          />
          <SkeletonLoader
            width="100%"
            height={12}
            style={styles.insightText}
            testID={`${testID}-insight-text-1`}
          />
          <SkeletonLoader
            width="80%"
            height={12}
            style={styles.insightText}
            testID={`${testID}-insight-text-2`}
          />
          <SkeletonLoader
            width="40%"
            height={12}
            style={styles.insightAction}
            testID={`${testID}-insight-action`}
          />
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.section} testID={`${testID}-actions`}>
        <SkeletonLoader
          width={140}
          height={20}
          style={styles.sectionTitle}
          testID={`${testID}-actions-title`}
        />
        <View style={styles.actionsContainer}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.actionButton}>
              <SkeletonLoader
                width={40}
                height={40}
                borderRadius={20}
                testID={`${testID}-action-icon-${i}`}
              />
              <SkeletonLoader
                width={60}
                height={12}
                style={styles.actionText}
                testID={`${testID}-action-text-${i}`}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

/**
 * List Screen Skeleton
 */
export const ListSkeletonScreen: React.FC<SkeletonScreenProps & { itemCount?: number }> = ({
  style,
  itemCount = 8,
  testID = 'listSkeletonScreen',
}) => {
  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      testID={testID}
    >
      {/* Header */}
      <View style={styles.header} testID={`${testID}-header`}>
        <SkeletonLoader
          width={180}
          height={24}
          testID={`${testID}-title`}
        />
        <View style={styles.searchBar}>
          <SkeletonLoader
            width="100%"
            height={40}
            borderRadius={20}
            testID={`${testID}-search`}
          />
        </View>
      </View>
      
      {/* Filter Row */}
      <View style={styles.filterRow} testID={`${testID}-filters`}>
        {[1, 2, 3].map(i => (
          <SkeletonLoader
            key={i}
            width={80}
            height={32}
            borderRadius={16}
            style={styles.filterChip}
            testID={`${testID}-filter-${i}`}
          />
        ))}
      </View>
      
      {/* List Items */}
      <View style={styles.listContainer} testID={`${testID}-list`}>
        {Array.from({ length: itemCount }).map((_, i) => (
          <SkeletonListItem
            key={i}
            style={styles.listItem}
            testID={`${testID}-list-item-${i}`}
          />
        ))}
      </View>
    </ScrollView>
  );
};

/**
 * Detail Screen Skeleton
 */
export const DetailSkeletonScreen: React.FC<SkeletonScreenProps> = ({
  style,
  testID = 'detailSkeletonScreen',
}) => {
  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      testID={testID}
    >
      {/* Header Image */}
      <SkeletonLoader
        width="100%"
        height={200}
        testID={`${testID}-header-image`}
      />
      
      {/* Title Section */}
      <View style={styles.detailHeader} testID={`${testID}-header`}>
        <SkeletonLoader
          width="80%"
          height={28}
          testID={`${testID}-title`}
        />
        <SkeletonLoader
          width="50%"
          height={16}
          style={styles.subtitle}
          testID={`${testID}-subtitle`}
        />
      </View>
      
      {/* Stats Row */}
      <View style={styles.statsRow} testID={`${testID}-stats`}>
        {[1, 2, 3].map(i => (
          <View key={i} style={styles.statItem}>
            <SkeletonLoader
              width={40}
              height={40}
              borderRadius={20}
              testID={`${testID}-stat-icon-${i}`}
            />
            <SkeletonLoader
              width={60}
              height={12}
              style={styles.statText}
              testID={`${testID}-stat-text-${i}`}
            />
          </View>
        ))}
      </View>
      
      {/* Description */}
      <View style={styles.section} testID={`${testID}-description`}>
        <SkeletonLoader
          width={100}
          height={20}
          style={styles.sectionTitle}
          testID={`${testID}-description-title`}
        />
        <SkeletonLoader
          width="100%"
          height={12}
          style={styles.descriptionLine}
          testID={`${testID}-description-line-1`}
        />
        <SkeletonLoader
          width="90%"
          height={12}
          style={styles.descriptionLine}
          testID={`${testID}-description-line-2`}
        />
        <SkeletonLoader
          width="95%"
          height={12}
          style={styles.descriptionLine}
          testID={`${testID}-description-line-3`}
        />
        <SkeletonLoader
          width="80%"
          height={12}
          style={styles.descriptionLine}
          testID={`${testID}-description-line-4`}
        />
      </View>
      
      {/* Related Items */}
      <View style={styles.section} testID={`${testID}-related`}>
        <SkeletonLoader
          width={150}
          height={20}
          style={styles.sectionTitle}
          testID={`${testID}-related-title`}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedContainer}
          testID={`${testID}-related-scroll`}
        >
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.relatedItem}>
              <SkeletonLoader
                width={120}
                height={80}
                borderRadius={8}
                testID={`${testID}-related-image-${i}`}
              />
              <SkeletonLoader
                width={100}
                height={12}
                style={styles.relatedTitle}
                testID={`${testID}-related-item-title-${i}`}
              />
              <SkeletonLoader
                width={60}
                height={10}
                testID={`${testID}-related-item-subtitle-${i}`}
              />
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons} testID={`${testID}-actions`}>
        <SkeletonLoader
          width="45%"
          height={48}
          borderRadius={24}
          testID={`${testID}-action-button-1`}
        />
        <SkeletonLoader
          width="45%"
          height={48}
          borderRadius={24}
          testID={`${testID}-action-button-2`}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightText: {
    marginTop: 8,
  },
  insightAction: {
    marginTop: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
  },
  searchBar: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    marginBottom: 4,
  },
  detailHeader: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    marginTop: 8,
  },
  descriptionLine: {
    marginBottom: 8,
  },
  relatedContainer: {
    paddingVertical: 8,
  },
  relatedItem: {
    marginRight: 16,
    width: 120,
  },
  relatedTitle: {
    marginTop: 8,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
});
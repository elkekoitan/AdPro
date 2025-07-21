/**
 * Skeleton Loader Component
 * 
 * A customizable skeleton loader for content placeholders.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  shimmerEnabled?: boolean;
  shimmerColor?: string;
  backgroundColor?: string;
  testID?: string;
}

/**
 * Skeleton Loader Component
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  shimmerEnabled = true,
  shimmerColor = 'rgba(255, 255, 255, 0.5)',
  backgroundColor = '#E1E9EE',
  testID = 'skeletonLoader',
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shimmerEnabled) {
      startShimmerAnimation();
    }
  }, [shimmerEnabled]);

  const startShimmerAnimation = () => {
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  };

  const getShimmerStyle = () => {
    const translateX = shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-width as number, width as number],
    });

    return {
      transform: [{ translateX }],
    };
  };

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
      testID={testID}
    >
      {shimmerEnabled && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: shimmerColor,
            },
            getShimmerStyle(),
          ]}
          testID={`${testID}-shimmer`}
        />
      )}
    </View>
  );
};

/**
 * Skeleton Card Component
 */
export const SkeletonCard: React.FC<{
  height?: number;
  style?: ViewStyle;
  testID?: string;
}> = ({ height = 120, style, testID = 'skeletonCard' }) => {
  return (
    <View style={[styles.card, { height }, style]} testID={testID}>
      <SkeletonLoader
        height={height * 0.6}
        borderRadius={8}
        testID={`${testID}-image`}
      />
      <View style={styles.cardContent}>
        <SkeletonLoader
          width="70%"
          height={16}
          testID={`${testID}-title`}
        />
        <SkeletonLoader
          width="90%"
          height={12}
          style={styles.cardSubtitle}
          testID={`${testID}-subtitle`}
        />
        <SkeletonLoader
          width="40%"
          height={12}
          testID={`${testID}-footer`}
        />
      </View>
    </View>
  );
};

/**
 * Skeleton List Item Component
 */
export const SkeletonListItem: React.FC<{
  height?: number;
  style?: ViewStyle;
  testID?: string;
}> = ({ height = 80, style, testID = 'skeletonListItem' }) => {
  return (
    <View style={[styles.listItem, { height }, style]} testID={testID}>
      <SkeletonLoader
        width={height - 16}
        height={height - 16}
        borderRadius={height / 2 - 8}
        style={styles.avatar}
        testID={`${testID}-avatar`}
      />
      <View style={styles.listItemContent}>
        <SkeletonLoader
          width="60%"
          height={16}
          testID={`${testID}-title`}
        />
        <SkeletonLoader
          width="90%"
          height={12}
          style={styles.listItemSubtitle}
          testID={`${testID}-subtitle`}
        />
        <SkeletonLoader
          width="30%"
          height={12}
          testID={`${testID}-footer`}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '30%',
    height: '100%',
    opacity: 0.4,
  },
  card: {
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    marginTop: 8,
    gap: 8,
  },
  cardSubtitle: {
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  avatar: {
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
    gap: 8,
  },
  listItemSubtitle: {
    marginTop: 4,
  },
});
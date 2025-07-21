/**
 * Accessible Image Component
 * 
 * A fully accessible image component with alt text support.
 */

import React, { useState } from 'react';
import {
  Image,
  ImageProps,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useAccessibility } from '../../hooks/useAccessibility';

interface AccessibleImageProps extends Omit<ImageProps, 'accessibilityLabel'> {
  alt: string;
  accessibilityHint?: string;
  fallbackSource?: ImageProps['source'];
  showLoadingIndicator?: boolean;
  showErrorMessage?: boolean;
  testID?: string;
}

/**
 * Accessible Image Component
 */
export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  alt,
  accessibilityHint,
  source,
  fallbackSource,
  style,
  resizeMode = 'cover',
  showLoadingIndicator = true,
  showErrorMessage = true,
  testID = 'accessibleImage',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { getImageProps } = useAccessibility();
  
  // Get accessibility props
  const accessibilityProps = getImageProps(alt, accessibilityHint);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    if (props.onLoad) {
      props.onLoad({} as any);
    }
  };
  
  // Handle image error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (props.onError) {
      props.onError({} as any);
    }
  };
  
  return (
    <View style={[styles.container, style]} testID={testID}>
      <Image
        source={hasError && fallbackSource ? fallbackSource : source}
        resizeMode={resizeMode}
        style={styles.image}
        onLoad={handleLoad}
        onError={handleError}
        testID={`${testID}-image`}
        {...accessibilityProps}
        {...props}
      />
      
      {isLoading && showLoadingIndicator && (
        <View style={styles.loadingContainer} testID={`${testID}-loading`}>
          <ActivityIndicator size="small" color="#0066cc" />
        </View>
      )}
      
      {hasError && !fallbackSource && showErrorMessage && (
        <View style={styles.errorContainer} testID={`${testID}-error`}>
          <Text style={styles.errorText}>Failed to load image</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.7)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
});
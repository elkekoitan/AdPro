/**
 * Optimized Image Component
 * 
 * This component provides an optimized image with caching, progressive loading,
 * and performance monitoring.
 */

import React, { useState, useEffect } from 'react';
import {
  Image,
  ImageProps,
  ImageURISource,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { getCachedImageUri } from '../../../shared/utils/image-optimization';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import { Logger } from '../../../shared/utils/debug-helpers';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: ImageURISource;
  lowResSrc?: ImageURISource;
  fallbackSrc?: ImageURISource;
  showLoadingIndicator?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  priority?: 'low' | 'normal' | 'high';
  cacheEnabled?: boolean;
  progressiveLoading?: boolean;
}

/**
 * Optimized Image Component
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  lowResSrc,
  fallbackSrc,
  showLoadingIndicator = false,
  resizeMode = 'cover',
  priority = 'normal',
  cacheEnabled = true,
  progressiveLoading = true,
  style,
  onLoad,
  onError,
  testID,
  ...props
}) => {
  const [imageSource, setImageSource] = useState<ImageURISource>(
    lowResSrc && progressiveLoading ? lowResSrc : source
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [imageOpacity, setImageOpacity] = useState<number>(lowResSrc ? 0 : 1);
  
  const { trackOperation } = usePerformanceOptimization({
    componentName: 'OptimizedImage',
    trackRender: false,
  });
  
  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      if (!source.uri) return;
      
      try {
        const endTracking = trackOperation('loadImage');
        
        // Get cached image URI if caching is enabled
        let finalUri = source.uri;
        
        if (cacheEnabled) {
          finalUri = await getCachedImageUri(source.uri);
        }
        
        if (isMounted) {
          // If we're using progressive loading and have a low-res source,
          // we need to update the source and animate the opacity
          if (progressiveLoading && lowResSrc) {
            setImageSource({ ...source, uri: finalUri });
          } else {
            setImageSource({ ...source, uri: finalUri });
            setIsLoading(false);
          }
        }
        
        endTracking();
      } catch (error) {
        Logger.error('OptimizedImage', `Failed to load image: ${source.uri}`, error);
        
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
          
          // Use fallback source if available
          if (fallbackSrc) {
            setImageSource(fallbackSrc);
          }
        }
      }
    };
    
    // Load the image
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [source.uri, cacheEnabled, progressiveLoading, lowResSrc, fallbackSrc]);
  
  // Handle image load
  const handleLoad = (event: any) => {
    // If we're using progressive loading and this is the high-res image
    if (progressiveLoading && imageSource !== lowResSrc) {
      // Animate opacity
      setImageOpacity(1);
    }
    
    setIsLoading(false);
    
    // Call original onLoad handler
    if (onLoad) {
      onLoad(event);
    }
  };
  
  // Handle image error
  const handleError = (event: any) => {
    setIsLoading(false);
    setHasError(true);
    
    // Use fallback source if available
    if (fallbackSrc) {
      setImageSource(fallbackSrc);
    }
    
    // Call original onError handler
    if (onError) {
      onError(event);
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      <Image
        {...props}
        source={imageSource}
        style={[
          StyleSheet.absoluteFill,
          { opacity: imageOpacity },
          styles.image,
          { resizeMode },
        ]}
        onLoad={handleLoad}
        onError={handleError}
        testID={testID}
        // Set loading priority
        {...(Platform.OS === 'android' && { loadingPriority: priority })}
      />
      
      {isLoading && showLoadingIndicator && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0', // Placeholder color
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
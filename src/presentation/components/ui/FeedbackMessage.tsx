/**
 * Feedback Message Component
 * 
 * A component for displaying user feedback messages (success, error, info, warning).
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackMessageProps {
  message: string;
  type?: FeedbackType;
  duration?: number;
  onDismiss?: () => void;
  showDismissButton?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  icon?: React.ReactNode;
}

/**
 * Feedback Message Component
 */
export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  showDismissButton = true,
  style,
  textStyle,
  testID = 'feedbackMessage',
  icon,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Auto-dismiss after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        dismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const dismiss = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };
  
  // Get color based on type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#DFF2BF';
      case 'error':
        return '#FFBABA';
      case 'warning':
        return '#FEEFB3';
      case 'info':
      default:
        return '#BDE5F8';
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case 'success':
        return '#4F8A10';
      case 'error':
        return '#D8000C';
      case 'warning':
        return '#9F6000';
      case 'info':
      default:
        return '#00529B';
    }
  };
  
  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity,
        },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.content} testID={`${testID}-content`}>
        <View style={styles.iconContainer} testID={`${testID}-icon`}>
          {icon || (
            <Text style={[styles.icon, { color: getTextColor() }]}>
              {getDefaultIcon()}
            </Text>
          )}
        </View>
        <Text
          style={[styles.message, { color: getTextColor() }, textStyle]}
          testID={`${testID}-text`}
        >
          {message}
        </Text>
      </View>
      
      {showDismissButton && (
        <TouchableOpacity
          onPress={dismiss}
          style={styles.dismissButton}
          testID={`${testID}-dismiss`}
        >
          <Text style={[styles.dismissText, { color: getTextColor() }]}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

/**
 * Toast Message Component
 */
interface ToastMessageProps extends FeedbackMessageProps {
  position?: 'top' | 'bottom';
}

export const ToastMessage: React.FC<ToastMessageProps> = ({
  position = 'bottom',
  style,
  ...props
}) => {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  
  useEffect(() => {
    // Slide in
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View
      style={[
        styles.toast,
        position === 'top' ? styles.toastTop : styles.toastBottom,
        {
          transform: [{ translateY }],
        },
        style,
      ]}
      testID={`toast-${props.testID || 'message'}`}
    >
      <FeedbackMessage {...props} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastTop: {
    top: 40,
  },
  toastBottom: {
    bottom: 40,
  },
});
/**
 * Form Error Components
 * Form hata gösterimi için component'ler
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface FormErrorProps {
  error?: string;
  visible?: boolean;
  style?: any;
  textStyle?: any;
  animated?: boolean;
}

/**
 * Basic form error component
 */
export const FormError: React.FC<FormErrorProps> = ({
  error,
  visible = true,
  style,
  textStyle,
  animated = true,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (animated) {
      Animated.timing(fadeAnim, {
        toValue: error && visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [error, visible, animated, fadeAnim]);

  if (!error || !visible) {
    return null;
  }

  const ErrorComponent = animated ? Animated.View : View;

  return (
    <ErrorComponent 
      style={[
        styles.container, 
        style,
        animated && { opacity: fadeAnim }
      ]}
    >
      <Text style={[styles.errorText, textStyle]}>
        {error}
      </Text>
    </ErrorComponent>
  );
};

/**
 * Inline form error (for use next to form fields)
 */
export const InlineFormError: React.FC<FormErrorProps> = ({
  error,
  visible = true,
  style,
  textStyle,
}) => {
  if (!error || !visible) {
    return null;
  }

  return (
    <View style={[styles.inlineContainer, style]}>
      <Text style={[styles.inlineErrorText, textStyle]}>
        ⚠️ {error}
      </Text>
    </View>
  );
};

/**
 * Form error summary (shows all form errors)
 */
export const FormErrorSummary: React.FC<{
  errors: Record<string, string>;
  visible?: boolean;
  style?: any;
  title?: string;
  maxErrors?: number;
}> = ({
  errors,
  visible = true,
  style,
  title = 'Lütfen aşağıdaki hataları düzeltin:',
  maxErrors = 5,
}) => {
  const errorList = Object.entries(errors).slice(0, maxErrors);

  if (errorList.length === 0 || !visible) {
    return null;
  }

  return (
    <View style={[styles.summaryContainer, style]}>
      <Text style={styles.summaryTitle}>{title}</Text>
      {errorList.map(([field, error], index) => (
        <View key={field} style={styles.summaryItem}>
          <Text style={styles.summaryBullet}>•</Text>
          <Text style={styles.summaryText}>{error}</Text>
        </View>
      ))}
      {Object.keys(errors).length > maxErrors && (
        <Text style={styles.summaryMore}>
          ve {Object.keys(errors).length - maxErrors} hata daha...
        </Text>
      )}
    </View>
  );
};

/**
 * Field error tooltip
 */
export const FieldErrorTooltip: React.FC<{
  error?: string;
  visible?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  style?: any;
}> = ({
  error,
  visible = true,
  position = 'bottom',
  style,
}) => {
  if (!error || !visible) {
    return null;
  }

  const getTooltipStyle = () => {
    switch (position) {
      case 'top':
        return styles.tooltipTop;
      case 'left':
        return styles.tooltipLeft;
      case 'right':
        return styles.tooltipRight;
      default:
        return styles.tooltipBottom;
    }
  };

  return (
    <View style={[styles.tooltipContainer, getTooltipStyle(), style]}>
      <View style={styles.tooltipBubble}>
        <Text style={styles.tooltipText}>{error}</Text>
      </View>
    </View>
  );
};

/**
 * Form validation status indicator
 */
export const ValidationStatus: React.FC<{
  isValid?: boolean;
  isValidating?: boolean;
  hasErrors?: boolean;
  style?: any;
}> = ({
  isValid = false,
  isValidating = false,
  hasErrors = false,
  style,
}) => {
  const getStatusIcon = () => {
    if (isValidating) return '⏳';
    if (hasErrors) return '❌';
    if (isValid) return '✅';
    return '⚪';
  };

  const getStatusColor = () => {
    if (isValidating) return '#ffc107';
    if (hasErrors) return '#dc3545';
    if (isValid) return '#28a745';
    return '#6c757d';
  };

  const getStatusText = () => {
    if (isValidating) return 'Kontrol ediliyor...';
    if (hasErrors) return 'Hatalar var';
    if (isValid) return 'Geçerli';
    return 'Bekliyor';
  };

  return (
    <View style={[styles.statusContainer, style]}>
      <Text style={[styles.statusIcon, { color: getStatusColor() }]}>
        {getStatusIcon()}
      </Text>
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

/**
 * Error boundary for form components
 */
export class FormErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Form error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={styles.errorBoundaryContainer}>
          <Text style={styles.errorBoundaryText}>
            Form yüklenirken bir hata oluştu
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    lineHeight: 16,
  },
  
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  inlineErrorText: {
    fontSize: 11,
    color: '#dc3545',
    flex: 1,
  },
  
  summaryContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#721c24',
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  summaryBullet: {
    fontSize: 12,
    color: '#721c24',
    marginRight: 6,
    marginTop: 1,
  },
  summaryText: {
    fontSize: 12,
    color: '#721c24',
    flex: 1,
    lineHeight: 16,
  },
  summaryMore: {
    fontSize: 11,
    color: '#721c24',
    fontStyle: 'italic',
    marginTop: 4,
  },
  
  tooltipContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  tooltipBottom: {
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
  },
  tooltipTop: {
    bottom: '100%',
    left: 0,
    right: 0,
    marginBottom: 4,
  },
  tooltipLeft: {
    right: '100%',
    top: 0,
    marginRight: 4,
  },
  tooltipRight: {
    left: '100%',
    top: 0,
    marginLeft: 4,
  },
  tooltipBubble: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipText: {
    fontSize: 11,
    color: '#ffffff',
    textAlign: 'center',
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  
  errorBoundaryContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    alignItems: 'center',
  },
  errorBoundaryText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});
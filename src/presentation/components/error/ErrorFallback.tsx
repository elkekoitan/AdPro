/**
 * Error Fallback Components
 * Farklı hata durumları için özelleştirilmiş fallback component'leri
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface ErrorFallbackProps {
  error?: Error;
  retry?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
  showDetails?: boolean;
}

/**
 * Generic error fallback component
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
  title = 'Bir Hata Oluştu',
  message = 'Beklenmedik bir sorun oluştu. Lütfen tekrar deneyin.',
  showRetry = true,
  showDetails = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        {showDetails && error && __DEV__ && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Hata Detayları:</Text>
            <Text style={styles.detailsText}>{error.message}</Text>
          </View>
        )}
        
        {showRetry && retry && (
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/**
 * Network error fallback
 */
export const NetworkErrorFallback: React.FC<{ retry?: () => void }> = ({ retry }) => {
  return (
    <ErrorFallback
      title="Bağlantı Sorunu"
      message="İnternet bağlantınızı kontrol edin ve tekrar deneyin."
      retry={retry}
      showRetry={true}
    />
  );
};

/**
 * Loading error fallback
 */
export const LoadingErrorFallback: React.FC<{ retry?: () => void }> = ({ retry }) => {
  return (
    <ErrorFallback
      title="Yükleme Hatası"
      message="Veriler yüklenirken bir sorun oluştu."
      retry={retry}
      showRetry={true}
    />
  );
};

/**
 * Not found error fallback
 */
export const NotFoundErrorFallback: React.FC<{ 
  retry?: () => void;
  resourceName?: string;
}> = ({ retry, resourceName = 'İçerik' }) => {
  return (
    <ErrorFallback
      title="Bulunamadı"
      message={`${resourceName} bulunamadı veya artık mevcut değil.`}
      retry={retry}
      showRetry={false}
    />
  );
};

/**
 * Permission error fallback
 */
export const PermissionErrorFallback: React.FC<{ retry?: () => void }> = ({ retry }) => {
  return (
    <ErrorFallback
      title="Yetki Hatası"
      message="Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor."
      retry={retry}
      showRetry={false}
    />
  );
};

/**
 * Compact error fallback for small components
 */
export const CompactErrorFallback: React.FC<{
  error?: Error;
  retry?: () => void;
  message?: string;
}> = ({ error, retry, message = 'Hata oluştu' }) => {
  return (
    <View style={styles.compactContainer}>
      <Text style={styles.compactIcon}>⚠️</Text>
      <Text style={styles.compactMessage}>{message}</Text>
      {retry && (
        <TouchableOpacity style={styles.compactRetryButton} onPress={retry}>
          <Text style={styles.compactRetryText}>↻</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Inline error fallback for form fields
 */
export const InlineErrorFallback: React.FC<{
  message: string;
  retry?: () => void;
}> = ({ message, retry }) => {
  return (
    <View style={styles.inlineContainer}>
      <Text style={styles.inlineMessage}>{message}</Text>
      {retry && (
        <TouchableOpacity onPress={retry}>
          <Text style={styles.inlineRetryText}>Tekrar dene</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Empty state error fallback
 */
export const EmptyStateErrorFallback: React.FC<{
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}> = ({ 
  title = 'Henüz İçerik Yok',
  message = 'Görüntülenecek içerik bulunmuyor.',
  actionText,
  onAction,
}) => {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>📭</Text>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateMessage}>{message}</Text>
      
      {actionText && onAction && (
        <TouchableOpacity style={styles.emptyStateButton} onPress={onAction}>
          <Text style={styles.emptyStateButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  detailsContainer: {
    backgroundColor: '#f1f3f4',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
    width: '100%',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  compactIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  compactMessage: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
  },
  compactRetryButton: {
    marginLeft: 8,
    padding: 4,
  },
  compactRetryText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  
  // Inline styles
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  inlineMessage: {
    flex: 1,
    fontSize: 14,
    color: '#dc3545',
  },
  inlineRetryText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
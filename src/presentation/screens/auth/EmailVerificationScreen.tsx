/**
 * Email Verification Screen
 * Email verification confirmation screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AuthStackScreenProps } from '@/presentation/navigation/types';
import { useNetworkStatus } from '@/presentation/hooks/useNetworkStatus';
import { useRetry } from '@/presentation/hooks/useRetry';
import { ErrorBoundary } from '@/presentation/components/error/ErrorBoundary';
import { NetworkErrorFallback } from '@/presentation/components/error/ErrorFallback';
import { AuthService } from '@/application/services/AuthService';
import { SupabaseAuthRepository } from '@/infrastructure/repositories/SupabaseAuthRepository';
import { MockAuthRepository } from '@/infrastructure/repositories/MockAuthRepository';
import { Logger } from '@/shared/utils/debug-helpers';
import { AppError, ErrorCode } from '@/shared/types/errors';

// Initialize auth service with appropriate repository
// In a real app, this would be injected via dependency injection
const authRepository = __DEV__ ? new MockAuthRepository() : new SupabaseAuthRepository();
const authService = new AuthService(authRepository);

const TAG = 'EmailVerificationScreen';

export const EmailVerificationScreen: React.FC<AuthStackScreenProps<'EmailVerification'>> = ({ navigation, route }) => {
  const { email } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const { isConnected } = useNetworkStatus();
  const { execute: executeWithRetry, isRetrying, canRetry } = useRetry();

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0 && !isResendEnabled) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isResendEnabled) {
      setIsResendEnabled(true);
    }
  }, [countdown, isResendEnabled]);

  // Handle resend verification email
  const handleResendEmail = async () => {
    try {
      setIsSubmitting(true);
      setGeneralError(null);
      setIsResendEnabled(false);

      // Check network connectivity
      if (!isConnected) {
        setGeneralError('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
        setIsResendEnabled(true);
        return;
      }

      // Execute resend verification email with retry capability
      await executeWithRetry(async () => {
        Logger.info(TAG, 'Resending verification email', { email });
        
        await authService.sendEmailVerification(email);

        Logger.info(TAG, 'Verification email resent successfully');
        
        // Reset countdown
        setCountdown(60);
      });
    } catch (error) {
      Logger.error(TAG, 'Resend verification email failed', error);
      
      // Handle specific error types
      if (error instanceof AppError) {
        switch (error.code) {
          case ErrorCode.USER_NOT_FOUND:
            setGeneralError('Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.');
            break;
          case ErrorCode.NETWORK_ERROR:
            setGeneralError('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
            break;
          default:
            setGeneralError(error.message || 'Doğrulama e-postası gönderilirken bir hata oluştu.');
        }
      } else {
        setGeneralError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
      
      setIsResendEnabled(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle verification complete
  const handleVerificationComplete = () => {
    // In a real app, we would verify the token here
    // For now, just navigate to login screen
    navigation.navigate('Login');
  };

  // Handle back to login
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ErrorBoundary>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>E-posta Doğrulama</Text>
            <Text style={styles.subtitle}>
              Hesabınızı doğrulamak için e-posta adresinize bir bağlantı gönderdik
            </Text>
          </View>

          {!isConnected && (
            <NetworkErrorFallback retry={() => {}} />
          )}

          {generalError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{generalError}</Text>
              {canRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={handleResendEmail}>
                  <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.emailContainer}>
            <Text style={styles.emailLabel}>Doğrulama e-postası gönderildi:</Text>
            <Text style={styles.emailValue}>{email}</Text>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Sonraki Adımlar:</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1.</Text>
              <Text style={styles.instructionText}>
                E-posta gelen kutunuzu kontrol edin ve doğrulama bağlantısına tıklayın.
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2.</Text>
              <Text style={styles.instructionText}>
                E-postayı göremiyorsanız spam/önemsiz klasörünü kontrol edin.
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3.</Text>
              <Text style={styles.instructionText}>
                E-posta doğrulamasını tamamladıktan sonra aşağıdaki butona tıklayın.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.verificationButton}
            onPress={handleVerificationComplete}
          >
            <Text style={styles.verificationButtonText}>Doğrulamayı Tamamladım</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>E-posta almadınız mı?</Text>
            <TouchableOpacity
              style={[
                styles.resendButton,
                (!isResendEnabled || isSubmitting || isRetrying) && styles.resendButtonDisabled,
              ]}
              onPress={handleResendEmail}
              disabled={!isResendEnabled || isSubmitting || isRetrying}
            >
              {(isSubmitting || isRetrying) ? (
                <ActivityIndicator color="#007bff" size="small" />
              ) : (
                <Text style={styles.resendButtonText}>
                  {isResendEnabled ? 'Tekrar Gönder' : `Tekrar Gönder (${countdown}s)`}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <Text style={styles.backButtonText}>Giriş Ekranına Dön</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  emailContainer: {
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  emailLabel: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  instructionsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    width: 24,
  },
  instructionText: {
    fontSize: 16,
    color: '#495057',
    flex: 1,
    lineHeight: 22,
  },
  verificationButton: {
    backgroundColor: '#28a745',
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    width: '100%',
  },
  verificationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  resendButton: {
    padding: 8,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EmailVerificationScreen;
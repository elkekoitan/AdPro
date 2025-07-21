/**
 * Forgot Password Screen
 * Password reset request screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AuthStackScreenProps } from '@/presentation/navigation/types';
import { useFormValidation } from '@/presentation/hooks/useFormValidation';
import { ValidationRules } from '@/shared/utils/form-validation';
import { EmailInput } from '@/presentation/components/forms/FormInput';
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

const TAG = 'ForgotPasswordScreen';

export const ForgotPasswordScreen: React.FC<AuthStackScreenProps<'ForgotPassword'>> = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { isConnected } = useNetworkStatus();
  const { execute: executeWithRetry, isRetrying, canRetry } = useRetry();

  // Form validation
  const {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setTouched,
    validateField,
    validateForm,
    handleSubmit,
    reset,
  } = useFormValidation({
    initialValues: {
      email: '',
    },
    validationSchema: {
      email: {
        ...ValidationRules.required('E-posta adresi gereklidir'),
        ...ValidationRules.email('Geçerli bir e-posta adresi giriniz'),
      },
    },
  });

  // Handle password reset request
  const handleResetRequest = async () => {
    try {
      setIsSubmitting(true);
      setGeneralError(null);
      setIsSuccess(false);

      // Validate form
      const isFormValid = await validateForm();
      if (!isFormValid) {
        Logger.warn(TAG, 'Form validation failed', errors);
        return;
      }

      // Check network connectivity
      if (!isConnected) {
        setGeneralError('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
        return;
      }

      // Execute password reset request with retry capability
      await executeWithRetry(async () => {
        Logger.info(TAG, 'Sending password reset email', { email: values.email });
        
        await authService.sendPasswordResetEmail(values.email);

        Logger.info(TAG, 'Password reset email sent successfully');
        
        // Show success message
        setIsSuccess(true);
        reset(); // Clear form
      });
    } catch (error) {
      Logger.error(TAG, 'Password reset request failed', error);
      
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
            setGeneralError(error.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu.');
        }
      } else {
        setGeneralError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate back to login screen
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Şifremi Unuttum</Text>
            <Text style={styles.subtitle}>
              Şifre sıfırlama bağlantısı için e-posta adresinizi girin
            </Text>
          </View>

          {!isConnected && (
            <NetworkErrorFallback retry={() => {}} />
          )}

          {generalError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{generalError}</Text>
              {canRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={handleResetRequest}>
                  <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {isSuccess && (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>E-posta Gönderildi</Text>
              <Text style={styles.successText}>
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
                Lütfen gelen kutunuzu kontrol edin.
              </Text>
            </View>
          )}

          {!isSuccess && (
            <View style={styles.form}>
              <EmailInput
                label="E-posta"
                placeholder="E-posta adresinizi girin"
                value={values.email}
                error={errors.email}
                touched={touched.email}
                onChangeText={(text) => setValue('email', text)}
                onBlur={() => {
                  setTouched('email');
                  validateField('email');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                required
              />

              <TouchableOpacity
                style={[
                  styles.resetButton,
                  (!isValid || isSubmitting || isRetrying) && styles.resetButtonDisabled,
                ]}
                onPress={handleSubmit(handleResetRequest)}
                disabled={!isValid || isSubmitting || isRetrying}
              >
                {(isSubmitting || isRetrying) ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.resetButtonText}>Şifre Sıfırlama Bağlantısı Gönder</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLogin}
          >
            <Text style={styles.backButtonText}>Giriş Ekranına Dön</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
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
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
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
  successContainer: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 6,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    color: '#28a745',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#155724',
    textAlign: 'center',
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  resetButtonDisabled: {
    backgroundColor: '#b3d7ff',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
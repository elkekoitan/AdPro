/**
 * Login Screen
 * User authentication screen with email/password login
 * 
 * This component handles both Login and SignIn routes
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Image,
} from 'react-native';
import { AuthStackScreenProps } from '../../navigation/types';
import { useFormValidation } from '../../hooks/useFormValidation';
import { ValidationSchemas } from '../../../shared/utils/form-validation';
import { EmailInput, PasswordInput } from '../../components/forms/FormInput';
import { FormErrorSummary } from '../../components/forms/FormError';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useRetry } from '../../hooks/useRetry';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';
import { NetworkErrorFallback } from '../../components/error/ErrorFallback';
import { AuthService } from '../../../application/services/AuthService';
import { SupabaseAuthRepository } from '../../../infrastructure/repositories/SupabaseAuthRepository';
import { MockAuthRepository } from '../../../infrastructure/repositories/MockAuthRepository';
import { Logger } from '../../../shared/utils/debug-helpers';
import { AppError, ErrorCode } from '../../../shared/types/errors';
import { useAuthStore } from '../../../application/stores/authStore';

// Initialize auth service with real Supabase for testing
// In a real app, this would be injected via dependency injection
const authRepository = new SupabaseAuthRepository();

const authService = new AuthService(authRepository);

const TAG = 'LoginScreen';

/**
 * Login/SignIn Screen Component
 * Handles both Login and SignIn routes with the same implementation
 */
export const LoginScreen: React.FC<AuthStackScreenProps<'Login' | 'SignIn'>> = ({ navigation, route }) => {
  // Get route name to customize UI based on whether it's Login or SignIn
  const routeName = route.name;
  
  // Auth store for global state
  const { isLoading: isAuthLoading, error: authError } = useAuthStore();
  
  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Network status hook
  const { isConnected, checkConnectivity } = useNetworkStatus();
  
  // Retry logic hook
  const { execute: executeWithRetry, isRetrying, canRetry, attempt: retryAttempt } = useRetry();

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
    reset: resetForm,
  } = useFormValidation({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: ValidationSchemas.login,
  });

  // Clear general error when form values change
  useEffect(() => {
    if (generalError) {
      setGeneralError(null);
    }
  }, [values, generalError]);

  // Set auth error as general error if present
  useEffect(() => {
    if (authError) {
      setGeneralError(authError);
    }
  }, [authError]);

  // Handle login submission
  const handleLogin = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setGeneralError(null);

      // Validate form
      const isFormValid = await validateForm();
      if (!isFormValid) {
        Logger.warn(TAG, 'Form validation failed', errors);
        return;
      }

      // Check network connectivity
      if (!isConnected) {
        await checkConnectivity();
        if (!isConnected) {
          setGeneralError('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
          return;
        }
      }

      // Execute login with retry capability
      await executeWithRetry(async () => {
        Logger.info(TAG, 'Attempting login', { email: values.email });
        
        await authService.login({
          email: values.email,
          password: values.password,
        });

        Logger.info(TAG, 'Login successful');
        
        // Navigation will be handled by navigation guards
        // The AuthNavigator will redirect to Main if authentication is successful
      });
    } catch (error) {
      Logger.error(TAG, 'Login failed', error);
      
      // Handle specific error types
      if (error instanceof AppError) {
        switch (error.code) {
          case ErrorCode.INVALID_CREDENTIALS:
            setGeneralError('E-posta veya şifre hatalı.');
            break;
          case ErrorCode.EMAIL_NOT_VERIFIED:
            setGeneralError('E-posta adresiniz doğrulanmamış.');
            // Navigate to email verification screen
            navigation.navigate('EmailVerification', { email: values.email });
            break;
          case ErrorCode.NETWORK_ERROR:
            setGeneralError('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
            break;
          case ErrorCode.USER_NOT_FOUND:
            setGeneralError('Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.');
            break;
          case ErrorCode.RATE_LIMIT_EXCEEDED:
            setGeneralError('Çok fazla giriş denemesi yaptınız. Lütfen daha sonra tekrar deneyin.');
            break;
          default:
            setGeneralError(error.message || 'Giriş yapılırken bir hata oluştu.');
        }
      } else {
        setGeneralError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, errors, isConnected, checkConnectivity, executeWithRetry, validateForm, navigation]);

  // Navigate to register screen
  const handleRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  // Navigate to forgot password screen
  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  // Test login with demo credentials
  const handleDemoLogin = useCallback(() => {
    setValue('email', 'test@example.com');
    setValue('password', 'password123');
    
    // Trigger validation
    setTouched('email');
    setTouched('password');
    validateField('email');
    validateField('password');
    
    // Submit after a short delay to show the filled fields
    setTimeout(async () => {
      await handleLogin();
    }, 300);
  }, [setValue, setTouched, validateField, handleSubmit, handleLogin]);

  // Reset form and errors
  const handleReset = useCallback(() => {
    resetForm();
    setGeneralError(null);
  }, [resetForm]);

  // Loading state combines all loading indicators
  const isLoading = isSubmitting || isRetrying || isAuthLoading;

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
            <Text style={styles.title}>Hoş Geldiniz</Text>
            <Text style={styles.subtitle}>Hesabınıza giriş yapın</Text>
          </View>

          {!isConnected && (
            <NetworkErrorFallback retry={checkConnectivity} />
          )}

          {generalError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{generalError}</Text>
              {canRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={handleLogin}>
                  <Text style={styles.retryButtonText}>
                    Tekrar Dene {retryAttempt > 0 ? `(${retryAttempt})` : ''}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

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
              showValidationStatus
              editable={!isLoading}
            />

            <PasswordInput
              label="Şifre"
              placeholder="Şifrenizi girin"
              value={values.password}
              error={errors.password}
              touched={touched.password}
              onChangeText={(text) => setValue('password', text)}
              onBlur={() => {
                setTouched('password');
                validateField('password');
              }}
              required
              showValidationStatus
              editable={!isLoading}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                disabled={isLoading}
              >
                <Text style={styles.resetButtonText}>Temizle</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                (!isValid || isLoading) && styles.loginButtonDisabled,
              ]}
              onPress={handleSubmit(handleLogin)}
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.loadingText}>
                    {isRetrying ? 'Tekrar Deneniyor...' : 'Giriş Yapılıyor...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>

            {__DEV__ && (
              <TouchableOpacity
                style={styles.demoButton}
                onPress={handleDemoLogin}
                disabled={isLoading}
              >
                <Text style={styles.demoButtonText}>Demo Giriş</Text>
              </TouchableOpacity>
            )}

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Hesabınız yok mu?</Text>
              <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
                <Text style={styles.registerButtonText}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordButton: {
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: '#007bff',
    fontSize: 14,
  },
  resetButton: {
    paddingVertical: 4,
  },
  resetButtonText: {
    color: '#6c757d',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    backgroundColor: '#b3d7ff',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  demoButton: {
    backgroundColor: '#28a745',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  demoButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  registerText: {
    color: '#666666',
    fontSize: 14,
    marginRight: 4,
  },
  registerButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;
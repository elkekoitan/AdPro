/**
 * Register Screen
 * User registration screen with form validation
 * 
 * This component handles both Register and SignUp routes
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
} from 'react-native';
import { AuthStackScreenProps } from '@/presentation/navigation/types';
import { useFormValidation } from '@/presentation/hooks/useFormValidation';
import { ValidationRules, ValidationSchemas } from '@/shared/utils/form-validation';
import { FormInput, EmailInput, PasswordInput } from '@/presentation/components/forms/FormInput';
import { FormErrorSummary } from '@/presentation/components/forms/FormError';
import { useNetworkStatus } from '@/presentation/hooks/useNetworkStatus';
import { useRetry } from '@/presentation/hooks/useRetry';
import { ErrorBoundary } from '@/presentation/components/error/ErrorBoundary';
import { NetworkErrorFallback } from '@/presentation/components/error/ErrorFallback';
import { AuthService } from '@/application/services/AuthService';
import { SupabaseAuthRepository } from '@/infrastructure/repositories/SupabaseAuthRepository';
import { MockAuthRepository } from '@/infrastructure/repositories/MockAuthRepository';
import { Logger } from '@/shared/utils/debug-helpers';
import { AppError, ErrorCode } from '@/shared/types/errors';
import { useAuthStore } from '@/application/stores/authStore';
import { UserValidation } from '@/domain/entities/User';

// Initialize auth service with appropriate repository
// In a real app, this would be injected via dependency injection
const authRepository = __DEV__ ? new MockAuthRepository() : new SupabaseAuthRepository();
const authService = new AuthService(authRepository);

const TAG = 'RegisterScreen';

export const RegisterScreen: React.FC<AuthStackScreenProps<'Register' | 'SignUp'>> = ({ navigation, route }) => {
  // Get route name to customize UI based on whether it's Register or SignUp
  const routeName = route.name;
  
  // Auth store for global state
  const { isLoading: isAuthLoading, error: authError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { isConnected } = useNetworkStatus();
  const { execute: executeWithRetry, isRetrying, canRetry } = useRetry();

  // Form validation with enhanced password validation
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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      businessName: '',
    },
    validationSchema: {
      name: {
        ...ValidationRules.required('Ad soyad gereklidir'),
        ...ValidationRules.minLength(2, 'Ad soyad en az 2 karakter olmalıdır'),
        ...ValidationRules.maxLength(50, 'Ad soyad en fazla 50 karakter olabilir'),
      },
      email: {
        ...ValidationRules.required('E-posta adresi gereklidir'),
        ...ValidationRules.email('Geçerli bir e-posta adresi giriniz'),
        custom: (value) => {
          if (!UserValidation.isValidEmail(value)) {
            return 'Geçerli bir e-posta adresi giriniz';
          }
          return true;
        },
      },
      password: {
        ...ValidationRules.required('Şifre gereklidir'),
        ...ValidationRules.minLength(8, 'Şifre en az 8 karakter olmalıdır'),
        custom: (value) => {
          if (!value) return true; // Skip if empty (handled by required rule)
          
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumbers = /[0-9]/.test(value);
          const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
          
          const errors = [];
          if (!hasUpperCase) errors.push('büyük harf');
          if (!hasLowerCase) errors.push('küçük harf');
          if (!hasNumbers) errors.push('rakam');
          if (!hasSpecialChar) errors.push('özel karakter');
          
          if (errors.length > 0) {
            return `Şifre ${errors.join(', ')} içermelidir`;
          }
          
          return true;
        },
      },
      confirmPassword: {
        ...ValidationRules.required('Şifre tekrarı gereklidir'),
        custom: (value) => {
          if (value !== values.password) {
            return 'Şifreler eşleşmiyor';
          }
          return true;
        },
      },
      businessName: ValidationRules.maxLength(100, 'İşletme adı en fazla 100 karakter olabilir'),
    },
  });

  // Set auth error as general error if present
  useEffect(() => {
    if (authError) {
      setGeneralError(authError);
    }
  }, [authError]);

  // Clear general error when form values change
  useEffect(() => {
    if (generalError) {
      setGeneralError(null);
    }
  }, [values, generalError]);

  // Reset form and errors
  const handleReset = useCallback(() => {
    resetForm();
    setGeneralError(null);
  }, [resetForm]);

  // Handle registration submission
  const handleRegister = async () => {
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
        setGeneralError('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
        return;
      }

      // Execute registration with retry capability
      await executeWithRetry(async () => {
        Logger.info(TAG, 'Attempting registration', { email: values.email });
        
        await authService.register({
          name: values.name,
          email: values.email,
          password: values.password,
          businessName: values.businessName || undefined,
        });

        Logger.info(TAG, 'Registration successful');
        
        // Navigate to email verification screen
        navigation.navigate('EmailVerification', { email: values.email });
      });
    } catch (error) {
      Logger.error(TAG, 'Registration failed', error);
      
      // Handle specific error types
      if (error instanceof AppError) {
        switch (error.code) {
          case ErrorCode.EMAIL_ALREADY_EXISTS:
            setGeneralError('Bu e-posta adresi zaten kullanımda.');
            break;
          case ErrorCode.WEAK_PASSWORD:
            setGeneralError('Şifre çok zayıf. Daha güçlü bir şifre seçin.');
            break;
          case ErrorCode.NETWORK_ERROR:
            setGeneralError('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
            break;
          default:
            setGeneralError(error.message || 'Kayıt olurken bir hata oluştu.');
        }
      } else {
        setGeneralError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to login screen
  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // Enhanced password strength indicator with more detailed feedback
  const getPasswordStrength = (password: string): { 
    strength: number; 
    text: string; 
    color: string;
    feedback: string[];
  } => {
    if (!password) return { 
      strength: 0, 
      text: 'Çok Zayıf', 
      color: '#dc3545',
      feedback: ['Şifre giriniz']
    };
    
    const feedback = [];
    let strength = 0;
    
    // Length check
    if (password.length < 8) {
      feedback.push('En az 8 karakter olmalı');
    } else {
      strength += 1;
    }
    
    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      feedback.push('Büyük harf içermeli');
    } else {
      strength += 1;
    }
    
    // Lowercase check
    if (!/[a-z]/.test(password)) {
      feedback.push('Küçük harf içermeli');
    } else {
      strength += 1;
    }
    
    // Number check
    if (!/[0-9]/.test(password)) {
      feedback.push('Rakam içermeli');
    } else {
      strength += 1;
    }
    
    // Special character check
    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Özel karakter içermeli (@, !, #, vb.)');
    } else {
      strength += 1;
    }
    
    // Common password patterns check
    const commonPatterns = [
      /^123456/, /password/i, /qwerty/i, /abc123/i, /admin/i,
      /welcome/i, /letmein/i, /monkey/i, /sunshine/i, /princess/i
    ];
    
    if (commonPatterns.some(pattern => pattern.test(password))) {
      feedback.push('Çok yaygın bir şifre kalıbı kullanmayın');
      strength = Math.max(1, strength - 1);
    }
    
    // Sequential characters check
    if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
      feedback.push('Ardışık karakterler kullanmayın');
      strength = Math.max(1, strength - 1);
    }
    
    // Repeated characters check
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Tekrarlanan karakterler kullanmayın');
      strength = Math.max(1, strength - 1);
    }
    
    // Return strength assessment
    switch (strength) {
      case 0:
      case 1:
        return { 
          strength: 1, 
          text: 'Çok Zayıf', 
          color: '#dc3545',
          feedback: feedback.length ? feedback : ['Şifre çok zayıf, güçlendirin']
        };
      case 2:
        return { 
          strength: 2, 
          text: 'Zayıf', 
          color: '#ffc107',
          feedback: feedback.length ? feedback : ['Şifre zayıf, güçlendirin']
        };
      case 3:
        return { 
          strength: 3, 
          text: 'Orta', 
          color: '#fd7e14',
          feedback: feedback.length ? feedback : ['Şifre orta seviyede, güçlendirilebilir']
        };
      case 4:
        return { 
          strength: 4, 
          text: 'Güçlü', 
          color: '#20c997',
          feedback: feedback.length ? feedback : ['Şifre güçlü']
        };
      case 5:
        return { 
          strength: 5, 
          text: 'Çok Güçlü', 
          color: '#28a745',
          feedback: []
        };
      default:
        return { 
          strength: 0, 
          text: 'Çok Zayıf', 
          color: '#dc3545',
          feedback: ['Şifre çok zayıf']
        };
    }
  };

  const passwordStrength = getPasswordStrength(values.password);

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
            <Text style={styles.title}>{routeName === 'SignUp' ? 'Hesap Oluştur' : 'Kayıt Ol'}</Text>
            <Text style={styles.subtitle}>Hızlı ve kolay kayıt</Text>
          </View>

          {!isConnected && (
            <NetworkErrorFallback retry={() => {}} />
          )}

          {generalError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{generalError}</Text>
              {canRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={handleRegister}>
                  <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.form}>
            <FormInput
              label="Ad Soyad"
              placeholder="Ad ve soyadınızı girin"
              value={values.name}
              error={errors.name}
              touched={touched.name}
              onChangeText={(text) => setValue('name', text)}
              onBlur={() => {
                setTouched('name');
                validateField('name');
              }}
              required
            />

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
            />

            {values.password && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.passwordStrengthSegment,
                        { backgroundColor: level <= passwordStrength.strength ? passwordStrength.color : '#e9ecef' },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
              </View>
            )}

            <PasswordInput
              label="Şifre Tekrarı"
              placeholder="Şifrenizi tekrar girin"
              value={values.confirmPassword}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              onChangeText={(text) => setValue('confirmPassword', text)}
              onBlur={() => {
                setTouched('confirmPassword');
                validateField('confirmPassword');
              }}
              required
            />

            <FormInput
              label="İşletme Adı (İsteğe Bağlı)"
              placeholder="İşletme adınızı girin"
              value={values.businessName}
              error={errors.businessName}
              touched={touched.businessName}
              onChangeText={(text) => setValue('businessName', text)}
              onBlur={() => {
                setTouched('businessName');
                validateField('businessName');
              }}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                disabled={isSubmitting || isRetrying}
              >
                <Text style={styles.resetButtonText}>Temizle</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                (!isValid || isSubmitting || isRetrying) && styles.registerButtonDisabled,
              ]}
              onPress={handleSubmit(handleRegister)}
              disabled={!isValid || isSubmitting || isRetrying}
            >
              {(isSubmitting || isRetrying) ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.loadingText}>
                    {isRetrying ? 'Tekrar Deneniyor...' : 'Kaydediliyor...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.registerButtonText}>
                  {routeName === 'SignUp' ? 'Hesap Oluştur' : 'Kayıt Ol'}
                </Text>
              )}
            </TouchableOpacity>

            {__DEV__ && (
              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => {
                  setValue('name', 'Test User');
                  setValue('email', 'test@example.com');
                  setValue('password', 'Test1234!');
                  setValue('confirmPassword', 'Test1234!');
                  setValue('businessName', 'Test Business');
                  
                  // Trigger validation
                  setTouched('name');
                  setTouched('email');
                  setTouched('password');
                  setTouched('confirmPassword');
                  setTouched('businessName');
                  
                  validateField('name');
                  validateField('email');
                  validateField('password');
                  validateField('confirmPassword');
                  validateField('businessName');
                }}
                disabled={isSubmitting || isRetrying}
              >
                <Text style={styles.demoButtonText}>Demo Bilgileri Doldur</Text>
              </TouchableOpacity>
            )}

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Zaten hesabınız var mı?</Text>
              <TouchableOpacity onPress={handleLogin} disabled={isSubmitting || isRetrying}>
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
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
    marginTop: 20,
    marginBottom: 24,
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
  passwordStrengthContainer: {
    marginTop: -8,
    marginBottom: 16,
  },
  passwordStrengthBar: {
    flexDirection: 'row',
    height: 4,
    marginBottom: 4,
  },
  passwordStrengthSegment: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: 12,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  resetButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetButtonText: {
    color: '#6c757d',
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  registerButtonDisabled: {
    backgroundColor: '#b3d7ff',
  },
  registerButtonText: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  loginText: {
    color: '#666666',
    fontSize: 14,
    marginRight: 4,
  },
  loginButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RegisterScreen;
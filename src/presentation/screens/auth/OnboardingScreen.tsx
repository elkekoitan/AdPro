/**
 * Onboarding Screen
 * User onboarding and initial setup screen
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { AuthStackScreenProps } from '../../navigation/types';
import { useFormValidation } from '../../hooks/useFormValidation';
import { ValidationRules } from '../../../shared/utils/form-validation';
import { FormInput } from '../../components/forms/FormInput';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useRetry } from '../../hooks/useRetry';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';
import { NetworkErrorFallback } from '../../components/error/ErrorFallback';
import { AuthService } from '../../../application/services/AuthService';
import { SupabaseAuthRepository } from '../../../infrastructure/repositories/SupabaseAuthRepository';
import { MockAuthRepository } from '../../../infrastructure/repositories/MockAuthRepository';
import { Logger } from '../../../shared/utils/debug-helpers';
import { AppError, ErrorCode } from '../../../shared/types/errors';

// Initialize auth service with real Supabase for testing
// In a real app, this would be injected via dependency injection
const authRepository = new SupabaseAuthRepository();
const authService = new AuthService(authRepository);

const TAG = 'OnboardingScreen';
const { width } = Dimensions.get('window');

// Industry options for selection
const INDUSTRY_OPTIONS = [
  { id: 'musician', label: 'Müzisyen / Sanatçı', icon: '🎵' },
  { id: 'restaurant', label: 'Restoran / Kafe', icon: '🍽️' },
  { id: 'ecommerce', label: 'E-Ticaret', icon: '🛒' },
  { id: 'app', label: 'Uygulama / Yazılım', icon: '📱' },
  { id: 'service', label: 'Hizmet Sektörü', icon: '🔧' },
  { id: 'retail', label: 'Perakende', icon: '🏪' },
  { id: 'healthcare', label: 'Sağlık', icon: '⚕️' },
  { id: 'realestate', label: 'Emlak', icon: '🏠' },
  { id: 'other', label: 'Diğer', icon: '📋' },
];

// Onboarding steps
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'AdVantage\'a Hoş Geldiniz',
    description: 'Pazarlama süreçlerinizi kolaylaştıracak AI destekli platformumuza hoş geldiniz.',
  },
  {
    id: 'business',
    title: 'İşletme Bilgileriniz',
    description: 'İşletmeniz hakkında biraz bilgi verin.',
  },
  {
    id: 'industry',
    title: 'Sektörünüz',
    description: 'Size özel içerik ve öneriler için sektörünüzü seçin.',
  },
  {
    id: 'complete',
    title: 'Hazırsınız!',
    description: 'Artık AdVantage\'ı kullanmaya başlayabilirsiniz.',
  },
];

export const OnboardingScreen: React.FC<AuthStackScreenProps<'Onboarding'>> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const { isConnected } = useNetworkStatus();
  const { execute: executeWithRetry, isRetrying, canRetry } = useRetry();
  const scrollViewRef = useRef<any>(null);

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
  } = useFormValidation({
    initialValues: {
      businessName: '',
      website: '',
      description: '',
    },
    validationSchema: {
      businessName: ValidationRules.required('İşletme adı gereklidir'),
      website: ValidationRules.url('Geçerli bir URL giriniz'),
      description: ValidationRules.maxLength(200, 'Açıklama en fazla 200 karakter olabilir'),
    },
  });

  // Handle next step
  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate business form
      const isFormValid = await validateForm();
      if (!isFormValid) {
        Logger.warn(TAG, 'Form validation failed', errors);
        return;
      }
    }

    if (currentStep === 2 && !selectedIndustry) {
      setGeneralError('Lütfen bir sektör seçin');
      return;
    }

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollToIndex({ index: currentStep + 1, animated: true });
    } else {
      handleCompleteOnboarding();
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollToIndex({ index: currentStep - 1, animated: true });
    }
  };

  // Handle industry selection
  const handleSelectIndustry = (industryId: string) => {
    setSelectedIndustry(industryId);
    setGeneralError(null);
  };

  // Handle complete onboarding
  const handleCompleteOnboarding = async () => {
    try {
      setIsSubmitting(true);
      setGeneralError(null);

      // Check network connectivity
      if (!isConnected) {
        setGeneralError('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
        return;
      }

      // Execute onboarding completion with retry capability
      await executeWithRetry(async () => {
        Logger.info(TAG, 'Completing onboarding', { 
          businessName: values.businessName,
          industry: selectedIndustry,
        });
        
        // Get current user
        const user = authService.getCurrentUser();
        if (!user) {
          throw new AppError(ErrorCode.USER_NOT_FOUND, 'Kullanıcı bulunamadı');
        }

        // Update user profile with business information
        await authService.updateProfile({
          ...user,
          businessProfile: {
            id: `business_${Date.now()}`,
            name: values.businessName,
            industry: selectedIndustry || 'other',
            description: values.description,
            website: values.website,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        Logger.info(TAG, 'Onboarding completed successfully');
        
        // Navigate to main app (this will be handled by navigation guards)
      });
    } catch (error) {
      Logger.error(TAG, 'Onboarding completion failed', error);
      
      // Handle specific error types
      if (error instanceof AppError) {
        switch (error.code) {
          case ErrorCode.NETWORK_ERROR:
            setGeneralError('Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
            break;
          default:
            setGeneralError(error.message || 'Onboarding tamamlanırken bir hata oluştu.');
        }
      } else {
        setGeneralError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render onboarding step
  const renderStep = ({ item, index }: { item: typeof ONBOARDING_STEPS[0], index: number }) => {
    return (
      <View style={styles.stepContainer}>
        {index === 0 && (
          <View style={styles.welcomeStep}>
            <Text style={styles.welcomeIcon}>🚀</Text>
            <Text style={styles.stepTitle}>{item.title}</Text>
            <Text style={styles.stepDescription}>{item.description}</Text>
          </View>
        )}

        {index === 1 && (
          <View style={styles.businessStep}>
            <Text style={styles.stepTitle}>{item.title}</Text>
            <Text style={styles.stepDescription}>{item.description}</Text>
            
            <View style={styles.form}>
              <FormInput
                label="İşletme Adı"
                placeholder="İşletmenizin adını girin"
                value={values.businessName}
                error={errors.businessName}
                touched={touched.businessName}
                onChangeText={(text) => setValue('businessName', text)}
                onBlur={() => {
                  setTouched('businessName');
                  validateField('businessName');
                }}
                required
              />

              <FormInput
                label="Website (İsteğe Bağlı)"
                placeholder="https://www.example.com"
                value={values.website}
                error={errors.website}
                touched={touched.website}
                onChangeText={(text) => setValue('website', text)}
                onBlur={() => {
                  setTouched('website');
                  validateField('website');
                }}
                keyboardType="url"
              />

              <FormInput
                label="Kısa Açıklama (İsteğe Bağlı)"
                placeholder="İşletmenizi kısaca tanımlayın"
                value={values.description}
                error={errors.description}
                touched={touched.description}
                onChangeText={(text) => setValue('description', text)}
                onBlur={() => {
                  setTouched('description');
                  validateField('description');
                }}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {index === 2 && (
          <View style={styles.industryStep}>
            <Text style={styles.stepTitle}>{item.title}</Text>
            <Text style={styles.stepDescription}>{item.description}</Text>
            
            {generalError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            )}
            
            <View style={styles.industriesContainer}>
              {INDUSTRY_OPTIONS.map((industry) => (
                <TouchableOpacity
                  key={industry.id}
                  style={[
                    styles.industryOption,
                    selectedIndustry === industry.id && styles.industryOptionSelected,
                  ]}
                  onPress={() => handleSelectIndustry(industry.id)}
                >
                  <Text style={styles.industryIcon}>{industry.icon}</Text>
                  <Text style={[
                    styles.industryLabel,
                    selectedIndustry === industry.id && styles.industryLabelSelected,
                  ]}>
                    {industry.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {index === 3 && (
          <View style={styles.completeStep}>
            <Text style={styles.completeIcon}>✅</Text>
            <Text style={styles.stepTitle}>{item.title}</Text>
            <Text style={styles.stepDescription}>{item.description}</Text>
            
            <View style={styles.completeSummary}>
              <Text style={styles.summaryTitle}>İşletme Bilgileriniz</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>İşletme Adı:</Text>
                <Text style={styles.summaryValue}>{values.businessName}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Sektör:</Text>
                <Text style={styles.summaryValue}>
                  {INDUSTRY_OPTIONS.find(i => i.id === selectedIndustry)?.label || 'Seçilmedi'}
                </Text>
              </View>
              {values.website && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Website:</Text>
                  <Text style={styles.summaryValue}>{values.website}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {!isConnected && (
          <NetworkErrorFallback retry={() => {}} />
        )}

        <FlatList
          ref={scrollViewRef}
          data={ONBOARDING_STEPS}
          renderItem={renderStep}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          initialScrollIndex={currentStep}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentStep === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handlePrevStep}
                disabled={isSubmitting || isRetrying}
              >
                <Text style={styles.backButtonText}>Geri</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                (isSubmitting || isRetrying) && styles.nextButtonDisabled,
              ]}
              onPress={handleNextStep}
              disabled={isSubmitting || isRetrying}
            >
              {(isSubmitting || isRetrying) ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.nextButtonText}>
                  {currentStep === ONBOARDING_STEPS.length - 1 ? 'Tamamla' : 'Devam Et'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  stepContainer: {
    width,
    padding: 20,
    paddingBottom: 100, // Space for footer
  },
  welcomeStep: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  businessStep: {
    flex: 1,
    paddingTop: 40,
  },
  industryStep: {
    flex: 1,
    paddingTop: 40,
  },
  completeStep: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  completeIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
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
  industriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  industryOption: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  industryOptionSelected: {
    backgroundColor: '#e8f4ff',
    borderColor: '#007bff',
  },
  industryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  industryLabel: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
  },
  industryLabelSelected: {
    color: '#007bff',
    fontWeight: '500',
  },
  completeSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6c757d',
    width: 100,
  },
  summaryValue: {
    fontSize: 14,
    color: '#212529',
    flex: 1,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dee2e6',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#007bff',
    width: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#b3d7ff',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
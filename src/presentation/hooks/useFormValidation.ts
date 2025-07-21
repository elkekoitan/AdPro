/**
 * Form Validation Hook
 * Form validasyonu için React hook
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  FormValidator, 
  ValidationSchema, 
  FormValidationResult,
  FieldValidationResult 
} from '@/shared/utils/form-validation';
import { Logger } from '@/shared/utils/debug-helpers';

const TAG = 'useFormValidation';

interface FormState<T = Record<string, any>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
}

interface FormActions<T = Record<string, any>> {
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  setAllTouched: () => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => Promise<void>;
  reset: (values?: Partial<T>) => void;
}

interface UseFormValidationOptions<T = Record<string, any>> {
  initialValues: T;
  validationSchema: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  onSubmit?: (values: T) => Promise<void> | void;
}

/**
 * Form validation hook
 */
export function useFormValidation<T extends Record<string, any> = Record<string, any>>(
  options: UseFormValidationOptions<T>
): FormState<T> & FormActions<T> {
  const {
    initialValues,
    validationSchema,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    onSubmit,
  } = options;

  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: false,
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
  });

  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Debounced validation
   */
  const debouncedValidation = useCallback((field?: keyof T, delay: number = 300) => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      if (field) {
        validateField(field);
      } else {
        validateForm();
      }
    }, delay);
  }, []);

  /**
   * Sets a single field value
   */
  const setValue = useCallback((field: keyof T, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [field]: value };
      
      // Clear error for this field
      const newErrors = { ...prev.errors };
      delete newErrors[field as string];

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
      };
    });

    // Validate on change if enabled
    if (validateOnChange) {
      debouncedValidation(field);
    }
  }, [validateOnChange, debouncedValidation]);

  /**
   * Sets multiple field values
   */
  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, ...values },
    }));

    if (validateOnChange) {
      debouncedValidation();
    }
  }, [validateOnChange, debouncedValidation]);

  /**
   * Sets error for a field
   */
  const setError = useCallback((field: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
    }));
  }, []);

  /**
   * Sets multiple errors
   */
  const setErrors = useCallback((errors: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
      isValid: Object.keys(errors).length === 0,
    }));
  }, []);

  /**
   * Clears error for a field
   */
  const clearError = useCallback((field: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field as string];
      
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  /**
   * Clears all errors
   */
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      isValid: true,
    }));
  }, []);

  /**
   * Sets touched state for a field
   */
  const setTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));

    // Validate on blur if enabled and field is touched
    if (validateOnBlur && touched) {
      debouncedValidation(field);
    }
  }, [validateOnBlur, debouncedValidation]);

  /**
   * Sets all fields as touched
   */
  const setAllTouched = useCallback(() => {
    const touchedFields = Object.keys(initialValues).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);

    setState(prev => ({
      ...prev,
      touched: touchedFields,
    }));
  }, [initialValues]);

  /**
   * Validates a single field
   */
  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    const fieldName = field as string;
    const rule = validationSchema[fieldName];
    
    if (!rule) {
      return true;
    }

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const value = state.values[field];
      const result: FieldValidationResult = FormValidator.validateField(value, rule, fieldName);

      setState(prev => {
        const newErrors = { ...prev.errors };
        
        if (result.isValid) {
          delete newErrors[fieldName];
        } else if (result.error) {
          newErrors[fieldName] = result.error;
        }

        return {
          ...prev,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
          isValidating: false,
        };
      });

      return result.isValid;
    } catch (error) {
      Logger.error(TAG, `Field validation error for ${fieldName}:`, error);
      
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [fieldName]: 'Validasyon hatası' },
        isValid: false,
        isValidating: false,
      }));

      return false;
    }
  }, [state.values, validationSchema]);

  /**
   * Validates entire form
   */
  const validateForm = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isValidating: true }));

    try {
      const result: FormValidationResult = FormValidator.validateForm(state.values, validationSchema);

      setState(prev => ({
        ...prev,
        errors: result.errors,
        isValid: result.isValid,
        isValidating: false,
      }));

      return result.isValid;
    } catch (error) {
      Logger.error(TAG, 'Form validation error:', error);
      
      setState(prev => ({
        ...prev,
        errors: { general: 'Form validasyon hatası oluştu' },
        isValid: false,
        isValidating: false,
      }));

      return false;
    }
  }, [state.values, validationSchema]);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(async (
    submitFn: (values: T) => Promise<void> | void
  ): Promise<void> => {
    setState(prev => ({ 
      ...prev, 
      isSubmitting: true,
      submitCount: prev.submitCount + 1,
    }));

    try {
      // Mark all fields as touched
      setAllTouched();

      // Validate form if enabled
      let isFormValid = true;
      if (validateOnSubmit) {
        isFormValid = await validateForm();
      }

      if (!isFormValid) {
        Logger.warn(TAG, 'Form submission blocked due to validation errors');
        return;
      }

      // Submit form
      await submitFn(state.values);
      
      Logger.info(TAG, 'Form submitted successfully');
    } catch (error) {
      Logger.error(TAG, 'Form submission error:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.values, validateOnSubmit, validateForm, setAllTouched]);

  /**
   * Resets form state
   */
  const reset = useCallback((values?: Partial<T>) => {
    const resetValues = values ? { ...initialValues, ...values } : initialValues;
    
    setState({
      values: resetValues,
      errors: {},
      touched: {},
      isValid: false,
      isSubmitting: false,
      isValidating: false,
      submitCount: 0,
    });

    // Clear validation timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
  }, [initialValues]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Auto-submit if onSubmit is provided
   */
  const autoHandleSubmit = useCallback(async () => {
    if (onSubmit) {
      await handleSubmit(onSubmit);
    }
  }, [onSubmit, handleSubmit]);

  return {
    // State
    ...state,
    
    // Actions
    setValue,
    setValues,
    setError,
    setErrors,
    clearError,
    clearErrors,
    setTouched,
    setAllTouched,
    validateField,
    validateForm,
    handleSubmit: onSubmit ? autoHandleSubmit : handleSubmit,
    reset,
  };
}

/**
 * Simple form validation hook for basic use cases
 */
export function useSimpleValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ValidationSchema
) {
  return useFormValidation({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true,
  });
}

/**
 * Field validation hook for individual field validation
 */
export function useFieldValidation(
  initialValue: any = '',
  validationRule: any,
  fieldName?: string
) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async (val: any = value): Promise<boolean> => {
    setIsValidating(true);

    try {
      const result = FormValidator.validateField(val, validationRule, fieldName);
      
      setError(result.error || '');
      setIsValidating(false);
      
      return result.isValid;
    } catch (err) {
      Logger.error(TAG, 'Field validation error:', err);
      setError('Validasyon hatası');
      setIsValidating(false);
      return false;
    }
  }, [value, validationRule, fieldName]);

  const handleChange = useCallback((newValue: any) => {
    setValue(newValue);
    setError(''); // Clear error on change
    
    // Validate after a delay
    setTimeout(() => validate(newValue), 300);
  }, [validate]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    validate();
  }, [validate]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError('');
    setTouched(false);
    setIsValidating(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    isValidating,
    isValid: !error && touched,
    setValue: handleChange,
    setTouched: handleBlur,
    validate,
    reset,
  };
}
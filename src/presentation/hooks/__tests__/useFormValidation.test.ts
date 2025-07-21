/**
 * useFormValidation Hook Tests
 * Tests for the form validation hook
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useFormValidation, useSimpleValidation, useFieldValidation } from '../useFormValidation';
import { ValidationRules } from '../../../shared/utils/form-validation';
import { Logger } from '../../../shared/utils/debug-helpers';

// Mock the logger
jest.mock('../../../shared/utils/debug-helpers', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('useFormValidation', () => {
  const initialValues = {
    name: '',
    email: '',
    age: '',
  };
  
  const validationSchema = {
    name: ValidationRules.required('Name is required'),
    email: {
      ...ValidationRules.required('Email is required'),
      ...ValidationRules.email('Invalid email format'),
    },
    age: ValidationRules.min(18, 'Must be at least 18 years old'),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('initializes with correct initial state', () => {
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
    }));
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isValid).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValidating).toBe(false);
    expect(result.current.submitCount).toBe(0);
  });
  
  it('updates field value and clears error', () => {
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
      validateOnChange: false,
    }));
    
    // Set an error first
    act(() => {
      result.current.setError('name', 'Name is required');
    });
    
    expect(result.current.errors.name).toBe('Name is required');
    
    // Update the field value
    act(() => {
      result.current.setValue('name', 'John Doe');
    });
    
    expect(result.current.values.name).toBe('John Doe');
    expect(result.current.errors.name).toBeUndefined();
  });
  
  it('validates field on change when enabled', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
      validateOnChange: true,
    }));
    
    // Update field with invalid value
    act(() => {
      result.current.setValue('email', 'invalid-email');
    });
    
    // Wait for debounced validation
    await waitForNextUpdate();
    
    expect(result.current.errors.email).toBe('Invalid email format');
    
    // Update field with valid value
    act(() => {
      result.current.setValue('email', 'valid@example.com');
    });
    
    // Wait for debounced validation
    await waitForNextUpdate();
    
    expect(result.current.errors.email).toBeUndefined();
  });
  
  it('validates field on blur when enabled', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
      validateOnBlur: true,
    }));
    
    // Set field value without validation
    act(() => {
      result.current.setValue('email', 'invalid-email');
    });
    
    // Trigger blur event
    act(() => {
      result.current.setTouched('email', true);
    });
    
    // Wait for debounced validation
    await waitForNextUpdate();
    
    expect(result.current.touched.email).toBe(true);
    expect(result.current.errors.email).toBe('Invalid email format');
  });
  
  it('validates entire form', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
    }));
    
    // Validate the form
    let isValid;
    act(() => {
      isValid = result.current.validateForm();
    });
    
    // Wait for validation to complete
    await waitForNextUpdate();
    
    expect(await isValid).toBe(false);
    expect(result.current.errors.name).toBe('Name is required');
    expect(result.current.errors.email).toBe('Email is required');
    
    // Update fields with valid values
    act(() => {
      result.current.setValues({
        name: 'John Doe',
        email: 'john@example.com',
        age: '25',
      });
    });
    
    // Validate again
    act(() => {
      isValid = result.current.validateForm();
    });
    
    // Wait for validation to complete
    await waitForNextUpdate();
    
    expect(await isValid).toBe(true);
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });
  
  it('handles form submission', async () => {
    const onSubmit = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
      validateOnSubmit: true,
    }));
    
    // Set valid values
    act(() => {
      result.current.setValues({
        name: 'John Doe',
        email: 'john@example.com',
        age: '25',
      });
    });
    
    // Submit the form
    act(() => {
      result.current.handleSubmit(onSubmit);
    });
    
    // Wait for submission to complete
    await waitForNextUpdate();
    
    expect(result.current.submitCount).toBe(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      age: '25',
    });
  });
  
  it('blocks submission when validation fails', async () => {
    const onSubmit = jest.fn();
    const { result, waitForNextUpdate } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
      validateOnSubmit: true,
    }));
    
    // Submit the form with invalid values
    act(() => {
      result.current.handleSubmit(onSubmit);
    });
    
    // Wait for validation to complete
    await waitForNextUpdate();
    
    expect(result.current.submitCount).toBe(1);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(Logger.warn).toHaveBeenCalledWith(
      'useFormValidation',
      'Form submission blocked due to validation errors'
    );
  });
  
  it('resets form state', () => {
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
    }));
    
    // Update form state
    act(() => {
      result.current.setValues({
        name: 'John Doe',
        email: 'john@example.com',
        age: '25',
      });
      result.current.setTouched('name', true);
      result.current.setError('email', 'Custom error');
    });
    
    // Reset form
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.submitCount).toBe(0);
  });
  
  it('resets form with custom values', () => {
    const { result } = renderHook(() => useFormValidation({
      initialValues,
      validationSchema,
    }));
    
    // Reset form with custom values
    act(() => {
      result.current.reset({ name: 'John Doe' });
    });
    
    expect(result.current.values).toEqual({
      name: 'John Doe',
      email: '',
      age: '',
    });
  });
});

describe('useSimpleValidation', () => {
  it('provides simplified form validation', () => {
    const initialValues = { name: '' };
    const validationSchema = {
      name: ValidationRules.required(),
    };
    
    const { result } = renderHook(() => useSimpleValidation(initialValues, validationSchema));
    
    expect(result.current.values).toEqual(initialValues);
    expect(typeof result.current.setValue).toBe('function');
    expect(typeof result.current.validateForm).toBe('function');
  });
});

describe('useFieldValidation', () => {
  it('validates a single field', async () => {
    const validationRule = ValidationRules.required('Field is required');
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useFieldValidation('', validationRule, 'testField')
    );
    
    // Initial state
    expect(result.current.value).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.touched).toBe(false);
    expect(result.current.isValid).toBe(false);
    
    // Validate empty field
    let isValid;
    act(() => {
      isValid = result.current.validate();
    });
    
    // Wait for validation to complete
    await waitForNextUpdate();
    
    expect(await isValid).toBe(false);
    expect(result.current.error).toBe('Field is required');
    
    // Update value
    act(() => {
      result.current.setValue('test value');
    });
    
    // Wait for debounced validation
    await waitForNextUpdate();
    
    expect(result.current.value).toBe('test value');
    expect(result.current.error).toBe('');
    
    // Mark as touched and validate
    act(() => {
      result.current.setTouched();
    });
    
    // Wait for validation to complete
    await waitForNextUpdate();
    
    expect(result.current.touched).toBe(true);
    expect(result.current.isValid).toBe(true);
    
    // Reset field
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.value).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.touched).toBe(false);
    expect(result.current.isValid).toBe(false);
  });
});
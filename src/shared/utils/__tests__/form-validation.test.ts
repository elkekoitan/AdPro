/**
 * Form Validation Tests
 * Tests for the form validation utility
 */

import { 
  FormValidator, 
  ValidationRule, 
  ValidationRules, 
  ValidationSchemas 
} from '../form-validation';
import { Logger } from '../debug-helpers';

// Mock the logger
jest.mock('../debug-helpers', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('FormValidator', () => {
  describe('validateField', () => {
    it('validates required fields', () => {
      const rule: ValidationRule = { required: true };
      
      expect(FormValidator.validateField('value', rule).isValid).toBe(true);
      expect(FormValidator.validateField('', rule).isValid).toBe(false);
      expect(FormValidator.validateField(null, rule).isValid).toBe(false);
      expect(FormValidator.validateField(undefined, rule).isValid).toBe(false);
    });
    
    it('skips validation for empty non-required fields', () => {
      const rule: ValidationRule = { minLength: 5 };
      
      expect(FormValidator.validateField('', rule).isValid).toBe(true);
      expect(FormValidator.validateField(null, rule).isValid).toBe(true);
      expect(FormValidator.validateField(undefined, rule).isValid).toBe(true);
    });
    
    it('validates string length', () => {
      const minRule: ValidationRule = { minLength: 5 };
      const maxRule: ValidationRule = { maxLength: 10 };
      const bothRule: ValidationRule = { minLength: 5, maxLength: 10 };
      
      expect(FormValidator.validateField('1234', minRule).isValid).toBe(false);
      expect(FormValidator.validateField('12345', minRule).isValid).toBe(true);
      
      expect(FormValidator.validateField('12345678901', maxRule).isValid).toBe(false);
      expect(FormValidator.validateField('1234567890', maxRule).isValid).toBe(true);
      
      expect(FormValidator.validateField('1234', bothRule).isValid).toBe(false);
      expect(FormValidator.validateField('12345678901', bothRule).isValid).toBe(false);
      expect(FormValidator.validateField('12345', bothRule).isValid).toBe(true);
      expect(FormValidator.validateField('1234567890', bothRule).isValid).toBe(true);
    });
    
    it('validates numeric values', () => {
      const minRule: ValidationRule = { min: 5 };
      const maxRule: ValidationRule = { max: 10 };
      const rangeRule: ValidationRule = { min: 5, max: 10 };
      
      expect(FormValidator.validateField(4, minRule).isValid).toBe(false);
      expect(FormValidator.validateField(5, minRule).isValid).toBe(true);
      
      expect(FormValidator.validateField(11, maxRule).isValid).toBe(false);
      expect(FormValidator.validateField(10, maxRule).isValid).toBe(true);
      
      expect(FormValidator.validateField(4, rangeRule).isValid).toBe(false);
      expect(FormValidator.validateField(11, rangeRule).isValid).toBe(false);
      expect(FormValidator.validateField(5, rangeRule).isValid).toBe(true);
      expect(FormValidator.validateField(10, rangeRule).isValid).toBe(true);
    });
    
    it('validates patterns', () => {
      const rule: ValidationRule = { pattern: /^[A-Z]+$/ };
      
      expect(FormValidator.validateField('abc', rule).isValid).toBe(false);
      expect(FormValidator.validateField('ABC', rule).isValid).toBe(true);
    });
    
    it('validates email format', () => {
      const rule: ValidationRule = { email: true };
      
      expect(FormValidator.validateField('not-an-email', rule).isValid).toBe(false);
      expect(FormValidator.validateField('test@example', rule).isValid).toBe(false);
      expect(FormValidator.validateField('test@example.com', rule).isValid).toBe(true);
    });
    
    it('validates phone format', () => {
      const rule: ValidationRule = { phone: true };
      
      expect(FormValidator.validateField('not-a-phone', rule).isValid).toBe(false);
      expect(FormValidator.validateField('12345', rule).isValid).toBe(false);
      expect(FormValidator.validateField('5551234567', rule).isValid).toBe(true);
      expect(FormValidator.validateField('05551234567', rule).isValid).toBe(true);
      expect(FormValidator.validateField('+905551234567', rule).isValid).toBe(true);
    });
    
    it('validates URL format', () => {
      const rule: ValidationRule = { url: true };
      
      expect(FormValidator.validateField('not-a-url', rule).isValid).toBe(false);
      expect(FormValidator.validateField('example.com', rule).isValid).toBe(false); // Missing protocol
      expect(FormValidator.validateField('http://example.com', rule).isValid).toBe(true);
      expect(FormValidator.validateField('https://example.com', rule).isValid).toBe(true);
    });
    
    it('supports custom validation functions', () => {
      const rule: ValidationRule = { 
        custom: (value) => value === 'valid' ? true : 'Invalid value' 
      };
      
      expect(FormValidator.validateField('invalid', rule).isValid).toBe(false);
      expect(FormValidator.validateField('invalid', rule).error).toBe('Invalid value');
      expect(FormValidator.validateField('valid', rule).isValid).toBe(true);
    });
    
    it('handles validation errors gracefully', () => {
      const rule: ValidationRule = { 
        custom: () => { throw new Error('Validation error'); } 
      };
      
      const result = FormValidator.validateField('value', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Validasyon hatası oluştu');
      expect(Logger.error).toHaveBeenCalled();
    });
    
    it('uses custom error messages when provided', () => {
      const rule: ValidationRule = { 
        required: true,
        message: 'Custom error message' 
      };
      
      const result = FormValidator.validateField('', rule);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Custom error message');
    });
  });
  
  describe('validateForm', () => {
    it('validates entire form', () => {
      const schema = {
        name: { required: true },
        email: { email: true },
        age: { min: 18 },
      };
      
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };
      
      const invalidData = {
        name: '',
        email: 'not-an-email',
        age: 16,
      };
      
      const validResult = FormValidator.validateForm(validData, schema);
      expect(validResult.isValid).toBe(true);
      expect(Object.keys(validResult.errors).length).toBe(0);
      
      const invalidResult = FormValidator.validateForm(invalidData, schema);
      expect(invalidResult.isValid).toBe(false);
      expect(Object.keys(invalidResult.errors).length).toBe(3);
      expect(invalidResult.errors.name).toBeDefined();
      expect(invalidResult.errors.email).toBeDefined();
      expect(invalidResult.errors.age).toBeDefined();
    });
    
    it('returns the first error message', () => {
      const schema = {
        name: { required: true },
        email: { email: true },
      };
      
      const invalidData = {
        name: '',
        email: 'not-an-email',
      };
      
      const result = FormValidator.validateForm(invalidData, schema);
      
      expect(result.isValid).toBe(false);
      expect(result.firstError).toBeDefined();
      expect(result.firstError).toBe(result.errors.name);
    });
  });
  
  describe('validateFormIncremental', () => {
    it('validates only the changed field when specified', () => {
      const schema = {
        name: { required: true },
        email: { email: true },
      };
      
      const data = {
        name: 'John Doe',
        email: 'not-an-email',
      };
      
      const result = FormValidator.validateFormIncremental(data, schema, 'email');
      
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(1);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.name).toBeUndefined();
    });
    
    it('validates entire form when no changed field is specified', () => {
      const schema = {
        name: { required: true },
        email: { email: true },
      };
      
      const data = {
        name: '',
        email: 'not-an-email',
      };
      
      const result = FormValidator.validateFormIncremental(data, schema);
      
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(2);
    });
    
    it('handles non-existent fields gracefully', () => {
      const schema = {
        name: { required: true },
      };
      
      const data = {
        name: 'John Doe',
      };
      
      const result = FormValidator.validateFormIncremental(data, schema, 'nonExistentField');
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
  });
});

describe('ValidationRules', () => {
  it('provides required rule', () => {
    const rule = ValidationRules.required('Field is required');
    
    expect(rule.required).toBe(true);
    expect(rule.message).toBe('Field is required');
  });
  
  it('provides email rule', () => {
    const rule = ValidationRules.email();
    
    expect(rule.email).toBe(true);
  });
  
  it('provides phone rule', () => {
    const rule = ValidationRules.phone();
    
    expect(rule.phone).toBe(true);
  });
  
  it('provides url rule', () => {
    const rule = ValidationRules.url();
    
    expect(rule.url).toBe(true);
  });
  
  it('provides minLength rule', () => {
    const rule = ValidationRules.minLength(5);
    
    expect(rule.minLength).toBe(5);
  });
  
  it('provides maxLength rule', () => {
    const rule = ValidationRules.maxLength(10);
    
    expect(rule.maxLength).toBe(10);
  });
  
  it('provides length rule', () => {
    const rule = ValidationRules.length(5, 10);
    
    expect(rule.minLength).toBe(5);
    expect(rule.maxLength).toBe(10);
  });
  
  it('provides min rule', () => {
    const rule = ValidationRules.min(5);
    
    expect(rule.min).toBe(5);
  });
  
  it('provides max rule', () => {
    const rule = ValidationRules.max(10);
    
    expect(rule.max).toBe(10);
  });
  
  it('provides range rule', () => {
    const rule = ValidationRules.range(5, 10);
    
    expect(rule.min).toBe(5);
    expect(rule.max).toBe(10);
  });
  
  it('provides pattern rule', () => {
    const regex = /^[A-Z]+$/;
    const rule = ValidationRules.pattern(regex);
    
    expect(rule.pattern).toBe(regex);
  });
  
  it('provides password rule', () => {
    const rule = ValidationRules.password();
    
    expect(rule.minLength).toBe(8);
    expect(rule.pattern).toBeDefined();
  });
  
  it('provides confirmPassword rule', () => {
    const rule = ValidationRules.confirmPassword('password');
    
    expect(rule.custom).toBeDefined();
    
    // Test the custom validation function
    const validResult = rule.custom!('password123', { password: 'password123' });
    const invalidResult = rule.custom!('password123', { password: 'different' });
    
    expect(validResult).toBe(true);
    expect(typeof invalidResult).toBe('string');
  });
  
  it('provides turkish rule', () => {
    const rule = ValidationRules.turkish();
    
    expect(rule.pattern).toBeDefined();
    
    // Test with the pattern
    expect(rule.pattern!.test('Türkçe Karakterler')).toBe(true);
    expect(rule.pattern!.test('Invalid123')).toBe(false);
  });
  
  it('provides alphanumeric rule', () => {
    const rule = ValidationRules.alphanumeric();
    
    expect(rule.pattern).toBeDefined();
    
    // Test with the pattern
    expect(rule.pattern!.test('abc123')).toBe(true);
    expect(rule.pattern!.test('abc 123')).toBe(false);
  });
  
  it('provides numeric rule', () => {
    const rule = ValidationRules.numeric();
    
    expect(rule.pattern).toBeDefined();
    
    // Test with the pattern
    expect(rule.pattern!.test('123')).toBe(true);
    expect(rule.pattern!.test('123.45')).toBe(false);
  });
  
  it('provides decimal rule', () => {
    const rule = ValidationRules.decimal();
    
    expect(rule.pattern).toBeDefined();
    
    // Test with the pattern
    expect(rule.pattern!.test('123')).toBe(true);
    expect(rule.pattern!.test('123.45')).toBe(true);
    expect(rule.pattern!.test('abc')).toBe(false);
  });
  
  it('provides positiveNumber rule', () => {
    const rule = ValidationRules.positiveNumber();
    
    expect(rule.custom).toBeDefined();
    
    // Test the custom validation function
    expect(rule.custom!(5)).toBe(true);
    expect(rule.custom!(0)).not.toBe(true);
    expect(rule.custom!(-5)).not.toBe(true);
    expect(rule.custom!('abc')).not.toBe(true);
  });
  
  it('provides date rule', () => {
    const rule = ValidationRules.date();
    
    expect(rule.custom).toBeDefined();
    
    // Test the custom validation function
    expect(rule.custom!('2023-01-01')).toBe(true);
    expect(rule.custom!('invalid-date')).not.toBe(true);
  });
  
  it('provides futureDate rule', () => {
    const rule = ValidationRules.futureDate();
    
    expect(rule.custom).toBeDefined();
    
    // Test the custom validation function
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    
    expect(rule.custom!(futureDate.toISOString())).toBe(true);
    expect(rule.custom!(pastDate.toISOString())).not.toBe(true);
  });
  
  it('provides pastDate rule', () => {
    const rule = ValidationRules.pastDate();
    
    expect(rule.custom).toBeDefined();
    
    // Test the custom validation function
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    
    expect(rule.custom!(pastDate.toISOString())).toBe(true);
    expect(rule.custom!(futureDate.toISOString())).not.toBe(true);
  });
  
  it('provides age rule', () => {
    const rule = ValidationRules.age(18, 65);
    
    expect(rule.custom).toBeDefined();
    
    // Test the custom validation function
    const today = new Date();
    
    const age17 = new Date();
    age17.setFullYear(today.getFullYear() - 17);
    
    const age18 = new Date();
    age18.setFullYear(today.getFullYear() - 18);
    
    const age65 = new Date();
    age65.setFullYear(today.getFullYear() - 65);
    
    const age66 = new Date();
    age66.setFullYear(today.getFullYear() - 66);
    
    expect(rule.custom!(age18.toISOString())).toBe(true);
    expect(rule.custom!(age65.toISOString())).toBe(true);
    expect(rule.custom!(age17.toISOString())).not.toBe(true);
    expect(rule.custom!(age66.toISOString())).not.toBe(true);
  });
  
  it('provides oneOf rule', () => {
    const options = ['option1', 'option2', 'option3'];
    const rule = ValidationRules.oneOf(options);
    
    expect(rule.custom).toBeDefined();
    
    // Test the custom validation function
    expect(rule.custom!('option1')).toBe(true);
    expect(rule.custom!('option4')).not.toBe(true);
  });
  
  it('provides arrayMinLength rule', () => {
    const rule = ValidationRules.arrayMinLength(2);
    
    expect(rule.custom).toBeDefined();
    
    // Test the custom validation function
    expect(rule.custom!([1, 2])).toBe(true);
    expect(rule.custom!([1])).not.toBe(true);
    expect(rule.custom!('not-an-array')).not.toBe(true);
  });
  
  it('provides arrayMaxLength rule', () => {
    const rule = ValidationRules.arrayMaxLength(2);
    
    expect(rule.custom).toBeDefined();
    
    // Test the custom validation function
    expect(rule.custom!([1, 2])).toBe(true);
    expect(rule.custom!([1, 2, 3])).not.toBe(true);
    expect(rule.custom!('not-an-array')).not.toBe(true);
  });
});

describe('ValidationSchemas', () => {
  it('provides login schema', () => {
    const schema = ValidationSchemas.login;
    
    expect(schema.email).toBeDefined();
    expect(schema.password).toBeDefined();
    
    expect(schema.email.required).toBe(true);
    expect(schema.password.required).toBe(true);
  });
  
  it('provides register schema', () => {
    const schema = ValidationSchemas.register;
    
    expect(schema.name).toBeDefined();
    expect(schema.email).toBeDefined();
    expect(schema.password).toBeDefined();
    expect(schema.confirmPassword).toBeDefined();
    
    expect(schema.name.required).toBe(true);
    expect(schema.email.required).toBe(true);
    expect(schema.email.email).toBe(true);
    expect(schema.password.required).toBe(true);
    expect(schema.password.minLength).toBe(8);
    expect(schema.confirmPassword.required).toBe(true);
    expect(schema.confirmPassword.custom).toBeDefined();
  });
  
  it('provides profile schema', () => {
    const schema = ValidationSchemas.profile;
    
    expect(schema.name).toBeDefined();
    expect(schema.email).toBeDefined();
    expect(schema.phone).toBeDefined();
    expect(schema.website).toBeDefined();
    
    expect(schema.name.required).toBe(true);
    expect(schema.email.required).toBe(true);
    expect(schema.email.email).toBe(true);
    expect(schema.phone.phone).toBe(true);
    expect(schema.website.url).toBe(true);
  });
  
  it('provides businessProfile schema', () => {
    const schema = ValidationSchemas.businessProfile;
    
    expect(schema.name).toBeDefined();
    expect(schema.industry).toBeDefined();
    expect(schema.description).toBeDefined();
    expect(schema.website).toBeDefined();
    expect(schema.targetAudience).toBeDefined();
    
    expect(schema.name.required).toBe(true);
    expect(schema.industry.required).toBe(true);
    expect(schema.description.maxLength).toBe(500);
    expect(schema.website.url).toBe(true);
    expect(schema.targetAudience.custom).toBeDefined();
  });
  
  it('provides campaign schema', () => {
    const schema = ValidationSchemas.campaign;
    
    expect(schema.name).toBeDefined();
    expect(schema.description).toBeDefined();
    expect(schema.budget).toBeDefined();
    expect(schema.startDate).toBeDefined();
    expect(schema.endDate).toBeDefined();
    
    expect(schema.name.required).toBe(true);
    expect(schema.description.maxLength).toBe(500);
    expect(schema.budget.required).toBe(true);
    expect(schema.startDate.required).toBe(true);
    expect(schema.endDate.required).toBe(true);
    expect(schema.endDate.custom).toBeDefined();
  });
});
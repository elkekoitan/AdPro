/**
 * Form Input Components
 * Validation destekli form input component'leri
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { FormError, ValidationStatus } from './FormError';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  isValid?: boolean;
  isValidating?: boolean;
  required?: boolean;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
  labelStyle?: any;
  inputStyle?: any;
  errorStyle?: any;
  showValidationStatus?: boolean;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

/**
 * Enhanced text input with validation support
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  touched = false,
  isValid = false,
  isValidating = false,
  required = false,
  helpText,
  leftIcon,
  rightIcon,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  showValidationStatus = false,
  onChangeText,
  onBlur,
  onFocus,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const hasError = touched && !!error;
  const showError = hasError && !isFocused;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const getBorderColor = () => {
    if (hasError) return '#dc3545';
    if (isFocused) return '#007bff';
    if (isValid && touched) return '#28a745';
    return '#ced4da';
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {showValidationStatus && (
            <ValidationStatus
              isValid={isValid && touched}
              isValidating={isValidating}
              hasErrors={hasError}
              style={styles.validationStatus}
            />
          )}
        </View>
      )}

      <View style={[
        styles.inputContainer,
        { borderColor: getBorderColor() },
        isFocused && styles.inputContainerFocused,
        hasError && styles.inputContainerError,
      ]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor="#6c757d"
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />

        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>

      {helpText && !showError && (
        <Text style={styles.helpText}>{helpText}</Text>
      )}

      <FormError
        error={error}
        visible={showError}
        style={errorStyle}
      />
    </View>
  );
};

/**
 * Password input with show/hide toggle
 */
export const PasswordInput: React.FC<FormInputProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const EyeIcon = () => (
    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
      <Text style={styles.eyeIconText}>
        {showPassword ? '🙈' : '👁️'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FormInput
      {...props}
      secureTextEntry={!showPassword}
      rightIcon={<EyeIcon />}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
};

/**
 * Email input with email-specific props
 */
export const EmailInput: React.FC<FormInputProps> = (props) => {
  return (
    <FormInput
      {...props}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      autoCompleteType="email"
      textContentType="emailAddress"
    />
  );
};

/**
 * Phone input with phone-specific props
 */
export const PhoneInput: React.FC<FormInputProps> = (props) => {
  return (
    <FormInput
      {...props}
      keyboardType="phone-pad"
      autoCompleteType="tel"
      textContentType="telephoneNumber"
    />
  );
};

/**
 * Numeric input
 */
export const NumericInput: React.FC<FormInputProps & {
  allowDecimal?: boolean;
  allowNegative?: boolean;
}> = ({ allowDecimal = false, allowNegative = false, onChangeText, ...props }) => {
  const handleChangeText = (text: string) => {
    // Filter numeric input
    let filteredText = text.replace(/[^0-9.-]/g, '');
    
    if (!allowDecimal) {
      filteredText = filteredText.replace(/\./g, '');
    }
    
    if (!allowNegative) {
      filteredText = filteredText.replace(/-/g, '');
    }
    
    // Ensure only one decimal point
    if (allowDecimal) {
      const parts = filteredText.split('.');
      if (parts.length > 2) {
        filteredText = parts[0] + '.' + parts.slice(1).join('');
      }
    }
    
    // Ensure only one negative sign at the beginning
    if (allowNegative) {
      const negativeCount = (filteredText.match(/-/g) || []).length;
      if (negativeCount > 1 || (filteredText.includes('-') && !filteredText.startsWith('-'))) {
        filteredText = filteredText.replace(/-/g, '');
        if (text.startsWith('-')) {
          filteredText = '-' + filteredText;
        }
      }
    }
    
    onChangeText?.(filteredText);
  };

  return (
    <FormInput
      {...props}
      keyboardType="numeric"
      onChangeText={handleChangeText}
    />
  );
};

/**
 * Multi-line text input (TextArea)
 */
export const TextArea: React.FC<FormInputProps & {
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
}> = ({ 
  rows = 4, 
  maxLength, 
  showCharacterCount = false,
  value = '',
  ...props 
}) => {
  const characterCount = String(value).length;
  const isNearLimit = maxLength && characterCount > maxLength * 0.8;

  return (
    <View>
      <FormInput
        {...props}
        value={value}
        multiline
        numberOfLines={rows}
        maxLength={maxLength}
        inputStyle={[
          { height: rows * 20 + 20, textAlignVertical: 'top' },
          props.inputStyle,
        ]}
      />
      {showCharacterCount && maxLength && (
        <Text style={[
          styles.characterCount,
          isNearLimit && styles.characterCountWarning,
          characterCount >= maxLength && styles.characterCountError,
        ]}>
          {characterCount}/{maxLength}
        </Text>
      )}
    </View>
  );
};

/**
 * Search input with search icon
 */
export const SearchInput: React.FC<FormInputProps & {
  onClear?: () => void;
}> = ({ onClear, value, ...props }) => {
  const SearchIcon = () => (
    <Text style={styles.searchIcon}>🔍</Text>
  );

  const ClearIcon = () => (
    <TouchableOpacity onPress={onClear} style={styles.clearIcon}>
      <Text style={styles.clearIconText}>✕</Text>
    </TouchableOpacity>
  );

  return (
    <FormInput
      {...props}
      value={value}
      leftIcon={<SearchIcon />}
      rightIcon={value && onClear ? <ClearIcon /> : undefined}
      placeholder="Ara..."
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  required: {
    color: '#dc3545',
  },
  validationStatus: {
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    minHeight: 44,
  },
  inputContainerFocused: {
    borderWidth: 2,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: '#dc3545',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIconContainer: {
    paddingLeft: 12,
    paddingRight: 4,
  },
  rightIconContainer: {
    paddingRight: 12,
    paddingLeft: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    lineHeight: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  eyeIconText: {
    fontSize: 16,
  },
  searchIcon: {
    fontSize: 16,
    color: '#6c757d',
  },
  clearIcon: {
    padding: 4,
  },
  clearIconText: {
    fontSize: 14,
    color: '#6c757d',
  },
  characterCount: {
    fontSize: 11,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4,
  },
  characterCountWarning: {
    color: '#ffc107',
  },
  characterCountError: {
    color: '#dc3545',
  },
});
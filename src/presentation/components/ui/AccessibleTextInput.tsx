/**
 * Accessible Text Input Component
 * 
 * A fully accessible text input component.
 */

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface AccessibleTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  hintStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export interface AccessibleTextInputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
  getValue: () => string;
}

/**
 * Accessible Text Input Component
 */
export const AccessibleTextInput = forwardRef<AccessibleTextInputRef, AccessibleTextInputProps>(
  (
    {
      label,
      error,
      hint,
      containerStyle,
      labelStyle,
      inputStyle,
      errorStyle,
      hintStyle,
      testID = 'accessibleTextInput',
      accessibilityLabel,
      accessibilityHint,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState(props.value || props.defaultValue || '');
    const { getProps } = useAccessibility();
    const inputRef = React.useRef<TextInput>(null);
    
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
      clear: () => {
        inputRef.current?.clear();
        setValue('');
      },
      isFocused: () => {
        return inputRef.current?.isFocused() || false;
      },
      getValue: () => {
        return value;
      },
    }));
    
    // Handle focus event
    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      if (onFocus) {
        onFocus(e);
      }
    };
    
    // Handle blur event
    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      if (onBlur) {
        onBlur(e);
      }
    };
    
    // Handle text change
    const handleChangeText = (text: string) => {
      setValue(text);
      if (props.onChangeText) {
        props.onChangeText(text);
      }
    };
    
    // Get accessibility props
    const labelAccessibilityProps = getProps(
      accessibilityLabel || label,
      accessibilityHint || hint,
      'text'
    );
    
    // Get input accessibility props
    const inputAccessibilityProps = {
      accessible: true,
      accessibilityLabel: accessibilityLabel || label,
      accessibilityHint: accessibilityHint || hint,
      accessibilityRole: 'text' as const,
      accessibilityState: {
        disabled: props.editable === false,
        selected: isFocused,
      },
    };
    
    return (
      <View style={[styles.container, containerStyle]} testID={testID}>
        <Text
          style={[styles.label, labelStyle]}
          testID={`${testID}-label`}
          {...labelAccessibilityProps}
        >
          {label}
        </Text>
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            error && styles.inputError,
            inputStyle,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          testID={`${testID}-input`}
          {...inputAccessibilityProps}
          {...props}
        />
        
        {error ? (
          <Text
            style={[styles.error, errorStyle]}
            testID={`${testID}-error`}
            accessibilityLabel={`Error: ${error}`}
            accessibilityRole="text"
          >
            {error}
          </Text>
        ) : hint ? (
          <Text
            style={[styles.hint, hintStyle]}
            testID={`${testID}-hint`}
            accessibilityLabel={hint}
            accessibilityRole="text"
          >
            {hint}
          </Text>
        ) : null}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333333',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#ffffff',
  },
  inputFocused: {
    borderColor: '#0066cc',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#cc0000',
  },
  error: {
    fontSize: 14,
    color: '#cc0000',
    marginTop: 4,
  },
  hint: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
});
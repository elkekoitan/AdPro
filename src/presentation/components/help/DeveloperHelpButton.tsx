import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle } from 'react-native';
import { useAccessibility } from '../../hooks/useAccessibility';
import TestingDebuggingHelp from './TestingDebuggingHelp';
import { getDebugConfig } from '../../../shared/utils/debugging/debug-config';

// Declare __DEV__ for TypeScript
declare const __DEV__: boolean;

interface DeveloperHelpButtonProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  testID?: string;
  context?: string;
}

/**
 * Developer Help Button Component
 * 
 * A specialized help button for developers that provides access to testing and debugging documentation
 */
const DeveloperHelpButton: React.FC<DeveloperHelpButtonProps> = ({
  size = 24,
  color = '#007bff',
  style,
  testID = 'developerHelpButton',
  context = ''
}) => {
  const [isHelpVisible, setIsHelpVisible] = useState<boolean>(false);
  const { getButtonProps } = useAccessibility();
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  
  // Check if developer mode is enabled
  useEffect(() => {
    const checkDevMode = async () => {
      const debugConfig = getDebugConfig();
      setIsDevMode(!!debugConfig.enableVerboseLogging || __DEV__);
    };
    
    checkDevMode();
  }, []);
  
  // Only show the developer help button in development mode
  if (!isDevMode) {
    return null;
  }
  
  const handlePress = () => {
    setIsHelpVisible(true);
  };
  
  const handleClose = () => {
    setIsHelpVisible(false);
  };
  
  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.helpButton, style]}
        testID={testID}
        {...getButtonProps('Developer Help', 'Access testing and debugging documentation')}
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.helpButtonText, { fontSize: size, color }]}>🛠️</Text>
          <Text style={styles.helpButtonLabel}>Dev</Text>
        </View>
      </TouchableOpacity>
      
      <TestingDebuggingHelp
        isVisible={isHelpVisible}
        onClose={handleClose}
        context={context}
      />
    </>
  );
};

const styles = StyleSheet.create({
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  helpButtonLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6c757d',
  },
});

export default DeveloperHelpButton;
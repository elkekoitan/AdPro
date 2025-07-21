/**
 * Multi-Step Process Component
 * 
 * A component for handling multi-step processes with progress tracking.
 */

import React, { useState, useCallback, ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { StepProgressIndicator } from './ProgressIndicator';

interface Step {
  key: string;
  label: string;
  component: ReactNode;
  validate?: () => boolean | Promise<boolean>;
}

interface MultiStepProcessProps {
  steps: Step[];
  onComplete?: (data?: any) => void;
  initialStep?: number;
  style?: ViewStyle;
  showStepIndicator?: boolean;
  testID?: string;
}

/**
 * Multi-Step Process Component
 */
export const MultiStepProcess: React.FC<MultiStepProcessProps> = ({
  steps,
  onComplete,
  initialStep = 0,
  style,
  showStepIndicator = true,
  testID = 'multiStepProcess',
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const currentStep = steps[currentStepIndex];
  
  /**
   * Go to next step
   */
  const goToNextStep = useCallback(
    async (data?: any) => {
      if (isProcessing) return;
      
      try {
        setIsProcessing(true);
        
        // Update step data if provided
        if (data) {
          setStepData(prevData => ({
            ...prevData,
            [currentStep.key]: data,
          }));
        }
        
        // Validate current step if validation function exists
        if (currentStep.validate) {
          const isValid = await currentStep.validate();
          
          if (!isValid) {
            setIsProcessing(false);
            return;
          }
        }
        
        // Check if this is the last step
        if (currentStepIndex === steps.length - 1) {
          // Process is complete
          if (onComplete) {
            const finalData = {
              ...stepData,
              ...(data ? { [currentStep.key]: data } : {}),
            };
            
            onComplete(finalData);
          }
        } else {
          // Move to next step
          setCurrentStepIndex(prevIndex => prevIndex + 1);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [currentStep, currentStepIndex, isProcessing, onComplete, stepData, steps.length]
  );
  
  /**
   * Go to previous step
   */
  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0 && !isProcessing) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
    }
  }, [currentStepIndex, isProcessing]);
  
  /**
   * Go to specific step
   */
  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length && !isProcessing) {
        setCurrentStepIndex(index);
      }
    },
    [isProcessing, steps.length]
  );
  
  /**
   * Update step data
   */
  const updateStepData = useCallback((key: string, data: any) => {
    setStepData(prevData => ({
      ...prevData,
      [key]: data,
    }));
  }, []);
  
  /**
   * Get step data
   */
  const getStepData = useCallback(
    (key?: string) => {
      if (key) {
        return stepData[key];
      }
      return stepData;
    },
    [stepData]
  );
  
  // Create step context
  const stepContext = {
    currentStepIndex,
    totalSteps: steps.length,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    isProcessing,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateStepData,
    getStepData,
    stepData,
  };
  
  return (
    <View style={[styles.container, style]} testID={testID}>
      {showStepIndicator && (
        <StepProgressIndicator
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
          showLabels
          labels={steps.map(step => step.label)}
          style={styles.progressIndicator}
          testID={`${testID}-progress`}
        />
      )}
      
      <View style={styles.stepContainer} testID={`${testID}-step-${currentStepIndex}`}>
        {React.isValidElement(currentStep.component)
          ? React.cloneElement(currentStep.component as React.ReactElement, {
              stepContext,
            })
          : currentStep.component}
      </View>
    </View>
  );
};

/**
 * Step Component Props
 */
export interface StepComponentProps {
  stepContext?: {
    currentStepIndex: number;
    totalSteps: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    isProcessing: boolean;
    goToNextStep: (data?: any) => void;
    goToPreviousStep: () => void;
    goToStep: (index: number) => void;
    updateStepData: (key: string, data: any) => void;
    getStepData: (key?: string) => any;
    stepData: Record<string, any>;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressIndicator: {
    marginBottom: 24,
  },
  stepContainer: {
    flex: 1,
  },
});
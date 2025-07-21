/**
 * Progress Indicator Component
 * 
 * A customizable progress indicator for multi-step processes.
 */

import React from 'react';
import { View, StyleSheet, Text, Animated, ViewStyle, TextStyle } from 'react-native';

interface ProgressIndicatorProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
  showPercentage?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

/**
 * Progress Indicator Component
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  height = 8,
  backgroundColor = '#E1E9EE',
  progressColor = '#0066cc',
  animated = true,
  showPercentage = false,
  style,
  textStyle,
  testID = 'progressIndicator',
}) => {
  // Ensure progress is between 0 and 1
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  
  // Calculate percentage
  const percentage = Math.round(normalizedProgress * 100);
  
  // Create animated width
  const width = `${percentage}%`;
  
  return (
    <View style={[styles.container, { height }, style]} testID={testID}>
      <View
        style={[
          styles.background,
          {
            backgroundColor,
            height,
          },
        ]}
        testID={`${testID}-background`}
      />
      <Animated.View
        style={[
          styles.progress,
          {
            backgroundColor: progressColor,
            width,
            height,
          },
        ]}
        testID={`${testID}-progress`}
      />
      {showPercentage && (
        <Text style={[styles.text, textStyle]} testID={`${testID}-text`}>
          {percentage}%
        </Text>
      )}
    </View>
  );
};

/**
 * Step Progress Indicator Component
 */
interface StepProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedColor?: string;
  incompleteColor?: string;
  activeColor?: string;
  stepSize?: number;
  stepSpacing?: number;
  style?: ViewStyle;
  showLabels?: boolean;
  labels?: string[];
  labelStyle?: TextStyle;
  testID?: string;
}

export const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  completedColor = '#0066cc',
  incompleteColor = '#E1E9EE',
  activeColor = '#0099ff',
  stepSize = 24,
  stepSpacing = 40,
  style,
  showLabels = false,
  labels = [],
  labelStyle,
  testID = 'stepProgressIndicator',
}) => {
  // Ensure current step is valid
  const normalizedCurrentStep = Math.min(Math.max(currentStep, 1), totalSteps);
  
  // Generate steps
  const steps = Array.from({ length: totalSteps }, (_, index) => {
    const stepNumber = index + 1;
    const isCompleted = stepNumber < normalizedCurrentStep;
    const isActive = stepNumber === normalizedCurrentStep;
    
    return {
      number: stepNumber,
      isCompleted,
      isActive,
      color: isCompleted ? completedColor : isActive ? activeColor : incompleteColor,
      label: labels[index] || `Step ${stepNumber}`,
    };
  });
  
  return (
    <View style={[styles.stepContainer, style]} testID={testID}>
      <View style={styles.stepsWrapper} testID={`${testID}-steps`}>
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step circle */}
            <View
              style={[
                styles.step,
                {
                  width: stepSize,
                  height: stepSize,
                  borderRadius: stepSize / 2,
                  backgroundColor: step.color,
                },
              ]}
              testID={`${testID}-step-${step.number}`}
            >
              <Text
                style={[
                  styles.stepText,
                  {
                    color: step.isCompleted || step.isActive ? 'white' : '#666',
                  },
                ]}
                testID={`${testID}-step-text-${step.number}`}
              >
                {step.isCompleted ? '✓' : step.number}
              </Text>
            </View>
            
            {/* Connector line */}
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.connector,
                  {
                    width: stepSpacing - stepSize,
                    backgroundColor:
                      step.isCompleted ? completedColor : incompleteColor,
                  },
                ]}
                testID={`${testID}-connector-${index}`}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      
      {/* Labels */}
      {showLabels && (
        <View style={styles.labelsContainer} testID={`${testID}-labels`}>
          {steps.map(step => (
            <Text
              key={`label-${step.number}`}
              style={[
                styles.label,
                {
                  width: stepSize,
                  marginHorizontal: (stepSpacing - stepSize) / 2,
                  color: step.isActive ? activeColor : '#666',
                  fontWeight: step.isActive ? 'bold' : 'normal',
                },
                labelStyle,
              ]}
              testID={`${testID}-label-${step.number}`}
            >
              {step.label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    borderRadius: 4,
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  text: {
    position: 'absolute',
    right: 8,
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepContainer: {
    width: '100%',
  },
  stepsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  connector: {
    height: 2,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
});
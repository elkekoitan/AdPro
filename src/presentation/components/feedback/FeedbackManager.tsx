/**
 * Feedback Manager Component
 * 
 * A component for managing and displaying user feedback messages.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { ToastMessage, FeedbackType } from '../ui/FeedbackMessage';

interface FeedbackOptions {
  type?: FeedbackType;
  duration?: number;
  position?: 'top' | 'bottom';
  icon?: ReactNode;
}

interface FeedbackMessage {
  id: string;
  message: string;
  type: FeedbackType;
  duration: number;
  position: 'top' | 'bottom';
  icon?: ReactNode;
}

interface FeedbackContextType {
  showFeedback: (message: string, options?: FeedbackOptions) => string;
  hideFeedback: (id: string) => void;
  hideAllFeedback: () => void;
}

// Create context
const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

/**
 * Feedback Provider Component
 */
export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  
  /**
   * Show feedback message
   */
  const showFeedback = useCallback(
    (message: string, options: FeedbackOptions = {}): string => {
      const {
        type = 'info',
        duration = 3000,
        position = 'bottom',
        icon,
      } = options;
      
      const id = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id,
          message,
          type,
          duration,
          position,
          icon,
        },
      ]);
      
      return id;
    },
    []
  );
  
  /**
   * Hide feedback message
   */
  const hideFeedback = useCallback((id: string) => {
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== id));
  }, []);
  
  /**
   * Hide all feedback messages
   */
  const hideAllFeedback = useCallback(() => {
    setMessages([]);
  }, []);
  
  // Group messages by position
  const topMessages = messages.filter(msg => msg.position === 'top');
  const bottomMessages = messages.filter(msg => msg.position === 'bottom');
  
  return (
    <FeedbackContext.Provider
      value={{
        showFeedback,
        hideFeedback,
        hideAllFeedback,
      }}
    >
      {children}
      
      {/* Top messages */}
      <View style={styles.topContainer} pointerEvents="box-none">
        {topMessages.map(msg => (
          <ToastMessage
            key={msg.id}
            message={msg.message}
            type={msg.type}
            duration={msg.duration}
            position="top"
            onDismiss={() => hideFeedback(msg.id)}
            icon={msg.icon}
            testID={`feedback-${msg.id}`}
          />
        ))}
      </View>
      
      {/* Bottom messages */}
      <View style={styles.bottomContainer} pointerEvents="box-none">
        {bottomMessages.map(msg => (
          <ToastMessage
            key={msg.id}
            message={msg.message}
            type={msg.type}
            duration={msg.duration}
            position="bottom"
            onDismiss={() => hideFeedback(msg.id)}
            icon={msg.icon}
            testID={`feedback-${msg.id}`}
          />
        ))}
      </View>
    </FeedbackContext.Provider>
  );
};

/**
 * Use Feedback Hook
 */
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  
  return {
    /**
     * Show success message
     */
    showSuccess: (message: string, options: Omit<FeedbackOptions, 'type'> = {}) =>
      context.showFeedback(message, { ...options, type: 'success' }),
    
    /**
     * Show error message
     */
    showError: (message: string, options: Omit<FeedbackOptions, 'type'> = {}) =>
      context.showFeedback(message, { ...options, type: 'error' }),
    
    /**
     * Show info message
     */
    showInfo: (message: string, options: Omit<FeedbackOptions, 'type'> = {}) =>
      context.showFeedback(message, { ...options, type: 'info' }),
    
    /**
     * Show warning message
     */
    showWarning: (message: string, options: Omit<FeedbackOptions, 'type'> = {}) =>
      context.showFeedback(message, { ...options, type: 'warning' }),
    
    /**
     * Show custom feedback message
     */
    showFeedback: context.showFeedback,
    
    /**
     * Hide feedback message
     */
    hideFeedback: context.hideFeedback,
    
    /**
     * Hide all feedback messages
     */
    hideAllFeedback: context.hideAllFeedback,
  };
};

const styles = StyleSheet.create({
  topContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});
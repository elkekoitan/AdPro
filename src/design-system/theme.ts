/**
 * AdVantage 2025 Design System Theme
 * Modern, accessible, and scalable theme configuration
 */

export const theme = {
  // Color System
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#f0f7ff',
      100: '#e0efff',
      200: '#b8ddff',
      300: '#7bc3ff',
      400: '#36a5ff',
      500: '#0988f5',
      600: '#006bd6',
      700: '#0056b3',
      800: '#004794',
      900: '#003875',
    },
    
    // Secondary Brand Colors
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
    
    // Accent Colors
    accent: {
      orange: '#ff6b35',
      pink: '#ff49db',
      teal: '#14b8a6',
      amber: '#f59e0b',
    },
    
    // Semantic Colors
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    
    // Neutral Gray Scale
    gray: {
      0: '#ffffff',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    
    // Background Colors
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      overlay: 'rgba(0, 0, 0, 0.5)',
      card: '#ffffff',
      modal: '#ffffff',
    },
    
    // Surface Colors
    surface: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      elevated: '#ffffff',
      disabled: '#f3f4f6',
    },
    
    // Border Colors
    border: {
      primary: '#e5e7eb',
      secondary: '#d1d5db',
      focus: '#3b82f6',
      error: '#ef4444',
      success: '#22c55e',
    },
    
    // Text Colors
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      placeholder: '#9ca3af',
      disabled: '#d1d5db',
      inverse: '#ffffff',
      link: '#3b82f6',
      linkHover: '#2563eb',
    },
  },
  
  // Typography System
  typography: {
    // Font Families
    fontFamily: {
      sans: ['SF Pro Display', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
    },
    
    // Font Sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60,
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    
    // Font Weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    // Text Styles
    styles: {
      h1: {
        fontSize: 48,
        fontWeight: '700',
        lineHeight: 1.25,
      },
      h2: {
        fontSize: 36,
        fontWeight: '600',
        lineHeight: 1.25,
      },
      h3: {
        fontSize: 30,
        fontWeight: '600',
        lineHeight: 1.375,
      },
      h4: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 1.375,
      },
      h5: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 1.5,
      },
      h6: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 1.5,
      },
      body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 1.5,
      },
      caption: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 1.375,
      },
      small: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 1.25,
      },
    },
  },
  
  // Spacing System
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
  },
  
  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    base: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  
  // Animation & Transitions
  animation: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
      slower: 500,
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  
  // Breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  
  // Component-specific styles
  components: {
    button: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      fontSize: 16,
      fontWeight: '600',
    },
    input: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      borderWidth: 1,
    },
    card: {
      borderRadius: 12,
      padding: 20,
      backgroundColor: '#ffffff',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
  },
  
  // Dark Mode Support
  darkMode: {
    colors: {
      background: {
        primary: '#111827',
        secondary: '#1f2937',
        tertiary: '#374151',
      },
      surface: {
        primary: '#1f2937',
        secondary: '#374151',
        elevated: '#4b5563',
      },
      text: {
        primary: '#f9fafb',
        secondary: '#d1d5db',
        tertiary: '#9ca3af',
      },
      border: {
        primary: '#374151',
        secondary: '#4b5563',
      },
    },
  },
};

// Theme type definitions
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeTypography = typeof theme.typography;
export type ThemeSpacing = typeof theme.spacing;

// Helper functions
export const getColor = (colorPath: string): string => {
  const keys = colorPath.split('.');
  let value: any = theme.colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return theme.colors.gray[500];
    }
  }
  
  return value;
};

export const getSpacing = (space: keyof typeof theme.spacing): number => {
  return theme.spacing[space];
};

export const getTypography = (style: keyof typeof theme.typography.styles) => {
  return theme.typography.styles[style];
};

export default theme; 
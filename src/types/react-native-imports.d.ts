/**
 * React Native Import Type Definitions
 * This file fixes the React and React Native import errors in the project
 */

declare module 'react' {
  // Fix default export
  const React: typeof import('react');
  export = React;
  
  // Named exports
  export const useState: typeof import('react')['useState'];
  export const useEffect: typeof import('react')['useEffect'];
  export const useCallback: typeof import('react')['useCallback'];
  export const useMemo: typeof import('react')['useMemo'];
  export const useRef: typeof import('react')['useRef'];
  export const useContext: typeof import('react')['useContext'];
  export const createContext: typeof import('react')['createContext'];
  export const forwardRef: typeof import('react')['forwardRef'];
  export const memo: typeof import('react')['memo'];
  export const Fragment: typeof import('react')['Fragment'];
  export const Component: typeof import('react')['Component'];
  export const PureComponent: typeof import('react')['PureComponent'];
  
  export type FC<P = {}> = import('react').FC<P>;
  export type ReactNode = import('react').ReactNode;
  export type ReactElement = import('react').ReactElement;
  export type ComponentProps<T> = import('react').ComponentProps<T>;
  export type PropsWithChildren<P = {}> = import('react').PropsWithChildren<P>;
}

declare module 'react-native' {
  // Core components
  export const View: typeof import('react-native')['View'];
  export const Text: typeof import('react-native')['Text'];
  export const StyleSheet: typeof import('react-native')['StyleSheet'];
  export const ScrollView: typeof import('react-native')['ScrollView'];
  export const TouchableOpacity: typeof import('react-native')['TouchableOpacity'];
  export const TouchableWithoutFeedback: typeof import('react-native')['TouchableWithoutFeedback'];
  export const Image: typeof import('react-native')['Image'];
  export const TextInput: typeof import('react-native')['TextInput'];
  export const ActivityIndicator: typeof import('react-native')['ActivityIndicator'];
  export const FlatList: typeof import('react-native')['FlatList'];
  export const SafeAreaView: typeof import('react-native')['SafeAreaView'];
  export const KeyboardAvoidingView: typeof import('react-native')['KeyboardAvoidingView'];
  export const Alert: typeof import('react-native')['Alert'];
  export const Platform: typeof import('react-native')['Platform'];
  export const Dimensions: typeof import('react-native')['Dimensions'];
  export const StatusBar: typeof import('react-native')['StatusBar'];
  export const RefreshControl: typeof import('react-native')['RefreshControl'];
  export const Modal: typeof import('react-native')['Modal'];
  export const Switch: typeof import('react-native')['Switch'];
  export const Linking: typeof import('react-native')['Linking'];
  export const Animated: typeof import('react-native')['Animated'];
  export const Easing: typeof import('react-native')['Easing'];
  export const LayoutAnimation: typeof import('react-native')['LayoutAnimation'];
  export const UIManager: typeof import('react-native')['UIManager'];
  
  // Types
  export type ViewStyle = import('react-native')['ViewStyle'];
  export type TextStyle = import('react-native')['TextStyle'];
  export type ImageStyle = import('react-native')['ImageStyle'];
  export type StyleProp<T> = import('react-native')['StyleProp<T>'];
  export type ViewProps = import('react-native')['ViewProps'];
  export type TextProps = import('react-native')['TextProps'];
  export type TouchableOpacityProps = import('react-native')['TouchableOpacityProps'];
}

// Fix react-native-vector-icons
declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react';
  
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  export default class Ionicons extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/MaterialIcons' {
  import { Component } from 'react';
  
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  export default class MaterialIcons extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/FontAwesome' {
  import { Component } from 'react';
  
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  export default class FontAwesome extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/Feather' {
  import { Component } from 'react';
  
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  export default class Feather extends Component<IconProps> {} 
}
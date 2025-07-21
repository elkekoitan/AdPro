/**
 * React Native Environment Type Declarations
 */

// Declare global __DEV__ variable
declare const __DEV__: boolean;

// Extend the React namespace
declare namespace React {
  // Add FC (FunctionComponent) type if missing
  interface FC<P = {}> {
    (props: P, context?: any): React.ReactElement<any, any> | null;
    displayName?: string;
    defaultProps?: Partial<P>;
  }
}
declare const __DEV__: boolean;

declare global {
  namespace NodeJS {
    interface Global {
      console: Console;
    }
  }
}
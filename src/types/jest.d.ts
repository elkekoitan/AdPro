declare namespace jest {
  interface Matchers<R> {
    toBeVisible(): R;
    toExist(): R;
    toHaveText(text: string): R;
    toHaveProp(propName: string, propValue?: any): R;
    toHaveStyle(style: object): R;
  }
}

declare const expect: {
  <T = any>(actual: T): jest.Matchers<T>;
  extend(matchers: Record<string, any>): void;
};
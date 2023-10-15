/* eslint-disable @typescript-eslint/no-empty-interface */
export {};

interface CustomMatchers<R = unknown> {
  toSettle(ms: number): Promise<R>;
  numberBetween(argumentOne: number, argumentTwo: number): R;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

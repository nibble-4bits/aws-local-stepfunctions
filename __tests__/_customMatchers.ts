/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-namespace */

interface CustomMatchers<R = unknown> {
  toSettle(ms: number): Promise<R>;
}

declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}

import { expect } from '@jest/globals';

const TIMED_OUT = Symbol();

function timeout(ms: number) {
  return new Promise<typeof TIMED_OUT>((resolve) => {
    setTimeout(() => resolve(TIMED_OUT), ms);
  });
}

expect.extend({
  async toSettle(testPromise: Promise<unknown>, ms: number) {
    const promise = await Promise.race([testPromise, timeout(ms)]);
    const isExpectedResult = promise !== TIMED_OUT;

    if (isExpectedResult) {
      return {
        message: () => `Expected promise not to settle`,
        pass: true,
      };
    }

    return {
      message: () => `Expected promise to settle, but timed out after ${ms}ms`,
      pass: false,
    };
  },
});

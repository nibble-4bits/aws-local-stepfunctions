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
  numberBetween(received: number, argumentOne: number, argumentTwo: number) {
    if (argumentOne > argumentTwo) {
      // Switch values
      [argumentOne, argumentTwo] = [argumentTwo, argumentOne];
    }

    const pass = received >= argumentOne && received <= argumentTwo;

    return {
      pass,
      message: pass
        ? () => `expected ${received} not to be between ${argumentOne} and ${argumentTwo}`
        : () => `expected ${received} to be between ${argumentOne} and ${argumentTwo}`,
    };
  },
});

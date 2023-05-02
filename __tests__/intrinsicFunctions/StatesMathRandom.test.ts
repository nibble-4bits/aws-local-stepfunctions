import { StatesMathRandom } from '../../src/stateMachine/intrinsicFunctions/StatesMathRandom';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.MathRandom intrinsic function', () => {
  test('should return a random number between the minimum and maximum limits', () => {
    const func = new StatesMathRandom();
    const input = {};
    const context = {};
    const funcArgs = ['1', '10'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10);
  });

  test('should always return the same random number when passing a seed', () => {
    const func = new StatesMathRandom();
    const input = {};
    const context = {};
    const funcArgs = ['1', '10', '12345'];

    const result1 = func.call(input, context, ...funcArgs);
    const result2 = func.call(input, context, ...funcArgs);
    expect(result1).toBe(result2);
  });

  describe('Validation errors', () => {
    test('should throw error if first argument is not a number', () => {
      const func = new StatesMathRandom();
      const input = {};
      const context = {};
      const funcArgs = ["'not a number'", '10'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if second argument is not a number', () => {
      const func = new StatesMathRandom();
      const input = {};
      const context = {};
      const funcArgs = ['1', "'not a number'"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if third argument is not a number', () => {
      const func = new StatesMathRandom();
      const input = {};
      const context = {};
      const funcArgs = ['1', '10', "'not a number'"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if first argument is not an integer', () => {
      const func = new StatesMathRandom();
      const input = {};
      const context = {};
      const funcArgs = ['1.5', '10'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if second argument is not an integer', () => {
      const func = new StatesMathRandom();
      const input = {};
      const context = {};
      const funcArgs = ['1', '10.5'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

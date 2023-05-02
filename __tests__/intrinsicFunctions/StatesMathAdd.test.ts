import { StatesMathAdd } from '../../src/stateMachine/intrinsicFunctions/StatesMathAdd';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.MathAdd intrinsic function', () => {
  test('should return the sum of the two numbers', () => {
    const func = new StatesMathAdd();
    const input = {};
    const context = {};
    const funcArgs = ['3', '7'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe(10);
  });

  describe('Validation errors', () => {
    test('should throw error if first argument is not a number', () => {
      const func = new StatesMathAdd();
      const input = {};
      const context = {};
      const funcArgs = ["'not a number'", '7'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if second argument is not a number', () => {
      const func = new StatesMathAdd();
      const input = {};
      const context = {};
      const funcArgs = ['3', "'not a number'"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

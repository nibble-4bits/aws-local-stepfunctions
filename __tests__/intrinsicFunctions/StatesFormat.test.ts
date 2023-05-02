import { StatesFormat } from '../../src/stateMachine/intrinsicFunctions/StatesFormat';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.Format intrinsic function', () => {
  test('should return string with occurrences of {} replaced with its corresponding argument', () => {
    const func = new StatesFormat();
    const input = {};
    const context = {};
    const funcArgs = ["'Hello, {}! This is a {}.'", "'world'", "'string'"];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe('Hello, world! This is a string.');
  });

  test('should return string with escaped braces \\{\\} not replaced', () => {
    const func = new StatesFormat();
    const input = {};
    const context = {};
    const funcArgs = ["'Hello, \\{\\}! This is a \\{\\}.'"];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe('Hello, {}! This is a {}.');
  });

  describe('Validation errors', () => {
    test('should throw error if there are less placeholder arguments than occurrences of {}', () => {
      const func = new StatesFormat();
      const input = {};
      const context = {};
      const funcArgs = ["'Hello, {}! This is a {}.'", "'world'"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if there are more placeholder arguments than occurrences of {}', () => {
      const func = new StatesFormat();
      const input = {};
      const context = {};
      const funcArgs = ["'Hello, {}! This is a {}.'", "'world'", "'string'", "'extra'"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if first argument is not a string', () => {
      const func = new StatesFormat();
      const input = {};
      const context = {};
      const funcArgs = ['false', "'world'", "'string'"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if placeholder argument is an array', () => {
      const func = new StatesFormat();
      const input = { array: [1, 2, 3] };
      const context = {};
      const funcArgs = ["'Hello, {}!'", '$.array'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if placeholder argument is an object', () => {
      const func = new StatesFormat();
      const input = { object: { a: 1, b: 2 } };
      const context = {};
      const funcArgs = ["'Hello, {}!'", '$.object'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

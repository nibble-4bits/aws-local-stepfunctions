import { StatesArrayRange } from '../../src/stateMachine/intrinsicFunctions/StatesArrayRange';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.ArrayRange intrinsic function', () => {
  describe('Positive step', () => {
    test('should return an increasing range when both limits are positive', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['1', '9', '2'];

      const result = func.call(input, context, ...funcArgs);
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    test('should return an increasing range when start is negative and end is positive', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['-1', '9', '2'];

      const result = func.call(input, context, ...funcArgs);
      expect(result).toEqual([-1, 1, 3, 5, 7, 9]);
    });

    test('should return an increasing range when both limits are negative', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['-9', '-1', '2'];

      const result = func.call(input, context, ...funcArgs);
      expect(result).toEqual([-9, -7, -5, -3, -1]);
    });

    test('should return an empty array when start is greater than end', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['-1', '-9', '2'];

      const result = func.call(input, context, ...funcArgs);
      expect(result).toEqual([]);
    });
  });

  describe('Negative step', () => {
    test('should return a decreasing range when both limits are positive', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['9', '1', '-2'];

      const result = func.call(input, context, ...funcArgs);
      expect(result).toEqual([9, 7, 5, 3, 1]);
    });

    test('should return a decreasing range when start is positive and end is negative', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['9', '-1', '-2'];

      const result = func.call(input, context, ...funcArgs);
      expect(result).toEqual([9, 7, 5, 3, 1, -1]);
    });

    test('should return a decreasing range when both limits are negative', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['-1', '-9', '-2'];

      const result = func.call(input, context, ...funcArgs);
      expect(result).toEqual([-1, -3, -5, -7, -9]);
    });

    test('should return an empty array when end is greater than start', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['-9', '-1', '-2'];

      const result = func.call(input, context, ...funcArgs);
      expect(result).toEqual([]);
    });
  });

  describe('Validation errors', () => {
    test('should throw error if generated array contains more than 1000 items', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['1', '1001', '1'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if first argument is not a number', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ["'not a number'", '9', '2'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if second argument is not a number', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['1', "'not a number'", '2'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if third argument is not a number', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['1', '9', "'not a number'"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if first argument is not an integer', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['1.5', '9', '2'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if second argument is not an integer', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['1', '9.5', '2'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if third argument is zero', () => {
      const func = new StatesArrayRange();
      const input = {};
      const context = {};
      const funcArgs = ['1', '9', '0'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

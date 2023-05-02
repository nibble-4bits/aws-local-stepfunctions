import { StatesJsonMerge } from '../../src/stateMachine/intrinsicFunctions/StatesJsonMerge';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.JsonMerge intrinsic function', () => {
  test('should return shallow merge of passed objects', () => {
    const func = new StatesJsonMerge();
    const input = {
      json1: { a: { a1: 1, a2: 2 }, b: 2 },
      json2: { a: { a3: 1, a4: 2 }, c: 3 },
    };
    const context = {};
    const funcArgs = ['$.json1', '$.json2', 'false'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toEqual({ a: { a3: 1, a4: 2 }, b: 2, c: 3 });
  });

  describe('Validation errors', () => {
    test('should throw error if third argument is true', () => {
      const func = new StatesJsonMerge();
      const input = {
        json1: { a: { a1: 1, a2: 2 }, b: 2 },
        json2: { a: { a3: 1, a4: 2 }, c: 3 },
      };
      const context = {};
      const funcArgs = ['$.json1', '$.json2', 'true'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if first argument is not an object', () => {
      const func = new StatesJsonMerge();
      const input = {
        json1: { a: { a1: 1, a2: 2 }, b: 2 },
        json2: { a: { a3: 1, a4: 2 }, c: 3 },
      };
      const context = {};
      const funcArgs = ['"not an object"', '$.json2', 'false'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if second argument is not an object', () => {
      const func = new StatesJsonMerge();
      const input = {
        json1: { a: { a1: 1, a2: 2 }, b: 2 },
        json2: { a: { a3: 1, a4: 2 }, c: 3 },
      };
      const context = {};
      const funcArgs = ['$.json1', '"not an object"', 'false'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if second argument is not a boolean', () => {
      const func = new StatesJsonMerge();
      const input = {
        json1: { a: { a1: 1, a2: 2 }, b: 2 },
        json2: { a: { a3: 1, a4: 2 }, c: 3 },
      };
      const context = {};
      const funcArgs = ['$.json1', '$.json2', '"not a boolean"'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

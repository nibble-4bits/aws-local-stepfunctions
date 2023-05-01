import { StatesArrayGetItem } from '../../src/stateMachine/intrinsicFunctions/StatesArrayGetItem';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.ArrayGetItem intrinsic function', () => {
  test('should return item at the specified index', () => {
    const func = new StatesArrayGetItem();
    const input = {
      array: [1, 2, 3, 'string', null, true, false, { val1: 'hello', val2: 3 }],
    };
    const context = {};
    const funcArgs = ['$.array', '3'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe('string');
  });

  test('should return null if the specified index is out of bounds', () => {
    const func = new StatesArrayGetItem();
    const input = {
      array: [1, 2, 3, 'string', null, true, false, { val1: 'hello', val2: 3 }],
    };
    const context = {};
    const funcArgs = ['$.array', '20'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe(null);
  });

  describe('Validation errors', () => {
    test('should throw error if first argument is not an array', () => {
      const func = new StatesArrayGetItem();
      const input = {
        array: 'not an array',
      };
      const context = {};
      const funcArgs = ['$.array', '3'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if second argument is not a number', () => {
      const func = new StatesArrayGetItem();
      const input = {
        array: [1, 2, 3, 'string', null, true, false, { val1: 'hello', val2: 3 }],
      };
      const context = {};
      const funcArgs = ['$.array', "'not a number'"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

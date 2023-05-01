import { StatesArrayContains } from '../../src/stateMachine/intrinsicFunctions/StatesArrayContains';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.ArrayContains intrinsic function', () => {
  test('should return true if array contains specified item', () => {
    const func = new StatesArrayContains();
    const input = {
      array: [1, 2, 3, 'string', null, true, false, { val1: 'hello', val2: 3 }],
      lookFor: {
        val1: 'hello',
        val2: 3,
      },
    };
    const context = {};
    const funcArgs = ['$.array', '$.lookFor'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe(true);
  });

  test('should return false if array does not contain specified item', () => {
    const func = new StatesArrayContains();
    const input = {
      array: [1, 2, 3, 'string', null, true, false, { val1: 'hello', val2: 3 }],
      lookFor: {
        val1: 'world',
        val2: 10,
      },
    };
    const context = {};
    const funcArgs = ['$.array', '$.lookFor'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe(false);
  });

  describe('Validation errors', () => {
    test('should throw error if first argument is not an array', () => {
      const func = new StatesArrayContains();
      const input = {
        array: 'not an array',
        lookFor: {
          val1: 'hello',
          val2: 3,
        },
      };
      const context = {};
      const funcArgs = ['$.array', '$.lookFor'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

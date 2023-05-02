import { StatesArrayLength } from '../../src/stateMachine/intrinsicFunctions/StatesArrayLength';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.ArrayLength intrinsic function', () => {
  test('should return length of passed array', () => {
    const func = new StatesArrayLength();
    const input = {
      array: [1, 2, 3, 'string', null, true, false, { val1: 'hello', val2: 3 }],
    };
    const context = {};
    const funcArgs = ['$.array'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe(8);
  });

  describe('Validation errors', () => {
    test('should throw error if first argument is not an array', () => {
      const func = new StatesArrayLength();
      const input = {
        array: 'not an array',
      };
      const context = {};
      const funcArgs = ['$.array'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

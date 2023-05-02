import { StatesStringSplit } from '../../src/stateMachine/intrinsicFunctions/StatesStringSplit';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.StringSplit intrinsic function', () => {
  test('should return an array of strings split by the separator character', () => {
    const func = new StatesStringSplit();
    const input = {};
    const context = {};
    const funcArgs = ["'1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - 10'", "' - '"];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  });

  describe('Validation errors', () => {
    test('should throw error if first argument is not a string', () => {
      const func = new StatesStringSplit();
      const input = {};
      const context = {};
      const funcArgs = ['false', "' - '"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if second argument is not a string', () => {
      const func = new StatesStringSplit();
      const input = {};
      const context = {};
      const funcArgs = ["'1 - 2 - 3 - 4 - 5 - 6 - 7 - 8 - 9 - 10'", 'false'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

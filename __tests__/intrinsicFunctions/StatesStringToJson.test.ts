import { StatesStringToJson } from '../../src/stateMachine/intrinsicFunctions/StatesStringToJson';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.StringToJson intrinsic function', () => {
  test('should return parsed JSON string', () => {
    const func = new StatesStringToJson();
    const input = {
      jsonStr: '{"a":{"a1":1,"a2":2},"b":2}',
    };
    const context = {};
    const funcArgs = ['$.jsonStr'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toEqual({ a: { a1: 1, a2: 2 }, b: 2 });
  });

  describe('Validation errors', () => {
    test('should throw error if first argument is not a string', () => {
      const func = new StatesStringToJson();
      const input = {};
      const context = {};
      const funcArgs = ['false', "' - '"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

import { StatesBase64Decode } from '../../src/stateMachine/intrinsicFunctions/StatesBase64Decode';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.Base64Decode intrinsic function', () => {
  test('should return decoded Base64 string', () => {
    const func = new StatesBase64Decode();
    const input = {};
    const context = {};
    const funcArgs = ["'SGVsbG8sIHdvcmxkISBUaGlzIGlzIGEgQmFzZTY0IGVuY29kZWQgc3RyaW5n'"];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe('Hello, world! This is a Base64 encoded string');
  });

  describe('Validation errors', () => {
    test('should throw error if passed string has a length of more than 10,000 characters', () => {
      const func = new StatesBase64Decode();
      const input = {};
      const context = {};
      const largeString = 'a'.repeat(10001);
      const funcArgs = [`'${largeString}'`];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if first argument is not a string', () => {
      const func = new StatesBase64Decode();
      const input = {};
      const context = {};
      const funcArgs = ['false'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

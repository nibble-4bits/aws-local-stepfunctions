import { StatesBase64Encode } from '../../src/stateMachine/intrinsicFunctions/StatesBase64Encode';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.Base64Encode intrinsic function', () => {
  test('should return encoded Base64 string', () => {
    const func = new StatesBase64Encode();
    const input = {};
    const context = {};
    const funcArgs = ["'Hello, world! This is a Base64 encoded string'"];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe('SGVsbG8sIHdvcmxkISBUaGlzIGlzIGEgQmFzZTY0IGVuY29kZWQgc3RyaW5n');
  });

  describe('Validation errors', () => {
    test('should throw error if passed string has a length of more than 10,000 characters', () => {
      const func = new StatesBase64Encode();
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
      const func = new StatesBase64Encode();
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

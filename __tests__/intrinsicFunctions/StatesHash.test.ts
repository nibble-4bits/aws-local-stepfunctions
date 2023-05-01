import { StatesHash } from '../../src/stateMachine/intrinsicFunctions/StatesHash';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.Hash intrinsic function', () => {
  test('should return hashed MD5 string', () => {
    const func = new StatesHash();
    const input = {};
    const context = {};
    const funcArgs = ["'Test string'", "'MD5'"];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe('0fd3dbec9730101bff92acc820befc34');
  });

  test('should return hashed SHA1 string', () => {
    const func = new StatesHash();
    const input = {};
    const context = {};
    const funcArgs = ["'Test string'", "'SHA-1'"];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe('18af819125b70879d36378431c4e8d9bfa6a2599');
  });

  test('should return hashed SHA256 string', () => {
    const func = new StatesHash();
    const input = {};
    const context = {};
    const funcArgs = ["'Test string'", "'SHA-256'"];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe('a3e49d843df13c2e2a7786f6ecd7e0d184f45d718d1ac1a8a63e570466e489dd');
  });

  test('should return hashed SHA384 string', () => {
    const func = new StatesHash();
    const input = {};
    const context = {};
    const funcArgs = ["'Test string'", "'SHA-384'"];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe(
      '83ca14ebf3005a10f50839742bda82aa607d972a03b1e6a3086e29195ceaf05f038fecdff02aff6e9dcdd273268875f7'
    );
  });

  test('should return hashed SHA512 string', () => {
    const func = new StatesHash();
    const input = {};
    const context = {};
    const funcArgs = ["'Test string'", "'SHA-512'"];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe(
      '811aa0c53c0039b6ead0ca878b096eed1d39ed873fd2d2d270abfb9ca620d3ed561c565d6dbd1114c323d38e3f59c00df475451fc9b30074f2abda3529df2fa7'
    );
  });

  describe('Validation errors', () => {
    test('should throw error if passed string has a length of more than 10,000 characters', () => {
      const func = new StatesHash();
      const input = {};
      const context = {};
      const largeString = 'a'.repeat(10001);
      const funcArgs = [`'${largeString}'`, "'MD5'"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if passed hashing algorithm is not one of the supported algorithms', () => {
      const func = new StatesHash();
      const input = {};
      const context = {};
      const funcArgs = ["'Test string'", "'SHA-200'"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if first argument is not a string', () => {
      const func = new StatesHash();
      const input = {};
      const context = {};
      const funcArgs = ['false', "'MD5'"];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });

    test('should throw error if second argument is not a string', () => {
      const func = new StatesHash();
      const input = {};
      const context = {};
      const funcArgs = ["'Test string'", 'false'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

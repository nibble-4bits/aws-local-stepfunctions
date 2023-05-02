import type { IntrinsicFunctionDefinition } from '../../src/typings/IntrinsicFunctionsImplementation';
import { parseArguments, validateArguments } from '../../src/stateMachine/intrinsicFunctions/ArgumentHandling';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

describe('Intrinsic function argument handling', () => {
  describe('Argument parsing', () => {
    test('should parse string arguments', () => {
      const input = {};
      const context = {};
      const args = ["'string 1'", "'hello'", "'world'"];

      const parsedArgs = parseArguments(input, context, ...args);
      expect(parsedArgs).toEqual(['string 1', 'hello', 'world']);
    });

    test('should parse number arguments', () => {
      const input = {};
      const context = {};
      const args = ['0', '1', '-1', '1.325'];

      const parsedArgs = parseArguments(input, context, ...args);
      expect(parsedArgs).toEqual([0, 1, -1, 1.325]);
    });

    test('should parse boolean arguments', () => {
      const input = {};
      const context = {};
      const args = ['true', 'false'];

      const parsedArgs = parseArguments(input, context, ...args);
      expect(parsedArgs).toEqual([true, false]);
    });

    test('should parse null argument', () => {
      const input = {};
      const context = {};
      const args = ['null'];

      const parsedArgs = parseArguments(input, context, ...args);
      expect(parsedArgs).toEqual([null]);
    });

    test('should parse path arguments', () => {
      const input = { inputValue: 55 };
      const context = { contextValue: 'some string' };
      const args = ['$.inputValue', '$$.contextValue'];

      const parsedArgs = parseArguments(input, context, ...args);
      expect(parsedArgs).toEqual([55, 'some string']);
    });
  });

  describe('Argument validation', () => {
    describe('Number of arguments', () => {
      test('should throw error if number of arguments is different from `exactArgs` value', () => {
        const funcDefinition: IntrinsicFunctionDefinition = { name: 'Generic.Function', exactArgs: 2 };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 1, 2, 3);
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expects exactly 2 arguments, but received 3$/
        );
      });

      test('should throw error if number of arguments is less than `minArgs` value', () => {
        const funcDefinition: IntrinsicFunctionDefinition = { name: 'Generic.Function', minArgs: 2 };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 1);
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expects at least 2 arguments, but received 1$/
        );
      });

      test('should throw error if number of arguments is greater than `maxArgs` value', () => {
        const funcDefinition: IntrinsicFunctionDefinition = { name: 'Generic.Function', maxArgs: 2 };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 1, 2, 3);
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expects at most 2 arguments, but received 3$/
        );
      });
    });

    describe('Type of arguments', () => {
      test('should throw error if expected argument is not of type string', () => {
        const funcDefinition: IntrinsicFunctionDefinition = {
          name: 'Generic.Function',
          arguments: [{ allowedTypes: ['string'] }],
        };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 50);
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expected argument 1 to be of type "string", but received number$/
        );
      });

      test('should throw error if expected argument is not of type number', () => {
        const funcDefinition: IntrinsicFunctionDefinition = {
          name: 'Generic.Function',
          arguments: [{ allowedTypes: ['number'] }],
        };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 'not a number');
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expected argument 1 to be of type "number", but received string$/
        );
      });

      test('should throw error if expected argument is not of type boolean', () => {
        const funcDefinition: IntrinsicFunctionDefinition = {
          name: 'Generic.Function',
          arguments: [{ allowedTypes: ['boolean'] }],
        };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 'not a boolean');
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expected argument 1 to be of type "boolean", but received string$/
        );
      });

      test('should throw error if expected argument is not of type null', () => {
        const funcDefinition: IntrinsicFunctionDefinition = {
          name: 'Generic.Function',
          arguments: [{ allowedTypes: ['null'] }],
        };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 'not null');
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expected argument 1 to be of type "null", but received string$/
        );
      });

      test('should throw error if expected argument is not of type array', () => {
        const funcDefinition: IntrinsicFunctionDefinition = {
          name: 'Generic.Function',
          arguments: [{ allowedTypes: ['array'] }],
        };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 'not an array');
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expected argument 1 to be of type "array", but received string$/
        );
      });

      test('should throw error if expected argument is not of type object', () => {
        const funcDefinition: IntrinsicFunctionDefinition = {
          name: 'Generic.Function',
          arguments: [{ allowedTypes: ['object'] }],
        };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 'not an object');
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expected argument 1 to be of type "object", but received string$/
        );
      });

      test('should NOT throw error if expected argument is of type any', () => {
        const funcDefinition: IntrinsicFunctionDefinition = {
          name: 'Generic.Function',
          arguments: [{ allowedTypes: ['any'] }],
        };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 'hello, world');
        }

        expect(validateArgumentsWrapper).not.toThrow(StatesRuntimeError);
      });
    });

    describe('Constraints of arguments', () => {
      test('should throw error if expected number argument is not zero', () => {
        const funcDefinition: IntrinsicFunctionDefinition = {
          name: 'Generic.Function',
          arguments: [
            {
              allowedTypes: ['number'],
              constraints: ['ZERO'],
            },
          ],
        };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 1);
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expected argument 1 to satisfy the following constraints: "ZERO"$/
        );
      });

      test('should throw error if expected number argument is not a positive integer', () => {
        const funcDefinition: IntrinsicFunctionDefinition = {
          name: 'Generic.Function',
          arguments: [
            {
              allowedTypes: ['number'],
              constraints: ['POSITIVE_INTEGER'],
            },
          ],
        };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, -1);
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expected argument 1 to satisfy the following constraints: "POSITIVE_INTEGER"$/
        );
      });

      test('should throw error if expected number argument is not a negative integer', () => {
        const funcDefinition: IntrinsicFunctionDefinition = {
          name: 'Generic.Function',
          arguments: [
            {
              allowedTypes: ['number'],
              constraints: ['NEGATIVE_INTEGER'],
            },
          ],
        };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 1);
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expected argument 1 to satisfy the following constraints: "NEGATIVE_INTEGER"$/
        );
      });

      test('should throw error if expected number argument is not an integer', () => {
        const funcDefinition: IntrinsicFunctionDefinition = {
          name: 'Generic.Function',
          arguments: [
            {
              allowedTypes: ['number'],
              constraints: ['INTEGER'],
            },
          ],
        };

        function validateArgumentsWrapper() {
          validateArguments(funcDefinition, 1.12345);
        }

        expect(validateArgumentsWrapper).toThrow(StatesRuntimeError);
        expect(validateArgumentsWrapper).toThrow(
          /^Intrinsic function Generic.Function expected argument 1 to satisfy the following constraints: "INTEGER"$/
        );
      });
    });
  });
});

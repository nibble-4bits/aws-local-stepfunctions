import { StatesArrayPartition } from '../../src/stateMachine/intrinsicFunctions/StatesArrayPartition';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.ArrayPartition intrinsic function', () => {
  test('should return partitioned array', () => {
    const func = new StatesArrayPartition();
    const input = {
      array: [1, 2, 3, 'string', null, true, false, { val1: 'hello', val2: 3 }],
    };
    const context = {};
    const funcArgs = ['$.array', '3'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toEqual([
      [1, 2, 3],
      ['string', null, true],
      [false, { val1: 'hello', val2: 3 }],
    ]);
  });

  describe('Validation errors', () => {
    test('should throw error if first argument is not an array', () => {
      const func = new StatesArrayPartition();
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
      const func = new StatesArrayPartition();
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

    test('should throw error if second argument is not a positive integer', () => {
      const func = new StatesArrayPartition();
      const input = {
        array: [1, 2, 3, 'string', null, true, false, { val1: 'hello', val2: 3 }],
      };
      const context = {};
      const funcArgs = ['$.array', '0'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

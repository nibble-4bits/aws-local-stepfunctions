import { StatesRuntimeError } from '../../../src/error/predefined/StatesRuntimeError';
import { ArrayConstraint } from '../../../src/stateMachine/jsonPath/constraints/ArrayConstraint';

afterEach(() => {
  jest.clearAllMocks();
});

describe('ArrayConstraint', () => {
  test('should not throw if passed value is an array', () => {
    const value = ['item', 1, { a: 1, b: 2 }, [], true];

    const constraint = new ArrayConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).not.toThrow();
  });

  test('should throw if passed value is not an array', () => {
    const value = 55;

    const constraint = new ArrayConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).toThrow("Path expression '' evaluated to 55, but expected an array");
    expect(testFunc).toThrow(StatesRuntimeError);
  });
});

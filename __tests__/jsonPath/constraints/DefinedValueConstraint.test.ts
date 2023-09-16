import { DefinedValueConstraint } from '../../../src/stateMachine/jsonPath/constraints/DefinedValueConstraint';
import { StatesRuntimeError } from '../../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('DefinedValueConstraint', () => {
  test('should not throw if passed value is not undefined', () => {
    const value = {};

    const constraint = new DefinedValueConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).not.toThrow();
  });

  test('should throw if passed value is undefined', () => {
    const value = undefined;

    const constraint = new DefinedValueConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).toThrow("Path expression '' does not point to a value");
    expect(testFunc).toThrow(StatesRuntimeError);
  });
});

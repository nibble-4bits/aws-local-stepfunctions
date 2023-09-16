import { StringConstraint } from '../../../src/stateMachine/jsonPath/constraints/StringConstraint';
import { StatesRuntimeError } from '../../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('StringConstraint', () => {
  test('should not throw if passed value is a string', () => {
    const value = 'hello';

    const constraint = new StringConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).not.toThrow();
  });

  test('should throw if passed value is not a string', () => {
    const value = {};

    const constraint = new StringConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).toThrow("Path expression '' evaluated to {}, but expected a string");
    expect(testFunc).toThrow(StatesRuntimeError);
  });
});

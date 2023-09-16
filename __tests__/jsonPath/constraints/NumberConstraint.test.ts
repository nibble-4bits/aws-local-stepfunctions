import { NumberConstraint } from '../../../src/stateMachine/jsonPath/constraints/NumberConstraint';
import { StatesRuntimeError } from '../../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('NumberConstraint', () => {
  test('should not throw if passed value is a number', () => {
    const value = 3.1415926535;

    const constraint = new NumberConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).not.toThrow();
  });

  test('should throw if passed value is not a number', () => {
    const value = 'hello';

    const constraint = new NumberConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).toThrow('Path expression \'\' evaluated to "hello", but expected a number');
    expect(testFunc).toThrow(StatesRuntimeError);
  });
});

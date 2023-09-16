import { StatesRuntimeError } from '../../../src/error/predefined/StatesRuntimeError';
import { BooleanConstraint } from '../../../src/stateMachine/jsonPath/constraints/BooleanConstraint';

afterEach(() => {
  jest.clearAllMocks();
});

describe('BooleanConstraint', () => {
  test('should not throw if passed value is a boolean', () => {
    const value = true;

    const constraint = new BooleanConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).not.toThrow();
  });

  test('should throw if passed value is not a boolean', () => {
    const value = 'hello';

    const constraint = new BooleanConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).toThrow('Path expression \'\' evaluated to "hello", but expected a boolean');
    expect(testFunc).toThrow(StatesRuntimeError);
  });
});

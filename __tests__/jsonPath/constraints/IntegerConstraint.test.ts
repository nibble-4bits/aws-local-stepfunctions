import { IntegerConstraint } from '../../../src/stateMachine/jsonPath/constraints/IntegerConstraint';
import { StatesRuntimeError } from '../../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('IntegerConstraint', () => {
  test('should not throw if passed value is an integer', () => {
    const value = 12345;

    const constraint = new IntegerConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).not.toThrow();
  });

  test('should throw if passed value is not a number', () => {
    const value = 'hello, world!';

    const constraint = new IntegerConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).toThrow('Path expression \'\' evaluated to "hello, world!", but expected an integer');
    expect(testFunc).toThrow(StatesRuntimeError);
  });

  test('should throw if passed value is a number but not an integer', () => {
    const value = 123.45;

    const constraint = new IntegerConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).toThrow("Path expression '' evaluated to 123.45, but expected an integer");
    expect(testFunc).toThrow(StatesRuntimeError);
  });

  describe('IntegerConstraint.greaterThanOrEqual', () => {
    test('should not throw if passed value is greater than the constraint value', () => {
      const value = 12345;

      const GreaterThanOrEqualConstraint = IntegerConstraint.greaterThanOrEqual(12000);
      const constraint = new GreaterThanOrEqualConstraint('');

      const testFunc = () => constraint.test(value);
      expect(testFunc).not.toThrow();
    });

    test('should not throw if passed value is equal to the constraint value', () => {
      const value = 12345;

      const GreaterThanOrEqualConstraint = IntegerConstraint.greaterThanOrEqual(12345);
      const constraint = new GreaterThanOrEqualConstraint('');

      const testFunc = () => constraint.test(value);
      expect(testFunc).not.toThrow();
    });

    test('should throw if passed value is less than the constraint value', () => {
      const value = 8000;

      const GreaterThanOrEqualConstraint = IntegerConstraint.greaterThanOrEqual(12345);
      const constraint = new GreaterThanOrEqualConstraint('');

      const testFunc = () => constraint.test(value);
      expect(testFunc).toThrow("Path expression '' evaluated to 8000, but expected an integer >= 12345");
      expect(testFunc).toThrow(StatesRuntimeError);
    });

    test('should throw if passed value is not an integer', () => {
      const value = 123.45;

      const GreaterThanOrEqualConstraint = IntegerConstraint.greaterThanOrEqual(12345);
      const constraint = new GreaterThanOrEqualConstraint('');

      const testFunc = () => constraint.test(value);
      expect(testFunc).toThrow("Path expression '' evaluated to 123.45, but expected an integer");
      expect(testFunc).toThrow(StatesRuntimeError);
    });
  });
});

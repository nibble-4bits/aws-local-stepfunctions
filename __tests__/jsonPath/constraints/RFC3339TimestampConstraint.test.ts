import { RFC3339TimestampConstraint } from '../../../src/stateMachine/jsonPath/constraints/RFC3339TimestampConstraint';
import { StatesRuntimeError } from '../../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('RFC3339TimestampConstraint', () => {
  test('should not throw if passed value is a timestamp', () => {
    const value = '2023-09-15T20:45:30-06:00';

    const constraint = new RFC3339TimestampConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).not.toThrow();
  });

  test('should throw if passed value is not a string', () => {
    const value = {};

    const constraint = new RFC3339TimestampConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).toThrow(
      "Path expression '' evaluated to {}, but expected a timestamp conforming to the RFC3339 profile"
    );
    expect(testFunc).toThrow(StatesRuntimeError);
  });

  test('should throw if passed value is not a date conforming to the RFC3339 profile', () => {
    const value = 'not a valid timestamp';

    const constraint = new RFC3339TimestampConstraint('');

    const testFunc = () => constraint.test(value);
    expect(testFunc).toThrow(
      'Path expression \'\' evaluated to "not a valid timestamp", but expected a timestamp conforming to the RFC3339 profile'
    );
    expect(testFunc).toThrow(StatesRuntimeError);
  });
});

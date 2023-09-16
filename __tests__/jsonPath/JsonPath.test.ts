import { jsonPathQuery } from '../../src/stateMachine/jsonPath/JsonPath';
import { IntegerConstraint } from '../../src/stateMachine/jsonPath/constraints/IntegerConstraint';

afterEach(() => {
  jest.clearAllMocks();
});

describe('jsonPathQuery', () => {
  const testObject = {
    a: 1,
    b: 2,
    c: [3, 4, 5],
    d: { e: 6 },
  };
  const context = {
    executionId: 'id-12345',
  };

  test('should query `json` parameter if path expression starts with `$`', () => {
    const pathExpression = '$.a';

    const result = jsonPathQuery(pathExpression, testObject, context);
    expect(result).toBe(1);
  });

  test('should query Context Object if path expression starts with `$$`', () => {
    const pathExpression = '$$.executionId';

    const result = jsonPathQuery(pathExpression, testObject, context);
    expect(result).toBe('id-12345');
  });

  describe('constraints', () => {
    test('should return value if path is valid', () => {
      const pathExpression = '$.d.e';

      const result = jsonPathQuery(pathExpression, testObject, context);
      expect(result).toBe(6);
    });

    test('should check default `DefinedValueConstraint` constraint', () => {
      const pathExpression = '$.nonexistent';

      const testFn = () => jsonPathQuery(pathExpression, testObject, context);
      expect(testFn).toThrow("Path expression '$.nonexistent' does not point to a value");
    });

    test('should not check default `DefinedValueConstraint` constraint if `ignoreDefinedValueConstraint` option is true', () => {
      const pathExpression = '$.nonexistent';

      const testFn = () => jsonPathQuery(pathExpression, testObject, context, { ignoreDefinedValueConstraint: true });
      expect(testFn).not.toThrow();
    });

    test('should check for any constraints provided by the caller', () => {
      const pathExpression = '$.c';

      const testFn = () => jsonPathQuery(pathExpression, testObject, context, { constraints: [IntegerConstraint] });
      expect(testFn).toThrow("Path expression '$.c' evaluated to [3,4,5], but expected an integer");
    });
  });
});

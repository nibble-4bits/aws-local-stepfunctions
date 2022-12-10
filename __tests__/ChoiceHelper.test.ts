import type { JSONValue } from '../src/typings/JSONValue';
import { testChoiceRule } from '../src/ChoiceHelper';
import { JSONPath as jp } from 'jsonpath-plus';

afterEach(() => {
  jest.clearAllMocks();
});

describe('ChoiceHelper', () => {
  const jsonQueryMock = jest.fn((pathExpression: string, json: JSONValue) => {
    return jp({ path: pathExpression, json, wrap: false });
  });

  describe('StringEquals', () => {
    test('should return true if string is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringEquals: 'hello' },
        { varValue: 'hello' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is not equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringEquals: 'hello, world' },
        { varValue: 'hello' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('StringEqualsPath', () => {
    test('should return true if string is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringEqualsPath: '$.comparisonValue' },
        { varValue: 'hello', comparisonValue: 'hello' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is not equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringEqualsPath: '$.comparisonValue' },
        { varValue: 'hello', comparisonValue: 'hello, world' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('StringLessThan', () => {
    test('should return true if string is less than operator value', () => {
      const result = testChoiceRule({ Variable: '$.varValue', StringLessThan: 'b' }, { varValue: 'a' }, jsonQueryMock);

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is greater than operator value', () => {
      const result = testChoiceRule({ Variable: '$.varValue', StringLessThan: 'b' }, { varValue: 'c' }, jsonQueryMock);

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is equal to operator value', () => {
      const result = testChoiceRule({ Variable: '$.varValue', StringLessThan: 'b' }, { varValue: 'b' }, jsonQueryMock);

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('StringLessThanPath', () => {
    test('should return true if string is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringLessThanPath: '$.comparisonValue' },
        { varValue: 'a', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringLessThanPath: '$.comparisonValue' },
        { varValue: 'c', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringLessThanPath: '$.comparisonValue' },
        { varValue: 'b', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('StringGreaterThan', () => {
    test('should return true if string is greater than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThan: 'b' },
        { varValue: 'c' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is less than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThan: 'b' },
        { varValue: 'a' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThan: 'b' },
        { varValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('StringGreaterThanPath', () => {
    test('should return true if string is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThanPath: '$.comparisonValue' },
        { varValue: 'c', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThanPath: '$.comparisonValue' },
        { varValue: 'a', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThanPath: '$.comparisonValue' },
        { varValue: 'b', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('StringLessThanEquals', () => {
    test('should return true if string is less than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringLessThanEquals: 'b' },
        { varValue: 'a' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if string is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringLessThanEquals: 'b' },
        { varValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is greater than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringLessThanEquals: 'b' },
        { varValue: 'c' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('StringLessThanEqualsPath', () => {
    test('should return true if string is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringLessThanEqualsPath: '$.comparisonValue' },
        { varValue: 'a', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if string is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringLessThanEqualsPath: '$.comparisonValue' },
        { varValue: 'b', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringLessThanEqualsPath: '$.comparisonValue' },
        { varValue: 'c', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('StringGreaterThanEquals', () => {
    test('should return true if string is greater than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThanEquals: 'b' },
        { varValue: 'c' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if string is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThanEquals: 'b' },
        { varValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is less than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThanEquals: 'b' },
        { varValue: 'a' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('StringGreaterThanEqualsPath', () => {
    test('should return true if string is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThanEqualsPath: '$.comparisonValue' },
        { varValue: 'c', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if string is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThanEqualsPath: '$.comparisonValue' },
        { varValue: 'b', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringGreaterThanEqualsPath: '$.comparisonValue' },
        { varValue: 'a', comparisonValue: 'b' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('StringMatches', () => {
    test('should return true if string matches according to wildcards in operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringMatches: 'foo*.log' },
        { varValue: 'foo23.log' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if string matches according to wildcards in operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringMatches: '*.log' },
        { varValue: 'zebra.log' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if string matches according to wildcards in operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringMatches: 'foo*.*' },
        { varValue: 'foobar.zebra' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string does not match according to wildcards in operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringMatches: 'foo*.log' },
        { varValue: 'fo23.log' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string does not match according to wildcards in operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringMatches: '*.log' },
        { varValue: 'zebra.slog' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string does not match according to wildcards in operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringMatches: 'foo*.*' },
        { varValue: 'fobar.zebra' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if string matches literal string in operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringMatches: 'foobar' },
        { varValue: 'foobar' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if string does not match literal string in operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringMatches: 'foobar' },
        { varValue: 'foo' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if string matches string with escaped wildcard in operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', StringMatches: 'foo\\*bar\\*baz' },
        { varValue: 'foo*bar*baz' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('NumericEquals', () => {
    test('should return true if number is equal to operator value', () => {
      const result = testChoiceRule({ Variable: '$.varValue', NumericEquals: 10 }, { varValue: 10 }, jsonQueryMock);

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is not equal to operator value', () => {
      const result = testChoiceRule({ Variable: '$.varValue', NumericEquals: 50 }, { varValue: 10 }, jsonQueryMock);

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('NumericEqualsPath', () => {
    test('should return true if number is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericEqualsPath: '$.comparisonValue' },
        { varValue: 10, comparisonValue: 10 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is not equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericEqualsPath: '$.comparisonValue' },
        { varValue: 10, comparisonValue: 50 },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('NumericLessThan', () => {
    test('should return true if number is less than operator value', () => {
      const result = testChoiceRule({ Variable: '$.varValue', NumericLessThan: 150 }, { varValue: 100 }, jsonQueryMock);

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is greater than operator value', () => {
      const result = testChoiceRule({ Variable: '$.varValue', NumericLessThan: 150 }, { varValue: 200 }, jsonQueryMock);

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is equal to operator value', () => {
      const result = testChoiceRule({ Variable: '$.varValue', NumericLessThan: 150 }, { varValue: 150 }, jsonQueryMock);

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('NumericLessThanPath', () => {
    test('should return true if number is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericLessThanPath: '$.comparisonValue' },
        { varValue: 100, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericLessThanPath: '$.comparisonValue' },
        { varValue: 200, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericLessThanPath: '$.comparisonValue' },
        { varValue: 150, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('NumericGreaterThan', () => {
    test('should return true if number is greater than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThan: 150 },
        { varValue: 200 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is less than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThan: 150 },
        { varValue: 100 },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThan: 150 },
        { varValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('NumericGreaterThanPath', () => {
    test('should return true if number is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThanPath: '$.comparisonValue' },
        { varValue: 200, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThanPath: '$.comparisonValue' },
        { varValue: 100, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThanPath: '$.comparisonValue' },
        { varValue: 150, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('NumericLessThanEquals', () => {
    test('should return true if number is less than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericLessThanEquals: 150 },
        { varValue: 100 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if number is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericLessThanEquals: 150 },
        { varValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is greater than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericLessThanEquals: 150 },
        { varValue: 200 },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('NumericLessThanEqualsPath', () => {
    test('should return true if number is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericLessThanEqualsPath: '$.comparisonValue' },
        { varValue: 100, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if number is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericLessThanEqualsPath: '$.comparisonValue' },
        { varValue: 150, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericLessThanEqualsPath: '$.comparisonValue' },
        { varValue: 200, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('NumericGreaterThanEquals', () => {
    test('should return true if number is greater than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThanEquals: 150 },
        { varValue: 200 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if number is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThanEquals: 150 },
        { varValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is less than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThanEquals: 150 },
        { varValue: 100 },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('NumericGreaterThanEqualsPath', () => {
    test('should return true if number is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThanEqualsPath: '$.comparisonValue' },
        { varValue: 200, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if number is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThanEqualsPath: '$.comparisonValue' },
        { varValue: 150, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if number is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', NumericGreaterThanEqualsPath: '$.comparisonValue' },
        { varValue: 100, comparisonValue: 150 },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('BooleanEquals', () => {
    test('should return true if boolean is equal to operator value', () => {
      const result = testChoiceRule({ Variable: '$.varValue', BooleanEquals: true }, { varValue: true }, jsonQueryMock);

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if boolean is not equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', BooleanEquals: true },
        { varValue: false },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('BooleanEqualsPath', () => {
    test('should return true if boolean is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', BooleanEqualsPath: '$.comparisonValue' },
        { varValue: false, comparisonValue: false },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if boolean is not equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', BooleanEqualsPath: '$.comparisonValue' },
        { varValue: true, comparisonValue: false },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('TimestampEquals', () => {
    test('should return true if timestamp is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampEquals: '2020-01-01T15:00:00Z' },
        { varValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is not equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampEquals: '2020-01-01T15:00:00Z' },
        { varValue: '2020-12-12T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('TimestampEqualsPath', () => {
    test('should return true if timestamp is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampEqualsPath: '$.comparisonValue' },
        { varValue: '2020-01-01T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is not equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampEqualsPath: '$.comparisonValue' },
        { varValue: '2020-12-12T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('TimestampLessThan', () => {
    test('should return true if timestamp is less than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThan: '2020-01-01T15:00:00Z' },
        { varValue: '2019-12-31T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is greater than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThan: '2020-01-01T15:00:00Z' },
        { varValue: '2020-12-12T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThan: '2020-01-01T15:00:00Z' },
        { varValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('TimestampLessThanPath', () => {
    test('should return true if timestamp is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThanPath: '$.comparisonValue' },
        { varValue: '2019-12-31T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThanPath: '$.comparisonValue' },
        { varValue: '2020-12-12T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThanPath: '$.comparisonValue' },
        { varValue: '2020-01-01T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('TimestampGreaterThan', () => {
    test('should return true if timestamp is greater than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThan: '2020-01-01T15:00:00Z' },
        { varValue: '2020-12-12T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is less than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThan: '2020-01-01T15:00:00Z' },
        { varValue: '2019-12-31T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThan: '2020-01-01T15:00:00Z' },
        { varValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('TimestampGreaterThanPath', () => {
    test('should return true if timestamp is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThanPath: '$.comparisonValue' },
        { varValue: '2020-12-12T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThanPath: '$.comparisonValue' },
        { varValue: '2019-12-3101T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThanPath: '$.comparisonValue' },
        { varValue: '2020-01-01T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('TimestampLessThanEquals', () => {
    test('should return true if timestamp is less than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThanEquals: '2020-01-01T15:00:00Z' },
        { varValue: '2019-12-31T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if timestamp is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThanEquals: '2020-01-01T15:00:00Z' },
        { varValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is greater than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThanEquals: '2020-01-01T15:00:00Z' },
        { varValue: '2020-12-12T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('TimestampLessThanEqualsPath', () => {
    test('should return true if timestamp is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThanEqualsPath: '$.comparisonValue' },
        { varValue: '2019-12-31T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if timestamp is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThanEqualsPath: '$.comparisonValue' },
        { varValue: '2020-01-01T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampLessThanEqualsPath: '$.comparisonValue' },
        { varValue: '2020-12-12T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('TimestampGreaterThanEquals', () => {
    test('should return true if timestamp is greater than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThanEquals: '2020-01-01T15:00:00Z' },
        { varValue: '2020-12-12T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if timestamp is equal to operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThanEquals: '2020-01-01T15:00:00Z' },
        { varValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is less than operator value', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThanEquals: '2020-01-01T15:00:00Z' },
        { varValue: '2019-12-31T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('TimestampGreaterThanEqualsPath', () => {
    test('should return true if timestamp is greater than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThanEqualsPath: '$.comparisonValue' },
        { varValue: '2020-12-12T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if timestamp is equal to value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThanEqualsPath: '$.comparisonValue' },
        { varValue: '2020-01-01T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if timestamp is less than value specified in operator path', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', TimestampGreaterThanEqualsPath: '$.comparisonValue' },
        { varValue: '2019-12-31T15:00:00Z', comparisonValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('IsNull', () => {
    test('should return true if variable is null', () => {
      const result = testChoiceRule({ Variable: '$.varValue', IsNull: true }, { varValue: null }, jsonQueryMock);

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if variable is not null', () => {
      const result = testChoiceRule({ Variable: '$.varValue', IsNull: true }, { varValue: 12345 }, jsonQueryMock);

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('IsPresent', () => {
    test('should return true if variable exists', () => {
      const result = testChoiceRule({ Variable: '$.varValue', IsPresent: true }, { varValue: 12345 }, jsonQueryMock);

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if variable does not exist', () => {
      const result = testChoiceRule({ Variable: '$.varValue', IsPresent: true }, {}, jsonQueryMock);

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('IsNumeric', () => {
    test('should return true if variable is numeric', () => {
      const result = testChoiceRule({ Variable: '$.varValue', IsNumeric: true }, { varValue: 12345 }, jsonQueryMock);

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if variable is not numeric', () => {
      const result = testChoiceRule({ Variable: '$.varValue', IsNumeric: true }, { varValue: '12345' }, jsonQueryMock);

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('IsString', () => {
    test('should return true if variable is string', () => {
      const result = testChoiceRule({ Variable: '$.varValue', IsString: true }, { varValue: '12345' }, jsonQueryMock);

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if variable is not string', () => {
      const result = testChoiceRule({ Variable: '$.varValue', IsString: true }, { varValue: 12345 }, jsonQueryMock);

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('IsBoolean', () => {
    test('should return true if variable is true', () => {
      const result = testChoiceRule({ Variable: '$.varValue', IsBoolean: true }, { varValue: true }, jsonQueryMock);

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if variable is false', () => {
      const result = testChoiceRule({ Variable: '$.varValue', IsBoolean: true }, { varValue: false }, jsonQueryMock);

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if variable is not boolean', () => {
      const result = testChoiceRule({ Variable: '$.varValue', IsBoolean: true }, { varValue: 12345 }, jsonQueryMock);

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });

  describe('IsTimestamp', () => {
    test('should return true if variable is timestamp', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', IsTimestamp: true },
        { varValue: '2020-01-01T15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if variable is timestamp with positive numeric timezone offset', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', IsTimestamp: true },
        { varValue: '2020-01-01T15:00:00+06:00' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return true if variable is timestamp with negative numeric timezone offset', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', IsTimestamp: true },
        { varValue: '2020-01-01T15:00:00-06:00' },
        jsonQueryMock
      );

      expect(result).toBe(true);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if variable is timestamp but does not contain "T" character to separate date and time', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', IsTimestamp: true },
        { varValue: '2020-01-01 15:00:00Z' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if variable is timestamp but does not contain "Z" character to denote absence of numeric timezone offset', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', IsTimestamp: true },
        { varValue: '2020-01-01T15:00:00' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });

    test('should return false if variable is not timestamp', () => {
      const result = testChoiceRule(
        { Variable: '$.varValue', IsTimestamp: true },
        { varValue: 'hello' },
        jsonQueryMock
      );

      expect(result).toBe(false);
      expect(jsonQueryMock).toHaveBeenCalled();
    });
  });
});

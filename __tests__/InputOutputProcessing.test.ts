import { StatesResultPathMatchFailureError } from '../src/error/predefined/StatesResultPathMatchFailureError';
import {
  processInputPath,
  processOutputPath,
  processPayloadTemplate,
  processResultPath,
} from '../src/stateMachine/InputOutputProcessing';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Input processing', () => {
  describe('InputPath', () => {
    test('should return input unmodified if `InputPath` is not specified', () => {
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processInputPath(undefined, input, context);

      expect(result).toEqual(input);
    });

    test('should only return selected portion of the input based on `InputPath`', () => {
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processInputPath('$.movies', input, context);

      expect(result).toEqual([
        {
          director: 'Quentin Tarantino',
          title: 'Reservoir Dogs',
          year: 1992,
        },
        {
          director: 'Brian De Palma',
          title: 'Mission: Impossible',
          year: 1996,
        },
      ]);
    });

    test('should return empty object if `InputPath` is set to null', () => {
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processInputPath(null, input, context);

      expect(result).toEqual({});
    });
  });

  describe('Parameters', () => {
    test('should return `Parameters` payload unmodified if no field ends with a `.$` suffix', () => {
      const parameters = {
        field1: 50,
        field2: 'value',
        field3: false,
        field4: {
          field5: 123.5,
          field6: [1, 2, 3],
        },
      };
      const input = {};
      const context = {};

      const result = processPayloadTemplate(parameters, input, context);

      expect(result).toEqual({
        field1: 50,
        field2: 'value',
        field3: false,
        field4: {
          field5: 123.5,
          field6: [1, 2, 3],
        },
      });
    });

    test('should return `Parameters` payload with values replaced according to path fields', () => {
      const parameters = {
        field1: 50,
        'field2.$': '$.movies[0].director',
        field3: false,
        field4: {
          'field5.$': '$.metadata',
          field6: [1, 2, 3],
        },
      };
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processPayloadTemplate(parameters, input, context);

      expect(result).toEqual({
        field1: 50,
        field2: 'Quentin Tarantino',
        field3: false,
        field4: {
          field5: {
            lastUpdated: '2020-05-27T08:00:00Z',
          },
          field6: [1, 2, 3],
        },
      });
    });

    test('should return `Parameters` payload with values replaced according to intrinsic functions', () => {
      const parameters = {
        field1: 50,
        'field2.$': "States.Array(1, 'hello', true, false, null, $.movies[1], $.metadata.lastUpdated)",
        field3: false,
        field4: {
          'field5.$': 'States.ArrayPartition(States.ArrayRange(1, 20, 1), 4)',
          field6: [1, 2, 3],
        },
      };
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processPayloadTemplate(parameters, input, context);

      expect(result).toEqual({
        field1: 50,
        field2: [
          1,
          'hello',
          true,
          false,
          null,
          { director: 'Brian De Palma', title: 'Mission: Impossible', year: 1996 },
          '2020-05-27T08:00:00Z',
        ],
        field3: false,
        field4: {
          field5: [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
            [17, 18, 19, 20],
          ],
          field6: [1, 2, 3],
        },
      });
    });

    test('should return `Parameters` payload with path values unmodified if field name does not end with `.$` suffix', () => {
      const parameters = {
        field1: 50,
        field2: '$.movies[0].director',
        field3: false,
        field4: {
          field5: '$.metadata',
          field6: [1, 2, 3],
        },
      };
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processPayloadTemplate(parameters, input, context);

      expect(result).toEqual({
        field1: 50,
        field2: '$.movies[0].director',
        field3: false,
        field4: {
          field5: '$.metadata',
          field6: [1, 2, 3],
        },
      });
    });

    // TODO: Add test to assert field value is valid JSONPath when field name ends with `.$` suffix.
    // For instance: { 'path.$': 'movies' } would not be a valid JSONPath, as the value doesn't begin with `$.`
  });
});

describe('Output processing', () => {
  describe('ResultSelector', () => {
    test('should return `ResultSelector` payload unmodified if no field ends with a `.$` suffix', () => {
      const resultSelector = {
        field1: 50,
        field2: 'value',
        field3: false,
        field4: {
          field5: 123.5,
          field6: [1, 2, 3],
        },
      };
      const input = {};
      const context = {};

      const result = processPayloadTemplate(resultSelector, input, context);

      expect(result).toEqual({
        field1: 50,
        field2: 'value',
        field3: false,
        field4: {
          field5: 123.5,
          field6: [1, 2, 3],
        },
      });
    });

    test('should return `ResultSelector` payload with values replaced according to path fields', () => {
      const resultSelector = {
        field1: 50,
        'field2.$': '$.movies[0].director',
        field3: false,
        field4: {
          'field5.$': '$.metadata',
          field6: [1, 2, 3],
        },
      };
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processPayloadTemplate(resultSelector, input, context);

      expect(result).toEqual({
        field1: 50,
        field2: 'Quentin Tarantino',
        field3: false,
        field4: {
          field5: {
            lastUpdated: '2020-05-27T08:00:00Z',
          },
          field6: [1, 2, 3],
        },
      });
    });

    test('should return `ResultSelector` payload with values replaced according to intrinsic functions', () => {
      const resultSelector = {
        field1: 50,
        'field2.$': "States.Array(1, 'hello', true, false, null, $.movies[1], $.metadata.lastUpdated)",
        field3: false,
        field4: {
          'field5.$': 'States.ArrayPartition(States.ArrayRange(1, 20, 1), 4)',
          field6: [1, 2, 3],
        },
      };
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processPayloadTemplate(resultSelector, input, context);

      expect(result).toEqual({
        field1: 50,
        field2: [
          1,
          'hello',
          true,
          false,
          null,
          { director: 'Brian De Palma', title: 'Mission: Impossible', year: 1996 },
          '2020-05-27T08:00:00Z',
        ],
        field3: false,
        field4: {
          field5: [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
            [17, 18, 19, 20],
          ],
          field6: [1, 2, 3],
        },
      });
    });

    test('should return `ResultSelector` payload with path values unmodified if field name does not end with `.$` suffix', () => {
      const resultSelector = {
        field1: 50,
        field2: '$.movies[0].director',
        field3: false,
        field4: {
          field5: '$.metadata',
          field6: [1, 2, 3],
        },
      };
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processPayloadTemplate(resultSelector, input, context);

      expect(result).toEqual({
        field1: 50,
        field2: '$.movies[0].director',
        field3: false,
        field4: {
          field5: '$.metadata',
          field6: [1, 2, 3],
        },
      });
    });

    // TODO: Add test to assert field value is valid JSONPath when field name ends with `.$` suffix.
    // For instance: { 'path.$': 'movies' } would not be a valid JSONPath, as the value doesn't begin with `$.`
  });

  describe('ResultPath', () => {
    test('should return result unmodified if `ResultPath` is not specified', () => {
      const input = {};
      const result = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };

      const processedResult = processResultPath(undefined, input, result);

      expect(processedResult).toEqual({
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      });
    });

    test("should return concatenation of state's raw input with current result based on `ResultPath`", () => {
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const result = 10;

      const processedResult = processResultPath('$.a.b.c.concatenatedResult', input, result);

      expect(processedResult).toEqual({
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
        a: { b: { c: { concatenatedResult: 10 } } },
      });
    });

    test("should return state's raw input with overwritten field if `ResultPath` references existing field in raw input", () => {
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const result = 10;

      const processedResult = processResultPath('$.movies', input, result);

      expect(processedResult).toEqual({
        movies: 10,
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      });
    });

    test("should return state's raw input if `ResultPath` is set to null", () => {
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };

      const processedResult = processResultPath(null, input, {});

      expect(processedResult).toEqual({
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      });
    });

    test('should throw `StatesResultPathMatchFailureError` if raw input is not a plain object', () => {
      const input = 'not a plain object';
      const result = 10;

      function processResultPathWrapper() {
        processResultPath('$.path', input, result);
      }

      expect(processResultPathWrapper).toThrow(StatesResultPathMatchFailureError);
    });
  });

  describe('OutputPath', () => {
    test('should return result unmodified if `OutputPath` is not specified', () => {
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processOutputPath(undefined, input, context);

      expect(result).toEqual(input);
    });

    test('should only return selected portion of the result based on `OutputPath`', () => {
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processOutputPath('$.movies', input, context);

      expect(result).toEqual([
        {
          director: 'Quentin Tarantino',
          title: 'Reservoir Dogs',
          year: 1992,
        },
        {
          director: 'Brian De Palma',
          title: 'Mission: Impossible',
          year: 1996,
        },
      ]);
    });

    test('should return empty object if `OutputPath` is set to null', () => {
      const input = {
        movies: [
          {
            director: 'Quentin Tarantino',
            title: 'Reservoir Dogs',
            year: 1992,
          },
          {
            director: 'Brian De Palma',
            title: 'Mission: Impossible',
            year: 1996,
          },
        ],
        metadata: {
          lastUpdated: '2020-05-27T08:00:00Z',
        },
      };
      const context = {};

      const result = processOutputPath(null, input, context);

      expect(result).toEqual({});
    });
  });
});

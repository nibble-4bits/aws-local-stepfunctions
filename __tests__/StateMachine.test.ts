import type { StateMachineDefinition } from '../src/typings/StateMachineDefinition';
import { StateMachine } from '../src/StateMachine';
import { LambdaClient } from '../src/aws/LambdaClient';
import * as ChoiceHelperModule from '../src/ChoiceHelper';
import * as utilModule from '../src/util';

afterEach(() => {
  jest.clearAllMocks();
});

describe('State Machine', () => {
  describe('Input processing', () => {
    describe('InputPath', () => {
      test('should return input unmodified if `InputPath` is not specified', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              End: true,
            },
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

        const processInputPathSpy = jest.spyOn(StateMachine.prototype as any, 'processInputPath');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processInputPathSpy).toHaveReturnedWith({
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

      test('should only return selected portion of the input based on `InputPath`', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              InputPath: '$.movies',
              End: true,
            },
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

        const processInputPathSpy = jest.spyOn(StateMachine.prototype as any, 'processInputPath');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processInputPathSpy).toHaveReturnedWith([
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

      test('should return empty object if `InputPath` is set to null', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              InputPath: null,
              End: true,
            },
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

        const processInputPathSpy = jest.spyOn(StateMachine.prototype as any, 'processInputPath');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processInputPathSpy).toHaveReturnedWith({});
      });
    });

    describe('Parameters', () => {
      test('should return `Parameters` payload unmodified if no field ends with a `.$` suffix', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              Parameters: {
                field1: 50,
                field2: 'value',
                field3: false,
                field4: {
                  field5: 123.5,
                  field6: [1, 2, 3],
                },
              },
              End: true,
            },
          },
        };
        const input = {};

        const processPayloadTemplateSpy = jest.spyOn(StateMachine.prototype as any, 'processPayloadTemplate');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processPayloadTemplateSpy).toHaveReturnedWith({
          field1: 50,
          field2: 'value',
          field3: false,
          field4: {
            field5: 123.5,
            field6: [1, 2, 3],
          },
        });
      });

      test('should return `Parameters` payload with values replaced according to path fields', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              Parameters: {
                field1: 50,
                'field2.$': '$.movies[0].director',
                field3: false,
                field4: {
                  'field5.$': '$.metadata',
                  field6: [1, 2, 3],
                },
              },
              End: true,
            },
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

        const processPayloadTemplateSpy = jest.spyOn(StateMachine.prototype as any, 'processPayloadTemplate');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processPayloadTemplateSpy).toHaveReturnedWith({
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

      test('should return `Parameters` payload with path values unmodified if field name does not end with `.$` suffix', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              Parameters: {
                field1: 50,
                field2: '$.movies[0].director',
                field3: false,
                field4: {
                  field5: '$.metadata',
                  field6: [1, 2, 3],
                },
              },
              End: true,
            },
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

        const processPayloadTemplateSpy = jest.spyOn(StateMachine.prototype as any, 'processPayloadTemplate');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processPayloadTemplateSpy).toHaveReturnedWith({
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
      const mockInvokeFunction = jest.fn();

      beforeEach(() => {
        jest.spyOn(LambdaClient.prototype, 'invokeFunction').mockImplementation(mockInvokeFunction);
      });

      test('should return `ResultSelector` payload unmodified if no field ends with a `.$` suffix', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'TaskState',
          States: {
            TaskState: {
              Type: 'Task',
              ResultSelector: {
                field1: 50,
                field2: 'value',
                field3: false,
                field4: {
                  field5: 123.5,
                  field6: [1, 2, 3],
                },
              },
              Resource: 'mock-arn',
              End: true,
            },
          },
        };
        const input = {};

        const processPayloadTemplateSpy = jest.spyOn(StateMachine.prototype as any, 'processPayloadTemplate');
        const stateMachine = new StateMachine(definition, { checkArn: false });
        await stateMachine.run(input);

        expect(processPayloadTemplateSpy).toHaveReturnedWith({
          field1: 50,
          field2: 'value',
          field3: false,
          field4: {
            field5: 123.5,
            field6: [1, 2, 3],
          },
        });
      });

      test('should return `ResultSelector` payload with values replaced according to path fields', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'TaskState',
          States: {
            TaskState: {
              Type: 'Task',
              ResultSelector: {
                field1: 50,
                'field2.$': '$.result1',
                field3: false,
                field4: {
                  'field5.$': '$.result2',
                  field6: [1, 2, 3],
                },
              },
              Resource: 'mock-arn',
              End: true,
            },
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

        const processPayloadTemplateSpy = jest.spyOn(StateMachine.prototype as any, 'processPayloadTemplate');
        mockInvokeFunction.mockReturnValue({ result1: 'hello', result2: { values: ['a', 'b', 'c'] } });
        const stateMachine = new StateMachine(definition, { checkArn: false });
        await stateMachine.run(input);

        expect(processPayloadTemplateSpy).toHaveReturnedWith({
          field1: 50,
          field2: 'hello',
          field3: false,
          field4: {
            field5: { values: ['a', 'b', 'c'] },
            field6: [1, 2, 3],
          },
        });
      });

      test('should return `ResultSelector` payload with path values unmodified if field name does not end with `.$` suffix', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'TaskState',
          States: {
            TaskState: {
              Type: 'Task',
              ResultSelector: {
                field1: 50,
                field2: '$.movies[0].director',
                field3: false,
                field4: {
                  field5: '$.metadata',
                  field6: [1, 2, 3],
                },
              },
              Resource: 'mock-arn',
              End: true,
            },
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

        const processPayloadTemplateSpy = jest.spyOn(StateMachine.prototype as any, 'processPayloadTemplate');
        const stateMachine = new StateMachine(definition, { checkArn: false });
        await stateMachine.run(input);

        expect(processPayloadTemplateSpy).toHaveReturnedWith({
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
      test('should return result unmodified if `ResultPath` is not specified', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              End: true,
            },
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

        const processResultPathSpy = jest.spyOn(StateMachine.prototype as any, 'processResultPath');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processResultPathSpy).toHaveReturnedWith({
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

      test("should return concatenation of state's raw input with current result based on `ResultPath`", async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              Result: 10,
              ResultPath: '$.a.b.c.concatenatedResult',
              End: true,
            },
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

        const processResultPathSpy = jest.spyOn(StateMachine.prototype as any, 'processResultPath');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processResultPathSpy).toHaveReturnedWith({
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

      test("should return state's raw input with overwritten field if `ResultPath` references existing field in raw input", async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              Result: 10,
              ResultPath: '$.movies',
              End: true,
            },
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

        const processResultPathSpy = jest.spyOn(StateMachine.prototype as any, 'processResultPath');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processResultPathSpy).toHaveReturnedWith({
          movies: 10,
          metadata: {
            lastUpdated: '2020-05-27T08:00:00Z',
          },
        });
      });

      test("should return state's raw input if `ResultPath` is set to null", async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              ResultPath: null,
              End: true,
            },
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

        const processResultPathSpy = jest.spyOn(StateMachine.prototype as any, 'processResultPath');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processResultPathSpy).toHaveReturnedWith({
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
    });

    describe('OutputPath', () => {
      test('should return result unmodified if `OutputPath` is not specified', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              End: true,
            },
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

        const processOutputPathSpy = jest.spyOn(StateMachine.prototype as any, 'processOutputPath');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processOutputPathSpy).toHaveReturnedWith({
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

      test('should only return selected portion of the result based on `OutputPath`', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              OutputPath: '$.movies',
              End: true,
            },
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

        const processOutputPathSpy = jest.spyOn(StateMachine.prototype as any, 'processOutputPath');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processOutputPathSpy).toHaveReturnedWith([
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

      test('should return empty object if `OutputPath` is set to null', async () => {
        const definition: StateMachineDefinition = {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              OutputPath: null,
              End: true,
            },
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

        const processOutputPathSpy = jest.spyOn(StateMachine.prototype as any, 'processOutputPath');
        const stateMachine = new StateMachine(definition);
        await stateMachine.run(input);

        expect(processOutputPathSpy).toHaveReturnedWith({});
      });
    });
  });

  describe('Task State', () => {
    const mockInvokeFunction = jest.fn();

    beforeEach(() => {
      jest.spyOn(LambdaClient.prototype, 'invokeFunction').mockImplementation(mockInvokeFunction);
    });

    test('should invoke Lambda function specified in `Resource` field', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'TaskState',
        States: {
          TaskState: {
            Type: 'Task',
            Resource: 'mock-arn',
            End: true,
          },
        },
      };
      const input = { input1: 'input string', input2: 10 };

      const stateMachine = new StateMachine(definition, { checkArn: false });
      await stateMachine.run(input);

      expect(mockInvokeFunction).toHaveBeenCalledWith('mock-arn', { input1: 'input string', input2: 10 });
    });

    test('should return result from invoked Lambda function', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'TaskState',
        States: {
          TaskState: {
            Type: 'Task',
            Resource: 'mock-arn',
            End: true,
          },
        },
      };
      const input = { num1: 5, num2: 3 };

      mockInvokeFunction.mockReturnValue(input.num1 + input.num2);
      const stateMachine = new StateMachine(definition, { checkArn: false });
      const result = await stateMachine.run(input);

      expect(mockInvokeFunction).toHaveBeenCalledWith('mock-arn', { num1: 5, num2: 3 });
      expect(result).toBe(8);
    });

    test('should call function specified in local handler override option instead of invoking Lambda function', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'TaskState',
        States: {
          TaskState: {
            Type: 'Task',
            Resource: 'mock-arn',
            End: true,
          },
        },
      };
      const input = { num1: 5, num2: 3 };

      const localHandlerFn = jest.fn((event) => event.num1 + event.num2);
      const stateMachine = new StateMachine(definition, { checkArn: false });
      const result = await stateMachine.run(input, {
        overrides: {
          taskResourceLocalHandler: {
            TaskState: localHandlerFn,
          },
        },
      });

      expect(localHandlerFn).toHaveBeenCalledWith(input);
      expect(mockInvokeFunction).not.toHaveBeenCalled();
      expect(result).toBe(8);
    });
  });

  describe('Map State', () => {
    test('should iterate over the array referenced by `ItemsPath`', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'MapState',
        States: {
          MapState: {
            Type: 'Map',
            Iterator: {
              StartAt: 'EntryIterationState',
              States: {
                EntryIterationState: {
                  Type: 'Succeed',
                },
              },
            },
            ItemsPath: '$.items',
            End: true,
          },
        },
      };
      const input = {
        items: [
          { num1: 5, num2: 3 },
          { num1: 2, num2: 6 },
          { num1: 7, num2: 4 },
        ],
      };

      const jsonQuerySpy = jest.spyOn(StateMachine.prototype as any, 'jsonQuery');
      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(jsonQuerySpy).toHaveBeenCalledWith('$.items', {
        items: [
          { num1: 5, num2: 3 },
          { num1: 2, num2: 6 },
          { num1: 7, num2: 4 },
        ],
      });
      expect(jsonQuerySpy).toHaveReturnedWith([
        { num1: 5, num2: 3 },
        { num1: 2, num2: 6 },
        { num1: 7, num2: 4 },
      ]);
      expect(result).toHaveLength(3);
    });

    test('should iterate over current input if `ItemsPath` is not specified', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'MapState',
        States: {
          MapState: {
            Type: 'Map',
            Iterator: {
              StartAt: 'EntryIterationState',
              States: {
                EntryIterationState: {
                  Type: 'Succeed',
                },
              },
            },
            End: true,
          },
        },
      };
      const input = [
        { num1: 5, num2: 3 },
        { num1: 2, num2: 6 },
        { num1: 7, num2: 4 },
      ];

      const jsonQuerySpy = jest.spyOn(StateMachine.prototype as any, 'jsonQuery');
      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(jsonQuerySpy).not.toHaveBeenCalled();
      expect(result).toHaveLength(3);
    });

    test('should process `Parameters` field if specified', async () => {
      const stateMachineDefinition: StateMachineDefinition = {
        StartAt: 'MapState',
        States: {
          MapState: {
            Type: 'Map',
            Iterator: {
              StartAt: 'EntryIterationState',
              States: {
                EntryIterationState: {
                  Type: 'Succeed',
                },
              },
            },
            ItemsPath: '$.items',
            Parameters: {
              'pair.$': '$$.Map.Item.Value',
              'index.$': '$$.Map.Item.Index',
            },
            End: true,
          },
        },
      };
      const input = {
        items: [
          { num1: 5, num2: 3 },
          { num1: 2, num2: 6 },
          { num1: 7, num2: 4 },
        ],
      };

      const processPayloadTemplateSpy = jest.spyOn(StateMachine.prototype as any, 'processPayloadTemplate');
      const stateMachine = new StateMachine(stateMachineDefinition);
      const result = await stateMachine.run(input);

      expect(processPayloadTemplateSpy).toHaveBeenCalledWith(
        { 'pair.$': '$$.Map.Item.Value', 'index.$': '$$.Map.Item.Index' },
        {
          items: [
            { num1: 5, num2: 3 },
            { num1: 2, num2: 6 },
            { num1: 7, num2: 4 },
          ],
        }
      );
      expect(processPayloadTemplateSpy).toHaveBeenCalledTimes(3);
      expect(processPayloadTemplateSpy).toHaveNthReturnedWith(1, {
        pair: { num1: 5, num2: 3 },
        index: 0,
      });
      expect(processPayloadTemplateSpy).toHaveNthReturnedWith(2, {
        pair: { num1: 2, num2: 6 },
        index: 1,
      });
      expect(processPayloadTemplateSpy).toHaveNthReturnedWith(3, {
        pair: { num1: 7, num2: 4 },
        index: 2,
      });
      expect(result).toHaveLength(3);
    });
  });

  describe('Pass State', () => {
    test('should return initial input as result if neither `Result` nor `ResultPath` are specified', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            End: true,
          },
        },
      };
      const input = {
        prop1: 'test',
        prop2: 12345,
      };

      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(result).toEqual({
        prop1: 'test',
        prop2: 12345,
      });
    });

    test('should return value of `Result` as result if `ResultPath` is not specified', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            Result: {
              result1: 'result1',
              result2: 67890,
            },
            End: true,
          },
        },
      };
      const input = {
        prop1: 'test',
        prop2: 12345,
      };

      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(result).toEqual({
        result1: 'result1',
        result2: 67890,
      });
    });

    test('should return concatenation of initial input with itself if `ResultPath` is specified but `Result` is not specified', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            ResultPath: '$.concatenated',
            End: true,
          },
        },
      };
      const input = {
        prop1: 'test',
        prop2: 12345,
      };

      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(result).toEqual({
        prop1: 'test',
        prop2: 12345,
        concatenated: {
          prop1: 'test',
          prop2: 12345,
        },
      });
    });

    test('should return concatenation of initial input with `Result` if `ResultPath` is specified', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            ResultPath: '$.concatenated',
            Result: {
              result1: 'result1',
              result2: 67890,
            },
            End: true,
          },
        },
      };
      const input = {
        prop1: 'test',
        prop2: 12345,
      };

      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(result).toEqual({
        prop1: 'test',
        prop2: 12345,
        concatenated: {
          result1: 'result1',
          result2: 67890,
        },
      });
    });
  });

  describe('Wait State', () => {
    const mockSleepFunction = jest.fn();
    const mockDateNowFunction = jest.fn(() => 1670198400000); // 2022-12-05T00:00:00Z

    beforeEach(() => {
      jest.spyOn(utilModule, 'sleep').mockImplementation(mockSleepFunction);
      jest.spyOn(Date, 'now').mockImplementation(mockDateNowFunction);
    });

    test('should pause execution for the amount of seconds specified in the `Seconds` field', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'WaitState',
        States: {
          WaitState: {
            Type: 'Wait',
            Seconds: 10,
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(definition);
      await stateMachine.run(input);

      expect(mockSleepFunction).toHaveBeenCalledWith(10000);
    });

    test('should pause execution until time in `Timestamp` field is reached', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'WaitState',
        States: {
          WaitState: {
            Type: 'Wait',
            Timestamp: '2022-12-05T05:45:00Z',
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(definition);
      await stateMachine.run(input);

      expect(mockSleepFunction).toHaveBeenCalledWith(20700000);
    });

    test('should pause execution for the amount of seconds specified in the field referenced by `SecondsPath`', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            Parameters: { waitFor: 10 },
            Next: 'WaitState',
          },
          WaitState: {
            Type: 'Wait',
            SecondsPath: '$.waitFor',
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(definition);
      await stateMachine.run(input);

      expect(mockSleepFunction).toHaveBeenCalledWith(10000);
    });

    test('should pause execution until time specified in the field referenced by `TimestampPath` is reached', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            Parameters: { waitUntil: '2022-12-05T05:45:00Z' },
            Next: 'WaitState',
          },
          WaitState: {
            Type: 'Wait',
            TimestampPath: '$.waitUntil',
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(definition);
      await stateMachine.run(input);

      expect(mockSleepFunction).toHaveBeenCalledWith(20700000);
    });
  });

  describe('Choice State', () => {
    test('should transition to state that matches choice rule', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'ChoiceState',
        States: {
          ChoiceState: {
            Type: 'Choice',
            Choices: [
              {
                Variable: '$.testNumberValue',
                NumericEquals: 20,
                Next: 'FailState',
              },
              {
                Variable: '$.testStringValue',
                StringEquals: 'test',
                Next: 'MatchingChoice',
              },
              {
                Variable: '$.testBooleanValue',
                BooleanEquals: false,
                Next: 'FailState',
              },
            ],
            Default: 'FailState',
          },
          FailState: {
            Type: 'Fail',
          },
          MatchingChoice: {
            Type: 'Pass',
            Result: {
              matchingChoiceResult: 'in matching choice state',
            },
            End: true,
          },
        },
      };
      const input = { testNumberValue: 50, testStringValue: 'test', testBooleanValue: true };

      const testChoiceRuleSpy = jest.spyOn(ChoiceHelperModule, 'testChoiceRule');
      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(testChoiceRuleSpy).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        matchingChoiceResult: 'in matching choice state',
      });
    });

    test('should transition to state specified in `Default` if none of the choices match', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'ChoiceState',
        States: {
          ChoiceState: {
            Type: 'Choice',
            Choices: [
              {
                Variable: '$.testNumberValue',
                NumericEquals: 20,
                Next: 'FailState',
              },
              {
                Variable: '$.testStringValue',
                StringEquals: 'not test',
                Next: 'FailState',
              },
            ],
            Default: 'DefaultChoice',
          },
          FailState: {
            Type: 'Fail',
          },
          DefaultChoice: {
            Type: 'Pass',
            Result: {
              defaultChoiceResult: 'in default choice state',
            },
            End: true,
          },
        },
      };
      const input = { testNumberValue: 50, testStringValue: 'test' };

      const testChoiceRuleSpy = jest.spyOn(ChoiceHelperModule, 'testChoiceRule');
      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(testChoiceRuleSpy).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        defaultChoiceResult: 'in default choice state',
      });
    });
  });

  describe('Succeed State', () => {
    // Placeholder for Succeed state tests
  });

  describe('Fail State', () => {
    // Placeholder for Fail state tests
  });
});

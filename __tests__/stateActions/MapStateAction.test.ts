import type { MapState } from '../../src/typings/MapState';
import { MapStateAction } from '../../src/stateMachine/stateActions/MapStateAction';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';
import { EventLogger } from '../../src/stateMachine/EventLogger';

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('Map State', () => {
  test('should iterate over the array referenced by `ItemsPath`', async () => {
    const definition: MapState = {
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
    };
    const stateName = 'MapState';
    const input = {
      items: [
        { num1: 5, num2: 3 },
        { num1: 2, num2: 6 },
        { num1: 7, num2: 4 },
      ],
    };
    const context = {};
    const options = {
      stateMachineOptions: undefined,
      runOptions: undefined,
      eventLogger: new EventLogger(),
      rawInput: {},
    };

    const mapStateAction = new MapStateAction(definition, stateName);
    const { stateResult } = await mapStateAction.execute(input, context, options);

    expect(stateResult).toHaveLength(3);
    expect(stateResult).toEqual([
      { num1: 5, num2: 3 },
      { num1: 2, num2: 6 },
      { num1: 7, num2: 4 },
    ]);
  });

  test('should iterate over current input if `ItemsPath` is not specified', async () => {
    const definition: MapState = {
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
    };
    const stateName = 'MapState';
    const input = [
      { num1: 5, num2: 3 },
      { num1: 2, num2: 6 },
      { num1: 7, num2: 4 },
    ];
    const context = {};
    const options = {
      stateMachineOptions: undefined,
      runOptions: undefined,
      eventLogger: new EventLogger(),
      rawInput: {},
    };

    const mapStateAction = new MapStateAction(definition, stateName);
    const { stateResult } = await mapStateAction.execute(input, context, options);

    expect(stateResult).toHaveLength(3);
    expect(stateResult).toEqual([
      { num1: 5, num2: 3 },
      { num1: 2, num2: 6 },
      { num1: 7, num2: 4 },
    ]);
  });

  test('should execute action if using `ItemProcessor` field, which is equivalent to `Iterator`', async () => {
    const definition: MapState = {
      Type: 'Map',
      ItemProcessor: {
        StartAt: 'EntryIterationState',
        States: {
          EntryIterationState: {
            Type: 'Succeed',
          },
        },
      },
      End: true,
    };
    const stateName = 'MapState';
    const input = [
      { num1: 5, num2: 3 },
      { num1: 2, num2: 6 },
      { num1: 7, num2: 4 },
    ];
    const context = {};
    const options = {
      stateMachineOptions: undefined,
      runOptions: undefined,
      eventLogger: new EventLogger(),
      rawInput: {},
    };

    const mapStateAction = new MapStateAction(definition, stateName);
    const { stateResult } = await mapStateAction.execute(input, context, options);

    expect(stateResult).toHaveLength(3);
    expect(stateResult).toEqual([
      { num1: 5, num2: 3 },
      { num1: 2, num2: 6 },
      { num1: 7, num2: 4 },
    ]);
  });

  test('should process `Parameters` field if specified', async () => {
    const definition: MapState = {
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
    };
    const stateName = 'MapState';
    const input = {
      items: [
        { num1: 5, num2: 3 },
        { num1: 2, num2: 6 },
        { num1: 7, num2: 4 },
      ],
    };
    const context = {};
    const options = {
      stateMachineOptions: undefined,
      runOptions: undefined,
      eventLogger: new EventLogger(),
      rawInput: {},
    };

    const mapStateAction = new MapStateAction(definition, stateName);
    const { stateResult } = await mapStateAction.execute(input, context, options);

    expect(stateResult).toHaveLength(3);
    expect(stateResult).toEqual([
      {
        pair: { num1: 5, num2: 3 },
        index: 0,
      },
      {
        pair: { num1: 2, num2: 6 },
        index: 1,
      },
      {
        pair: { num1: 7, num2: 4 },
        index: 2,
      },
    ]);
  });

  test('should process `ItemSelector` field if specified', async () => {
    const definition: MapState = {
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
      ItemSelector: {
        'pair.$': '$$.Map.Item.Value',
        'index.$': '$$.Map.Item.Index',
      },
      End: true,
    };
    const stateName = 'MapState';
    const input = {
      items: [
        { num1: 5, num2: 3 },
        { num1: 2, num2: 6 },
        { num1: 7, num2: 4 },
      ],
    };
    const context = {};
    const options = {
      stateMachineOptions: undefined,
      runOptions: undefined,
      eventLogger: new EventLogger(),
      rawInput: {},
    };

    const mapStateAction = new MapStateAction(definition, stateName);
    const { stateResult } = await mapStateAction.execute(input, context, options);

    expect(stateResult).toHaveLength(3);
    expect(stateResult).toEqual([
      {
        pair: { num1: 5, num2: 3 },
        index: 0,
      },
      {
        pair: { num1: 2, num2: 6 },
        index: 1,
      },
      {
        pair: { num1: 7, num2: 4 },
        index: 2,
      },
    ]);
  });

  test('should throw a runtime error if input is not an array', async () => {
    const definition: MapState = {
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
    };
    const stateName = 'MapState';
    const input = 'not an array';
    const context = {};
    const options = {
      stateMachineOptions: undefined,
      runOptions: undefined,
      eventLogger: new EventLogger(),
      rawInput: {},
    };

    const mapStateAction = new MapStateAction(definition, stateName);
    const mapStateResult = mapStateAction.execute(input, context, options);

    await expect(mapStateResult).rejects.toThrow(StatesRuntimeError);
    await expect(mapStateResult).rejects.toThrow(
      'Input of Map state must be an array or ItemsPath property must point to an array'
    );
  });

  test('should throw a runtime error if `ItemsPath` field does not reference an array', async () => {
    const definition: MapState = {
      Type: 'Map',
      ItemsPath: '$.items',
      Iterator: {
        StartAt: 'EntryIterationState',
        States: {
          EntryIterationState: {
            Type: 'Succeed',
          },
        },
      },
      End: true,
    };
    const stateName = 'MapState';
    const input = { items: 'not an array' };
    const context = {};
    const options = {
      stateMachineOptions: undefined,
      runOptions: undefined,
      eventLogger: new EventLogger(),
      rawInput: {},
    };

    const mapStateAction = new MapStateAction(definition, stateName);
    const mapStateResult = mapStateAction.execute(input, context, options);

    await expect(mapStateResult).rejects.toThrow(StatesRuntimeError);
    await expect(mapStateResult).rejects.toThrow(
      'Path expression \'$.items\' evaluated to "not an array", but expected an array'
    );
  });

  test('should throw an error if a single iteration fails', async () => {
    const definition: MapState = {
      Type: 'Map',
      Iterator: {
        StartAt: 'EntryIterationState',
        States: {
          EntryIterationState: {
            Type: 'Fail',
          },
        },
      },
      End: true,
    };
    const stateName = 'MapState';
    const input = [1, 2, 3];
    const context = {};
    const options = {
      stateMachineOptions: undefined,
      runOptions: undefined,
      eventLogger: new EventLogger(),
      rawInput: {},
    };

    const mapStateAction = new MapStateAction(definition, stateName);
    const mapStateResult = mapStateAction.execute(input, context, options);

    await expect(mapStateResult).rejects.toThrow();
  });

  // If this test hangs, the `abort` is most likely not aborting the `sleep` call made by the `Wait` state
  test('should abort action if `rootAbortSignal` is aborted', async () => {
    jest.useFakeTimers();

    const definition: MapState = {
      Type: 'Map',
      Iterator: {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            Next: 'WaitState',
          },
          WaitState: {
            Type: 'Wait',
            Seconds: 60,
            End: true,
          },
        },
      },
      End: true,
    };
    const stateName = 'MapState';
    const input = [1, 2, 3];
    const context = {};
    const abortController = new AbortController();

    const mapStateAction = new MapStateAction(definition, stateName);
    const mapStateResult = mapStateAction.execute(input, context, {
      stateMachineOptions: undefined,
      runOptions: { _rootAbortSignal: abortController.signal },
      eventLogger: new EventLogger(),
      rawInput: input,
    });

    abortController.abort();

    await expect(mapStateResult).resolves.toEqual({
      isEndState: true,
      nextState: '',
      stateResult: [1, 2, 3],
    });
  });
});

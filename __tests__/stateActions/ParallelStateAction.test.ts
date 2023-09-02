import type { ParallelState } from '../../src/typings/ParallelState';
import { ParallelStateAction } from '../../src/stateMachine/stateActions/ParallelStateAction';
import { EventLogger } from '../../src/stateMachine/EventLogger';

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('Parallel State', () => {
  test('should output an array as result', async () => {
    const definition: ParallelState = {
      Type: 'Parallel',
      Branches: [
        {
          StartAt: 'Pass',
          States: {
            Pass: {
              Type: 'Pass',
              End: true,
            },
          },
        },
        {
          StartAt: 'Success',
          States: {
            Success: {
              Type: 'Succeed',
            },
          },
        },
      ],
      End: true,
    };
    const input = { value: 50 };
    const context = {};

    const parallelStateAction = new ParallelStateAction(definition);
    const { stateResult } = await parallelStateAction.execute(input, context);

    expect(Array.isArray(stateResult)).toBe(true);
  });

  test('should output an array with items corresponding to the order of the branches in `Branches` field', async () => {
    const definition: ParallelState = {
      Type: 'Parallel',
      Branches: [
        {
          StartAt: 'Pass',
          States: {
            Pass: {
              Type: 'Pass',
              Result: {
                result1: 'abcdef',
                result2: 123456,
              },
              End: true,
            },
          },
        },
        {
          StartAt: 'Pass',
          States: {
            Pass: {
              Type: 'Pass',
              Result: 10,
              End: true,
            },
          },
        },
        {
          StartAt: 'Pass',
          States: {
            Pass: {
              Type: 'Pass',
              Result: ['string', 20, null, false],
              End: true,
            },
          },
        },
        {
          StartAt: 'Success',
          States: {
            Success: {
              Type: 'Succeed',
            },
          },
        },
      ],
      End: true,
    };
    const input = { value: 50 };
    const context = {};

    const parallelStateAction = new ParallelStateAction(definition);
    const { stateResult } = await parallelStateAction.execute(input, context);

    expect(stateResult).toEqual([
      {
        result1: 'abcdef',
        result2: 123456,
      },
      10,
      ['string', 20, null, false],
      { value: 50 },
    ]);
  });

  test('should throw an error if a single branch fails', async () => {
    const definition: ParallelState = {
      Type: 'Parallel',
      Branches: [
        {
          StartAt: 'Pass',
          States: {
            Pass: {
              Type: 'Pass',
              End: true,
            },
          },
        },
        {
          StartAt: 'Fail',
          States: {
            Fail: {
              Type: 'Fail',
            },
          },
        },
      ],
      End: true,
    };
    const input = { value: 50 };
    const context = {};

    const parallelStateAction = new ParallelStateAction(definition);
    const parallelStateResult = parallelStateAction.execute(input, context);

    await expect(parallelStateResult).rejects.toThrow();
  });

  // If this test hangs, the `abort` is most likely not aborting the `sleep` call made by the `Wait` state
  test('should abort action if `rootAbortSignal` is aborted', async () => {
    jest.useFakeTimers();

    const definition: ParallelState = {
      Type: 'Parallel',
      Branches: [
        {
          StartAt: 'PassState',
          States: {
            PassState: {
              Type: 'Pass',
              End: true,
            },
          },
        },
        {
          StartAt: 'WaitState',
          States: {
            WaitState: {
              Type: 'Wait',
              Seconds: 60,
              End: true,
            },
          },
        },
      ],
      End: true,
    };
    const input = {};
    const context = {};
    const abortController = new AbortController();

    const parallelStateAction = new ParallelStateAction(definition);
    const parallelStateResult = parallelStateAction.execute(input, context, {
      stateMachineOptions: undefined,
      runOptions: { _rootAbortSignal: abortController.signal },
      eventLogger: new EventLogger(),
    });

    abortController.abort();

    await expect(parallelStateResult).resolves.toEqual({
      isEndState: true,
      nextState: '',
      stateResult: [{}, {}],
    });
  });
});

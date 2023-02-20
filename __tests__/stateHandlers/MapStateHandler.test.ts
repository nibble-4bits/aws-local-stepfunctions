import type { MapState } from '../../src/typings/MapState';
import { MapStateHandler } from '../../src/stateHandlers/MapStateHandler';

afterEach(() => {
  jest.clearAllMocks();
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
    const input = {
      items: [
        { num1: 5, num2: 3 },
        { num1: 2, num2: 6 },
        { num1: 7, num2: 4 },
      ],
    };
    const context = {};

    const mapStateHandler = new MapStateHandler(definition);
    const { stateResult } = await mapStateHandler.executeState(input, context);

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
    const input = [
      { num1: 5, num2: 3 },
      { num1: 2, num2: 6 },
      { num1: 7, num2: 4 },
    ];
    const context = {};

    const mapStateHandler = new MapStateHandler(definition);
    const { stateResult } = await mapStateHandler.executeState(input, context);

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
    const input = {
      items: [
        { num1: 5, num2: 3 },
        { num1: 2, num2: 6 },
        { num1: 7, num2: 4 },
      ],
    };
    const context = {};

    const mapStateHandler = new MapStateHandler(definition);
    const { stateResult } = await mapStateHandler.executeState(input, context);

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
});

import { StatesArray } from '../../src/stateMachine/intrinsicFunctions/StatesArray';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.Array intrinsic function', () => {
  test('should return an array containing the values of the arguments in the order provided', () => {
    const func = new StatesArray();
    const input = {
      someObject: {
        val1: 'hello',
        val2: 3,
      },
      someArray: [1, 2, 3],
    };
    const context = {};
    const funcArgs = ['1', '-5', '3.3', 'true', 'false', 'null', "'string'", '$.someObject', '$.someArray'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toEqual([1, -5, 3.3, true, false, null, 'string', { val1: 'hello', val2: 3 }, [1, 2, 3]]);
  });
});

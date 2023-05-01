import { StatesJsonToString } from '../../src/stateMachine/intrinsicFunctions/StatesJsonToString';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.JsonToString intrinsic function', () => {
  test('should return stringified JSON value', () => {
    const func = new StatesJsonToString();
    const input = {
      json: { a: { a1: 1, a2: 2 }, b: 2 },
    };
    const context = {};
    const funcArgs = ['$.json'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toBe('{"a":{"a1":1,"a2":2},"b":2}');
  });
});

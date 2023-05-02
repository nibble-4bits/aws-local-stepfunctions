import { StatesUUID } from '../../src/stateMachine/intrinsicFunctions/StatesUUID';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.UUID intrinsic function', () => {
  test('should return a UUIDv4', () => {
    const func = new StatesUUID();
    const input = {};
    const context = {};
    const funcArgs: any[] = [];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

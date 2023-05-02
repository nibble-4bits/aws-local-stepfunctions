import { evaluateIntrinsicFunction } from '../src/stateMachine/IntrinsicFunctionEvaluation';

describe('Intrinsic function evaluation', () => {
  test('should evaluate built-in intrinsic function', () => {
    const intrinsicFunction = "States.Array(1, 2, 3, true, false, null, 'string', $.path)";
    const input = { path: { a: 1, b: 2 } };
    const context = {};

    const result = evaluateIntrinsicFunction(intrinsicFunction, input, context);
    expect(result).toEqual([1, 2, 3, true, false, null, 'string', { a: 1, b: 2 }]);
  });

  test('should evaluate nested intrinsic functions', () => {
    const intrinsicFunction =
      "States.ArrayPartition(States.Array(States.Array(1, 2, 3, true, false, null, 'string', $.path), 1, 2, 3, true, false, null, 'string', $.path), 3)";
    const input = { path: { a: 1, b: 2 } };
    const context = {};

    const result = evaluateIntrinsicFunction(intrinsicFunction, input, context);
    expect(result).toEqual([
      [[1, 2, 3, true, false, null, 'string', { a: 1, b: 2 }], 1, 2],
      [3, true, false],
      [null, 'string', { a: 1, b: 2 }],
    ]);
  });
});

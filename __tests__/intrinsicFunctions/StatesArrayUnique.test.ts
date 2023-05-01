import { StatesArrayUnique } from '../../src/stateMachine/intrinsicFunctions/StatesArrayUnique';
import { StatesRuntimeError } from '../../src/error/predefined/StatesRuntimeError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('States.ArrayUnique intrinsic function', () => {
  test('should return array with duplicate values removed, leaving only unique values', () => {
    const func = new StatesArrayUnique();
    const input = {
      array: [
        1,
        2,
        2,
        3,
        3,
        3,
        null,
        null,
        true,
        true,
        false,
        false,
        5.67,
        5.67,
        5.6,
        'hello',
        'hello',
        [1, 2, 3],
        [1, 2, 3],
        [
          1,
          2,
          [
            3,
            4,
            5,
            [
              6,
              7,
              8,
              [
                9,
                10,
                11,
                [
                  { a: 1, b: 2 },
                  { a: 1, b: 2 },
                ],
              ],
            ],
          ],
        ],
        [
          1,
          2,
          [
            3,
            4,
            5,
            [
              6,
              7,
              8,
              [
                9,
                10,
                11,
                [
                  { a: 1, b: 2 },
                  { a: 1, b: 2 },
                ],
              ],
            ],
          ],
        ],
        { a: 1 },
        { a: 1 },
      ],
    };
    const context = {};
    const funcArgs = ['$.array'];

    const result = func.call(input, context, ...funcArgs);
    expect(result).toEqual([
      1,
      2,
      3,
      null,
      true,
      false,
      5.67,
      5.6,
      'hello',
      [1, 2, 3],
      [
        1,
        2,
        [
          3,
          4,
          5,
          [
            6,
            7,
            8,
            [
              9,
              10,
              11,
              [
                { a: 1, b: 2 },
                { a: 1, b: 2 },
              ],
            ],
          ],
        ],
      ],
      { a: 1 },
    ]);
  });

  describe('Validation errors', () => {
    test('should throw error if first argument is not an array', () => {
      const func = new StatesArrayUnique();
      const input = {
        array: 'not an array',
      };
      const context = {};
      const funcArgs = ['$.array'];

      function funcCallWrapper() {
        func.call(input, context, ...funcArgs);
      }

      expect(funcCallWrapper).toThrow(StatesRuntimeError);
    });
  });
});

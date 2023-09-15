import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';
import { quoteJSONValue } from '../../../util';

export class IntegerConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (!Number.isInteger(value)) {
      throw new StatesRuntimeError(
        `JSONPath expression '${this.pathExpression}' evaluated to ${quoteJSONValue(value)}, but expected an integer`
      );
    }
  }

  static greaterThanOrEqual(n: number): typeof IntegerConstraint {
    return class extends this {
      override test(value: number): void {
        super.test(value);

        if (value < n) {
          throw new StatesRuntimeError(
            `JSONPath expression '${this.pathExpression}' evaluated to ${quoteJSONValue(
              value
            )}, but expected an integer >= ${n}`
          );
        }
      }
    };
  }
}

import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { isRFC3339Date, stringifyJSONValue } from '../../../util';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';

export class RFC3339TimestampConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (typeof value !== 'string' || !isRFC3339Date(value)) {
      throw new StatesRuntimeError(
        `Path expression '${this.pathExpression}' evaluated to ${stringifyJSONValue(
          value
        )}, but expected a timestamp conforming to the RFC3339 profile`
      );
    }
  }
}

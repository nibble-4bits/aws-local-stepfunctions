import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { isRFC3339Date, quoteJSONValue } from '../../../util';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';

export class RFC3339TimestampConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (typeof value !== 'string' || !isRFC3339Date(value)) {
      throw new StatesRuntimeError(
        `JSONPath expression '${this.pathExpression}' evaluated to ${quoteJSONValue(
          value
        )}, but expected a timestamp conforming to the RFC3339 profile`
      );
    }
  }
}

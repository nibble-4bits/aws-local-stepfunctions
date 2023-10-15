import type { JSONValue } from '../../typings/JSONValue';
import type { FailState } from '../../typings/FailState';
import type { ActionResult, FailStateActionOptions } from '../../typings/StateActions';
import type { Context } from '../../typings/Context';
import { BaseStateAction } from './BaseStateAction';
import { FailStateError } from '../../error/FailStateError';
import { jsonPathQuery } from '../jsonPath/JsonPath';
import { StringConstraint } from '../jsonPath/constraints/StringConstraint';

class FailStateAction extends BaseStateAction<FailState> {
  constructor(stateDefinition: FailState, stateName: string) {
    super(stateDefinition, stateName);
  }

  override async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    input: JSONValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: Context,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: FailStateActionOptions
  ): Promise<ActionResult> {
    const state = this.stateDefinition;

    let error = state.Error;
    let cause = state.Cause;

    if (state.ErrorPath) {
      error = jsonPathQuery<string>(state.ErrorPath, input, context, {
        constraints: [StringConstraint],
      });
    }
    if (state.CausePath) {
      cause = jsonPathQuery<string>(state.CausePath, input, context, {
        constraints: [StringConstraint],
      });
    }

    throw new FailStateError(error, cause);
  }
}

export { FailStateAction };

import type { JSONValue } from '../../typings/JSONValue';
import type { FailState } from '../../typings/FailState';
import type { ActionResult, FailStateActionOptions } from '../../typings/StateActions';
import type { Context } from '../../typings/Context';
import { BaseStateAction } from './BaseStateAction';
import { FailStateError } from '../../error/FailStateError';

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
    throw new FailStateError(this.stateDefinition.Error, this.stateDefinition.Cause);
  }
}

export { FailStateAction };

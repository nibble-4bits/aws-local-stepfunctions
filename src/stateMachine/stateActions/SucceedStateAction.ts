import type { JSONValue } from '../../typings/JSONValue';
import type { ActionResult, SucceedStateActionOptions } from '../../typings/StateActions';
import type { SucceedState } from '../../typings/SucceedState';
import type { Context } from '../../typings/Context';
import { BaseStateAction } from './BaseStateAction';

class SucceedStateAction extends BaseStateAction<SucceedState> {
  constructor(stateDefinition: SucceedState, stateName: string) {
    super(stateDefinition, stateName);
  }

  override async execute(
    input: JSONValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: Context,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: SucceedStateActionOptions
  ): Promise<ActionResult> {
    return { stateResult: input, nextState: '', isEndState: true };
  }
}

export { SucceedStateAction };

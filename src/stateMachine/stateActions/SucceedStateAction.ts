import type { JSONValue } from '../../typings/JSONValue';
import type { ExecutionResult, SucceedStateActionOptions } from '../../typings/StateActions';
import type { SucceedState } from '../../typings/SucceedState';
import type { Context } from '../../typings/Context';
import { BaseStateAction } from './BaseStateAction';

class SucceedStateAction extends BaseStateAction<SucceedState> {
  constructor(stateDefinition: SucceedState) {
    super(stateDefinition);
  }

  override async execute(
    input: JSONValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: Context,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: SucceedStateActionOptions
  ): Promise<ExecutionResult> {
    return { stateResult: input, nextState: '', isEndState: true };
  }
}

export { SucceedStateAction };

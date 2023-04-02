import type { JSONValue } from '../../typings/JSONValue';
import type { FailState } from '../../typings/FailState';
import type { ExecutionResult, FailStateActionOptions } from '../../typings/StateActions';
import { BaseStateAction } from './BaseStateAction';

class FailStateAction extends BaseStateAction<FailState> {
  constructor(stateDefinition: FailState) {
    super(stateDefinition);
  }

  override async execute(
    input: JSONValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: FailStateActionOptions
  ): Promise<ExecutionResult> {
    // TODO: Implement behavior of fail state
    return { stateResult: input, nextState: '', isEndState: true };
  }
}

export { FailStateAction };

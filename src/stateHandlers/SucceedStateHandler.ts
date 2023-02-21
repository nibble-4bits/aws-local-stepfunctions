import type { JSONValue } from '../typings/JSONValue';
import type { ExecutionResult, SucceedStateHandlerOptions } from '../typings/StateHandlers';
import type { SucceedState } from '../typings/SucceedState';
import { BaseStateHandler } from './BaseStateHandler';

class SucceedStateHandler extends BaseStateHandler<SucceedState> {
  constructor(stateDefinition: SucceedState) {
    super(stateDefinition);
  }

  override async executeState(
    input: JSONValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: SucceedStateHandlerOptions
  ): Promise<ExecutionResult> {
    return { stateResult: input, isEndState: true };
  }
}

export { SucceedStateHandler };

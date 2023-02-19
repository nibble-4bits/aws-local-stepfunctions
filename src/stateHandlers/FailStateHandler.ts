import type { JSONValue } from '../typings/JSONValue';
import type { FailState } from '../typings/FailState';
import { BaseStateHandler, ExecutionResult, FailStateHandlerOptions } from './BaseStateHandler';

class FailStateHandler extends BaseStateHandler<FailState> {
  constructor(stateDefinition: FailState) {
    super(stateDefinition);
  }

  override async executeState(
    input: JSONValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: FailStateHandlerOptions
  ): Promise<ExecutionResult> {
    // TODO: Implement behavior of fail state
    return { stateResult: input, isEndState: true };
  }
}

export { FailStateHandler };

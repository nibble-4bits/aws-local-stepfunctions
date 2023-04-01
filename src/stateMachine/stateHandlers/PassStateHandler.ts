import type { JSONValue } from '../../typings/JSONValue';
import type { PassState } from '../../typings/PassState';
import type { ExecutionResult, PassStateHandlerOptions } from '../../typings/StateHandlers';
import { BaseStateHandler } from './BaseStateHandler';

class PassStateHandler extends BaseStateHandler<PassState> {
  constructor(stateDefinition: PassState) {
    super(stateDefinition);
  }

  override async executeState(
    input: JSONValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: PassStateHandlerOptions
  ): Promise<ExecutionResult> {
    if (this.stateDefinition.Result) {
      return this.buildExecutionResult(this.stateDefinition.Result);
    }

    return this.buildExecutionResult(input);
  }
}

export { PassStateHandler };

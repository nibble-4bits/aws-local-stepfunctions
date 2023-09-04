import type { JSONValue } from '../../typings/JSONValue';
import type { PassState } from '../../typings/PassState';
import type { ActionResult, PassStateActionOptions } from '../../typings/StateActions';
import type { Context } from '../../typings/Context';
import { BaseStateAction } from './BaseStateAction';

class PassStateAction extends BaseStateAction<PassState> {
  constructor(stateDefinition: PassState, stateName: string) {
    super(stateDefinition, stateName);
  }

  override async execute(
    input: JSONValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: Context,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: PassStateActionOptions
  ): Promise<ActionResult> {
    if (this.stateDefinition.Result) {
      return this.buildExecutionResult(this.stateDefinition.Result);
    }

    return this.buildExecutionResult(input);
  }
}

export { PassStateAction };

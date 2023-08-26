import type { TaskState } from '../../typings/TaskState';
import type { JSONValue } from '../../typings/JSONValue';
import type { ActionResult, TaskStateActionOptions } from '../../typings/StateActions';
import type { Context } from '../../typings/Context';
import { BaseStateAction } from './BaseStateAction';
import { LambdaClient } from '../../aws/LambdaClient';

class TaskStateAction extends BaseStateAction<TaskState> {
  constructor(stateDefinition: TaskState, stateName: string) {
    super(stateDefinition, stateName);
  }

  override async execute(input: JSONValue, context: Context, options?: TaskStateActionOptions): Promise<ActionResult> {
    const state = this.stateDefinition;

    // If local override for task resource is defined, use that
    if (options?.overrideFn) {
      const result = await options.overrideFn(input);
      return this.buildExecutionResult(result);
    }

    const lambdaClient = new LambdaClient(options?.awsConfig);
    const result = await lambdaClient.invokeFunction(state.Resource, input);
    return this.buildExecutionResult(result);
  }
}

export { TaskStateAction };

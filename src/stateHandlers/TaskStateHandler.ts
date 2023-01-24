import type { TaskState } from '../typings/TaskState';
import type { JSONValue } from '../typings/JSONValue';
import { BaseStateHandler, TaskStateHandlerOptions } from './BaseStateHandler';
import { LambdaClient } from '../aws/LambdaClient';
import { LambdaExecutionError } from '../error/LambdaExecutionError';

class TaskStateHandler extends BaseStateHandler<TaskState> {
  constructor(stateDefinition: TaskState) {
    super(stateDefinition);
  }

  override async executeState(
    input: JSONValue,
    context: Record<string, unknown>,
    options?: TaskStateHandlerOptions
  ): Promise<JSONValue> {
    const state = this.stateDefinition;
    const lambdaClient = new LambdaClient();

    try {
      // If local override for task resource is defined, use that
      if (options?.overrideFn) {
        const result = await options.overrideFn(input);
        return result;
      }

      const result = await lambdaClient.invokeFunction(state.Resource, input);
      return result;
    } catch (error) {
      if (error instanceof LambdaExecutionError) {
        console.error(error.toString());
      } else {
        console.error(error);
      }

      throw error;
    }
  }
}

export { TaskStateHandler };

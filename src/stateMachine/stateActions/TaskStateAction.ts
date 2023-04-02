import type { TaskState } from '../../typings/TaskState';
import type { JSONValue } from '../../typings/JSONValue';
import type { ExecutionResult, TaskStateActionOptions } from '../../typings/StateActions';
import { BaseStateAction } from './BaseStateAction';
import { LambdaClient } from '../../aws/LambdaClient';
import { LambdaExecutionError } from '../../error/LambdaExecutionError';

class TaskStateAction extends BaseStateAction<TaskState> {
  constructor(stateDefinition: TaskState) {
    super(stateDefinition);
  }

  override async execute(
    input: JSONValue,
    context: Record<string, unknown>,
    options?: TaskStateActionOptions
  ): Promise<ExecutionResult> {
    const state = this.stateDefinition;
    const lambdaClient = new LambdaClient();

    try {
      // If local override for task resource is defined, use that
      if (options?.overrideFn) {
        const result = await options.overrideFn(input);
        return this.buildExecutionResult(result);
      }

      const result = await lambdaClient.invokeFunction(state.Resource, input);
      return this.buildExecutionResult(result);
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

export { TaskStateAction };

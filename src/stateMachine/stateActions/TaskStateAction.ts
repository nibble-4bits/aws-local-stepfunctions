import type { TaskState } from '../../typings/TaskState';
import type { JSONValue } from '../../typings/JSONValue';
import type { ActionResult, TaskStateActionOptions } from '../../typings/StateActions';
import type { Context } from '../../typings/Context';
import { StatesTimeoutError } from '../../error/predefined/StatesTimeoutError';
import { BaseStateAction } from './BaseStateAction';
import { LambdaClient } from '../../aws/LambdaClient';
import { jsonPathQuery } from '../jsonPath/JsonPath';
import { IntegerConstraint } from '../jsonPath/constraints/IntegerConstraint';

/**
 * Default timeout for Task state according to spec
 */
const DEFAULT_TIMEOUT_SECONDS = 60;

class TaskStateAction extends BaseStateAction<TaskState> {
  constructor(stateDefinition: TaskState, stateName: string) {
    super(stateDefinition, stateName);
  }

  private getTimeoutMs(input: JSONValue, context: Context): number {
    const state = this.stateDefinition;

    let timeout: number = DEFAULT_TIMEOUT_SECONDS;

    if (state.TimeoutSeconds) {
      timeout = state.TimeoutSeconds;
    } else if (state.TimeoutSecondsPath) {
      timeout = jsonPathQuery<number>(state.TimeoutSecondsPath!, input, context, {
        constraints: [IntegerConstraint.greaterThanOrEqual(1)],
      });
    }

    return timeout * 1000;
  }

  override async execute(input: JSONValue, context: Context, options: TaskStateActionOptions): Promise<ActionResult> {
    const state = this.stateDefinition;

    const taskPromise = options.overrideFn
      ? // If local override for task resource is defined, use that
        options.overrideFn(input)
      : // Else, call Lambda in AWS using SDK
        new LambdaClient(options.awsConfig).invokeFunction(state.Resource, input);

    const timeoutMs = this.getTimeoutMs(input, context);

    const { promise: timeoutPromise, reject: rejectTimeout } = Promise.withResolvers<never>();
    const timeoutId = setTimeout(() => rejectTimeout(new StatesTimeoutError()), timeoutMs);
    try {
      const result = await Promise.race([taskPromise, timeoutPromise]);
      return this.buildExecutionResult(result);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export { TaskStateAction };

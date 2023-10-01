import type { TaskState } from '../../typings/TaskState';
import type { JSONValue } from '../../typings/JSONValue';
import type { ActionResult, TaskStateActionOptions } from '../../typings/StateActions';
import type { Context } from '../../typings/Context';
import { StatesTimeoutError } from '../../error/predefined/StatesTimeoutError';
import { BaseStateAction } from './BaseStateAction';
import { LambdaClient } from '../../aws/LambdaClient';
import { jsonPathQuery } from '../jsonPath/JsonPath';
import { IntegerConstraint } from '../jsonPath/constraints/IntegerConstraint';

class TaskStateAction extends BaseStateAction<TaskState> {
  private timeoutAbortController: AbortController;

  constructor(stateDefinition: TaskState, stateName: string) {
    super(stateDefinition, stateName);
    this.timeoutAbortController = new AbortController();
  }

  private createTimeoutPromise(input: JSONValue, context: Context): Promise<never> | undefined {
    const state = this.stateDefinition;

    if (!state.TimeoutSeconds && !state.TimeoutSecondsPath) return;

    let timeout: number;
    if (state.TimeoutSeconds) {
      timeout = state.TimeoutSeconds;
    } else if (state.TimeoutSecondsPath) {
      timeout = jsonPathQuery<number>(state.TimeoutSecondsPath, input, context, {
        constraints: [IntegerConstraint.greaterThanOrEqual(1)],
      });
    }

    return new Promise<never>((_, reject) => {
      const handleTimeoutAbort = () => clearTimeout(timeoutId);

      const timeoutId = setTimeout(() => {
        this.timeoutAbortController.signal.removeEventListener('abort', handleTimeoutAbort);
        reject(new StatesTimeoutError());
      }, timeout * 1000);

      this.timeoutAbortController.signal.addEventListener('abort', handleTimeoutAbort, { once: true });
    });
  }

  override async execute(input: JSONValue, context: Context, options: TaskStateActionOptions): Promise<ActionResult> {
    const state = this.stateDefinition;
    const racingPromises = [];
    const timeoutPromise = this.createTimeoutPromise(input, context);

    if (options.overrideFn) {
      // If local override for task resource is defined, use that
      const resultPromise = options.overrideFn(input);
      racingPromises.push(resultPromise);
    } else {
      // Else, call Lambda in AWS using SDK
      const lambdaClient = new LambdaClient(options.awsConfig);
      const resultPromise = lambdaClient.invokeFunction(state.Resource, input);
      racingPromises.push(resultPromise);
    }

    if (timeoutPromise) {
      racingPromises.push(timeoutPromise);
    }

    const result = await Promise.race(racingPromises);
    this.timeoutAbortController.abort();

    return this.buildExecutionResult(result);
  }
}

export { TaskStateAction };

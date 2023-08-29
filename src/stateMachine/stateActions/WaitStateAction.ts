import type { JSONValue } from '../../typings/JSONValue';
import type { WaitState } from '../../typings/WaitState';
import type { ExecutionResult, WaitStateActionOptions } from '../../typings/StateActions';
import type { Context } from '../../typings/Context';
import { BaseStateAction } from './BaseStateAction';
import { jsonPathQuery } from '../JsonPath';
import { sleep } from '../../util';

class WaitStateAction extends BaseStateAction<WaitState> {
  constructor(stateDefinition: WaitState) {
    super(stateDefinition);
  }

  override async execute(
    input: JSONValue,
    context: Context,
    options?: WaitStateActionOptions
  ): Promise<ExecutionResult> {
    const state = this.stateDefinition;

    if (options?.waitTimeOverrideOption !== undefined) {
      // If the wait time override is set, sleep for the specified number of milliseconds
      await sleep(options.waitTimeOverrideOption, options.abortSignal, options?.rootAbortSignal);
      return this.buildExecutionResult(input);
    }

    if (state.Seconds) {
      await sleep(state.Seconds * 1000, options?.abortSignal, options?.rootAbortSignal);
    } else if (state.Timestamp) {
      const dateTimestamp = new Date(state.Timestamp);
      const currentTime = Date.now();
      const timeDiff = dateTimestamp.getTime() - currentTime;

      await sleep(timeDiff, options?.abortSignal, options?.rootAbortSignal);
    } else if (state.SecondsPath) {
      const seconds = jsonPathQuery<number>(state.SecondsPath, input, context);
      await sleep(seconds * 1000, options?.abortSignal, options?.rootAbortSignal);
    } else if (state.TimestampPath) {
      const timestamp = jsonPathQuery<string>(state.TimestampPath, input, context);
      const dateTimestamp = new Date(timestamp);
      const currentTime = Date.now();
      const timeDiff = dateTimestamp.getTime() - currentTime;

      await sleep(timeDiff, options?.abortSignal, options?.rootAbortSignal);
    }

    return this.buildExecutionResult(input);
  }
}

export { WaitStateAction };

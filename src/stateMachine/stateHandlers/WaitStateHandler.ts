import type { JSONValue } from '../../typings/JSONValue';
import type { WaitState } from '../../typings/WaitState';
import type { ExecutionResult, WaitStateHandlerOptions } from '../../typings/StateHandlers';
import { BaseStateHandler } from './BaseStateHandler';
import { jsonPathQuery } from '../JsonPath';
import { sleep } from '../../util';

class WaitStateHandler extends BaseStateHandler<WaitState> {
  constructor(stateDefinition: WaitState) {
    super(stateDefinition);
  }

  override async executeState(
    input: JSONValue,
    context: Record<string, unknown>,
    options?: WaitStateHandlerOptions
  ): Promise<ExecutionResult> {
    const state = this.stateDefinition;

    if (options?.waitTimeOverrideOption !== undefined) {
      // If the wait time override is set, sleep for the specified number of milliseconds
      await sleep(options.waitTimeOverrideOption, options.abortSignal);
      return this.buildExecutionResult(input);
    }

    if (state.Seconds) {
      await sleep(state.Seconds * 1000, options?.abortSignal);
    } else if (state.Timestamp) {
      const dateTimestamp = new Date(state.Timestamp);
      const currentTime = Date.now();
      const timeDiff = dateTimestamp.getTime() - currentTime;

      await sleep(timeDiff, options?.abortSignal);
    } else if (state.SecondsPath) {
      const seconds = jsonPathQuery<number>(state.SecondsPath, input, context);
      await sleep(seconds * 1000, options?.abortSignal);
    } else if (state.TimestampPath) {
      const timestamp = jsonPathQuery<string>(state.TimestampPath, input, context);
      const dateTimestamp = new Date(timestamp);
      const currentTime = Date.now();
      const timeDiff = dateTimestamp.getTime() - currentTime;

      await sleep(timeDiff, options?.abortSignal);
    }

    return this.buildExecutionResult(input);
  }
}

export { WaitStateHandler };

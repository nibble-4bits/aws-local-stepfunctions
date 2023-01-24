import type { JSONValue } from '../typings/JSONValue';
import type { WaitState } from '../typings/WaitState';
import { BaseStateHandler, WaitStateHandlerOptions } from './BaseStateHandler';
import { jsonPathQuery } from '../JsonPath';
import { sleep } from '../util';

class WaitStateHandler extends BaseStateHandler<WaitState> {
  constructor(stateDefinition: WaitState) {
    super(stateDefinition);
  }

  override async executeState(
    input: JSONValue,
    context: Record<string, unknown>,
    options?: WaitStateHandlerOptions
  ): Promise<JSONValue> {
    const state = this.stateDefinition;

    if (options?.waitTimeOverrideOption !== undefined) {
      // If the wait time override is set, sleep for the specified number of milliseconds
      await sleep(options.waitTimeOverrideOption);
      return input;
    }

    if (state.Seconds) {
      await sleep(state.Seconds * 1000);
    } else if (state.Timestamp) {
      const dateTimestamp = new Date(state.Timestamp);
      const currentTime = Date.now();
      const timeDiff = dateTimestamp.getTime() - currentTime;

      await sleep(timeDiff);
    } else if (state.SecondsPath) {
      const seconds = jsonPathQuery(state.SecondsPath, input, context);
      await sleep(seconds * 1000);
    } else if (state.TimestampPath) {
      const timestamp = jsonPathQuery(state.TimestampPath, input, context);
      const dateTimestamp = new Date(timestamp);
      const currentTime = Date.now();
      const timeDiff = dateTimestamp.getTime() - currentTime;

      await sleep(timeDiff);
    }

    return input;
  }
}

export { WaitStateHandler };

import type { JSONValue } from '../../typings/JSONValue';
import type { WaitState } from '../../typings/WaitState';
import type { ActionResult, WaitStateActionOptions } from '../../typings/StateActions';
import type { Context } from '../../typings/Context';
import { BaseStateAction } from './BaseStateAction';
import { jsonPathQuery } from '../jsonPath/JsonPath';
import { IntegerConstraint } from '../jsonPath/constraints/IntegerConstraint';
import { RFC3339TimestampConstraint } from '../jsonPath/constraints/RFC3339TimestampConstraint';
import { sleep } from '../../util';

class WaitStateAction extends BaseStateAction<WaitState> {
  constructor(stateDefinition: WaitState, stateName: string) {
    super(stateDefinition, stateName);
  }

  override async execute(input: JSONValue, context: Context, options: WaitStateActionOptions): Promise<ActionResult> {
    const state = this.stateDefinition;

    if (options.waitTimeOverrideOption !== undefined) {
      // If the wait time override is set, sleep for the specified number of milliseconds
      await sleep(options.waitTimeOverrideOption, options.abortSignal, options.rootAbortSignal);
      return this.buildExecutionResult(input);
    }

    if (state.Seconds) {
      await sleep(state.Seconds * 1000, options.abortSignal, options.rootAbortSignal);
    } else if (state.Timestamp) {
      const dateTimestamp = new Date(state.Timestamp);
      const currentTime = Date.now();
      const timeDiff = dateTimestamp.getTime() - currentTime;

      await sleep(timeDiff, options.abortSignal, options.rootAbortSignal);
    } else if (state.SecondsPath) {
      const seconds = jsonPathQuery<number>(state.SecondsPath, input, context, {
        constraints: [IntegerConstraint.greaterThanOrEqual(0)],
      });
      await sleep(seconds * 1000, options.abortSignal, options.rootAbortSignal);
    } else if (state.TimestampPath) {
      const timestamp = jsonPathQuery<string>(state.TimestampPath, input, context, {
        constraints: [RFC3339TimestampConstraint],
      });
      const dateTimestamp = new Date(timestamp);
      const currentTime = Date.now();
      const timeDiff = dateTimestamp.getTime() - currentTime;

      await sleep(timeDiff, options.abortSignal, options.rootAbortSignal);
    }

    return this.buildExecutionResult(input);
  }
}

export { WaitStateAction };

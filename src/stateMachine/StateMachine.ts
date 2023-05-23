import type { StateMachineDefinition } from '../typings/StateMachineDefinition';
import type { JSONValue } from '../typings/JSONValue';
import type { ExecuteOptions, RunOptions, StateMachineOptions } from '../typings/StateMachineImplementation';
import type { Context } from '../typings/Context';
import { ExecutionAbortedError } from '../error/ExecutionAbortedError';
import { StatesTimeoutError } from '../error/predefined/StatesTimeoutError';
import { ExecutionError } from '../error/ExecutionError';
import { StateExecutor } from './StateExecutor';
import aslValidator from 'asl-validator';
import cloneDeep from 'lodash/cloneDeep.js';

/**
 * Default max amount of seconds that an execution is allowed to run before timing out.
 * This value corresponds to `2^31 - 1` seconds (about 24 days, 20 hours, 31 minutes, and 24 seconds),
 * since browsers store the delay as a 32-bit signed integer.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value
 */
const DEFAULT_MAX_EXECUTION_TIMEOUT = 2147483.647;

export class StateMachine {
  /**
   * The structure of the State Machine as represented by the Amazon States Language.
   */
  private readonly definition: StateMachineDefinition;

  /**
   * Options to control certain settings of the state machine.
   */
  private readonly stateMachineOptions: StateMachineOptions | undefined;

  /**
   * Constructs a new state machine.
   * @param definition The state machine definition defined using the Amazon States Language (https://states-language.net/spec.html).
   * @param stateMachineOptions Options to control certain settings of the state machine.
   * These options also apply to state machines defined in the `Iterator` field of `Map` states and in the `Branches` field of `Parallel` states.
   */
  constructor(definition: StateMachineDefinition, stateMachineOptions?: StateMachineOptions) {
    const { isValid, errorsText } = aslValidator(definition, {
      checkArn: true,
      checkPaths: true,
      ...stateMachineOptions?.validationOptions,
    });

    if (!isValid) {
      throw new Error(`State machine definition is invalid, see error(s) below:\n ${errorsText('\n')}`);
    }

    this.definition = definition;
    this.stateMachineOptions = stateMachineOptions;
  }

  /**
   * Executes the state machine, running through the states specified in the definition.
   * If the execution fails, the result will throw an `ExecutionError` explaining why the
   * execution failed.
   *
   * By default, if the execution is aborted, the result will throw an `ExecutionAbortedError`. This behavior can be changed by setting
   * the `noThrowOnAbort` option to `true`, in which case the result will be `null`.
   *
   * @param input The input to pass to this state machine execution.
   * @param options Miscellaneous options to control certain behaviors of the execution.
   */
  run(input: JSONValue, options?: RunOptions): { abort: () => void; result: Promise<JSONValue> } {
    const abortController = new AbortController();
    const timeoutSeconds = this.definition.TimeoutSeconds ?? DEFAULT_MAX_EXECUTION_TIMEOUT;

    let onAbortHandler: () => void;
    const settleOnAbort = new Promise<null>((resolve, reject) => {
      if (options?.noThrowOnAbort) {
        onAbortHandler = () => resolve(null);
      } else {
        onAbortHandler = () => reject(new ExecutionAbortedError());
      }
      abortController.signal.addEventListener('abort', onAbortHandler);
    });

    let timeoutId: NodeJS.Timeout;
    const rejectOnTimeout = new Promise<null>((_, reject) => {
      timeoutId = setTimeout(() => {
        // Handle timeout by removing the abort handler from the abort signal listener
        abortController.signal.removeEventListener('abort', onAbortHandler);
        // Then we simply reuse the abort controller to abort the execution on timeout
        abortController.abort();
        reject(new StatesTimeoutError());
      }, timeoutSeconds * 1000);
    });

    const executionResult = this.execute(
      input,
      {
        stateMachineOptions: this.stateMachineOptions,
        runOptions: options,
        abortSignal: abortController.signal,
      },
      () => {
        abortController.signal.removeEventListener('abort', onAbortHandler);
        clearTimeout(timeoutId);
      }
    );

    const racingPromises = [executionResult, settleOnAbort, rejectOnTimeout];
    const result = Promise.race(racingPromises);

    return {
      abort: () => abortController.abort(),
      result,
    };
  }

  /**
   * Helper method that handles the execution of the machine states and the transitions between them.
   */
  private async execute(input: JSONValue, options: ExecuteOptions, cleanupFn: () => void): Promise<JSONValue> {
    let currState = this.definition.States[this.definition.StartAt];
    let currStateName = this.definition.StartAt;
    let currInput = cloneDeep(input);
    let currResult: JSONValue = null;
    let nextState = '';
    let isEndState = false;
    // eslint-disable-next-line prefer-const
    let context: Context = {};

    try {
      do {
        const stateExecutor = new StateExecutor(currStateName, currState);
        ({ stateResult: currResult, nextState, isEndState } = await stateExecutor.execute(currInput, context, options));

        currInput = currResult;

        currState = this.definition.States[nextState];
        currStateName = nextState;
      } while (!isEndState && !options.abortSignal.aborted);
    } catch (error) {
      throw new ExecutionError(error as Error);
    } finally {
      cleanupFn();
    }

    return currResult;
  }
}

import type { StateMachineDefinition } from '../typings/StateMachineDefinition';
import type { JSONValue } from '../typings/JSONValue';
import type { ExecuteOptions, RunOptions, StateMachineOptions } from '../typings/StateMachineImplementation';
import type { Context } from '../typings/Context';
import { ExecutionAbortedError } from '../error/ExecutionAbortedError';
import { ExecutionError } from '../error/ExecutionError';
import { StateExecutor } from './StateExecutor';
import aslValidator from 'asl-validator';
import cloneDeep from 'lodash/cloneDeep.js';

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

    const settleOnAbort = new Promise<null>((resolve, reject) => {
      if (options?.noThrowOnAbort) {
        abortController.signal.addEventListener('abort', () => resolve(null));
      } else {
        abortController.signal.addEventListener('abort', () => reject(new ExecutionAbortedError()));
      }
    });

    const executionResult = this.execute(input, {
      stateMachineOptions: this.stateMachineOptions,
      runOptions: options,
      abortSignal: abortController.signal,
    });

    const result = Promise.race([executionResult, settleOnAbort]);

    return {
      abort: () => abortController.abort(),
      result,
    };
  }

  /**
   * Helper method that handles the execution of the machine states and the transitions between them.
   */
  private async execute(input: JSONValue, options: ExecuteOptions): Promise<JSONValue> {
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
    }

    return currResult;
  }
}

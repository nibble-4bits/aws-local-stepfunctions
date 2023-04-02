import type { AllStates } from '../typings/AllStates';
import type { ChoiceState } from '../typings/ChoiceState';
import type { FailState } from '../typings/FailState';
import type { JSONValue } from '../typings/JSONValue';
import type { MapState } from '../typings/MapState';
import type { PassState } from '../typings/PassState';
import type { ExecutionResult } from '../typings/StateHandlers';
import type { ExecuteOptions, StateExecutors } from '../typings/StateMachineImplementation';
import type { SucceedState } from '../typings/SucceedState';
import type { TaskState } from '../typings/TaskState';
import type { WaitState } from '../typings/WaitState';
import {
  processInputPath,
  processOutputPath,
  processPayloadTemplate,
  processResultPath,
} from './InputOutputProcessing';
import { ChoiceStateHandler } from './stateHandlers/ChoiceStateHandler';
import { FailStateHandler } from './stateHandlers/FailStateHandler';
import { MapStateHandler } from './stateHandlers/MapStateHandler';
import { PassStateHandler } from './stateHandlers/PassStateHandler';
import { SucceedStateHandler } from './stateHandlers/SucceedStateHandler';
import { TaskStateHandler } from './stateHandlers/TaskStateHandler';
import { WaitStateHandler } from './stateHandlers/WaitStateHandler';
import { sleep } from '../util';
import cloneDeep from 'lodash/cloneDeep.js';

/**
 * Default max number of attempts to retry each retrier.
 */
const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * Default amount of seconds to wait before retrying.
 */
const DEFAULT_INTERVAL_SECONDS = 1;

/**
 * Default backoff rate for retry wait.
 */
const DEFAULT_BACKOFF_RATE = 2.0;

/**
 * The wildcard error. This matches all errors caught in the `Retry` or `Catch` fields.
 */
const WILDCARD_ERROR = 'States.ALL';

/**
 * This class handles the execution a single state in the state machine.
 * Handling the execution includes:
 *  - Applying input processing
 *  - Executing the state itself
 *  - Applying output processing
 *  - If state is retryable, run the retry attempts
 */
export class StateExecutor {
  /**
   * The name of the state.
   */
  private readonly stateName: string;

  /**
   * The Amazon States Language definition of the state.
   */
  private readonly stateDefinition: AllStates;

  /**
   * An array that stores the number of times each retrier in a Retryable state has been retried.
   */
  private readonly retrierAttempts: number[];

  /**
   * A map of functions to execute each type of state.
   */
  private readonly stateExecutors: StateExecutors;

  constructor(stateName: string, stateDefinition: AllStates) {
    this.stateName = stateName;
    this.stateDefinition = stateDefinition;
    this.retrierAttempts = 'Retry' in this.stateDefinition ? new Array(this.stateDefinition.Retry.length).fill(0) : [];
    this.stateExecutors = {
      Task: this.executeTaskState,
      Map: this.executeMapState,
      Pass: this.executePassState,
      Wait: this.executeWaitState,
      Choice: this.executeChoiceState,
      Succeed: this.executeSucceedState,
      Fail: this.executeFailState,
    };
  }

  /**
   * Execute the current state.
   */
  async executeState(
    input: JSONValue,
    context: Record<string, unknown>,
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const rawInput = cloneDeep(input);

    try {
      const processedInput = this.processInput(this.stateDefinition, input, context);

      const {
        stateResult: currResult,
        nextState,
        isEndState,
      } = await this.stateExecutors[this.stateDefinition.Type](
        // @ts-expect-error Indexing `this.stateHandlers` by non-literal value produces a `never` type for the `this.stateDefinition` parameter of the handler being called
        this.stateDefinition,
        processedInput,
        context,
        this.stateName,
        options
      );

      const processedResult = this.processResult(this.stateDefinition, currResult, rawInput, context);

      return { stateResult: processedResult, nextState, isEndState };
    } catch (error) {
      const shouldRetry = await this.shouldRetry(error as Error);
      if (shouldRetry) {
        return this.executeState(input, context, options);
      }

      throw error;
    }
  }

  /**
   * Process the current input according to the `InputPath` and `Parameters` fields.
   */
  private processInput(currentState: AllStates, input: JSONValue, context: Record<string, unknown>): JSONValue {
    let processedInput = input;

    if ('InputPath' in currentState) {
      processedInput = processInputPath(currentState.InputPath, processedInput, context);
    }

    if ('Parameters' in currentState && currentState.Type !== 'Map') {
      // `Parameters` field is handled differently in the `Map` state,
      // hence why we omit processing it here.
      processedInput = processPayloadTemplate(currentState.Parameters, processedInput, context);
    }

    return processedInput;
  }

  /**
   * Process the current result according to the `ResultSelector`, `ResultPath` and `OutputPath` fields.
   */
  private processResult(
    currentState: AllStates,
    result: JSONValue,
    rawInput: JSONValue,
    context: Record<string, unknown>
  ): JSONValue {
    let processedResult = result;

    if ('ResultSelector' in currentState) {
      processedResult = processPayloadTemplate(currentState.ResultSelector, processedResult, context);
    }

    if ('ResultPath' in currentState) {
      processedResult = processResultPath(currentState.ResultPath, rawInput, processedResult);
    }

    if ('OutputPath' in currentState) {
      processedResult = processOutputPath(currentState.OutputPath, processedResult, context);
    }

    return processedResult;
  }

  /**
   * Decide whether this state should be retried, according to the `Retry` field.
   */
  async shouldRetry(error: Error): Promise<boolean> {
    if (!('Retry' in this.stateDefinition)) {
      return false;
    }

    for (let i = 0; i < this.stateDefinition.Retry.length; i++) {
      const retrier = this.stateDefinition.Retry[i];
      const maxAttempts = retrier.MaxAttempts ?? DEFAULT_MAX_ATTEMPTS;
      const intervalSeconds = retrier.IntervalSeconds ?? DEFAULT_INTERVAL_SECONDS;
      const backoffRate = retrier.BackoffRate ?? DEFAULT_BACKOFF_RATE;
      const waitTime = intervalSeconds * Math.pow(backoffRate, this.retrierAttempts[i]) * 1000;

      for (const retrierError of retrier.ErrorEquals) {
        if (retrierError === error.name || retrierError === WILDCARD_ERROR) {
          if (this.retrierAttempts[i] >= maxAttempts) return false;

          this.retrierAttempts[i]++;

          await sleep(waitTime);

          return true;
        }
      }
    }

    return false;
  }

  /**
   * Handler for task states.
   *
   * Invokes the Lambda function specified in the `Resource` field
   * and sets the current result of the state machine to the value returned by the Lambda.
   */
  private async executeTaskState(
    stateDefinition: TaskState,
    input: JSONValue,
    context: Record<string, unknown>,
    stateName: string,
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const overrideFn = options.runOptions?.overrides?.taskResourceLocalHandlers?.[stateName];

    const taskStateHandler = new TaskStateHandler(stateDefinition);
    const executionResult = await taskStateHandler.executeState(input, context, { overrideFn });

    return executionResult;
  }

  /**
   * Handler for map states.
   *
   * Iterates over the current input items or the items of an array specified
   * by the `ItemsPath` field, and then processes each item by passing it
   * as the input to the state machine specified in the `Iterator` field.
   */
  private async executeMapState(
    stateDefinition: MapState,
    input: JSONValue,
    context: Record<string, unknown>,
    stateName: string,
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const mapStateHandler = new MapStateHandler(stateDefinition);
    const executionResult = await mapStateHandler.executeState(input, context, {
      validationOptions: options.validationOptions,
      runOptions: options.runOptions,
    });

    return executionResult;
  }

  /**
   * Handler for pass states.
   *
   * If the `Result` field is specified, copies `Result` into the current result.
   * Else, copies the current input into the current result.
   */
  private async executePassState(
    stateDefinition: PassState,
    input: JSONValue,
    context: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stateName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const passStateHandler = new PassStateHandler(stateDefinition);
    const executionResult = await passStateHandler.executeState(input, context);

    return executionResult;
  }

  /**
   * Handler for wait states.
   *
   * Pauses the state machine execution for a certain amount of time
   * based on one of the `Seconds`, `Timestamp`, `SecondsPath` or `TimestampPath` fields.
   */
  private async executeWaitState(
    stateDefinition: WaitState,
    input: JSONValue,
    context: Record<string, unknown>,
    stateName: string,
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const waitTimeOverrideOption = options.runOptions?.overrides?.waitTimeOverrides?.[stateName];
    const abortSignal = options.abortSignal;

    const waitStateHandler = new WaitStateHandler(stateDefinition);
    const executionResult = await waitStateHandler.executeState(input, context, {
      waitTimeOverrideOption,
      abortSignal,
    });

    return executionResult;
  }

  /**
   * Handler for choice states.
   *
   * Evaluates each choice rule specified in the `Choices` field.
   *
   * If one of the rules matches, then the state machine transitions to the
   * state specified in the `Next` field for that choice rule.
   *
   * If no rule matches but the `Default` field is specified,
   * then the next state will be the state specified in said field.
   *
   * If no rule matches and the `Default` field is not specified, throws a
   * States.NoChoiceMatched error.
   */
  private async executeChoiceState(
    stateDefinition: ChoiceState,
    input: JSONValue,
    context: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stateName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const choiceStateHandler = new ChoiceStateHandler(stateDefinition);
    const executionResult = await choiceStateHandler.executeState(input, context);

    return executionResult;
  }

  /**
   * Handler for succeed states.
   *
   * Ends the state machine execution successfully.
   */
  private async executeSucceedState(
    stateDefinition: SucceedState,
    input: JSONValue,
    context: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stateName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const succeedStateHandler = new SucceedStateHandler(stateDefinition);
    const executionResult = await succeedStateHandler.executeState(input, context);

    return executionResult;
  }

  /**
   * Handler for fail states.
   *
   * Ends the state machine execution and marks it as a failure.
   */
  private async executeFailState(
    stateDefinition: FailState,
    input: JSONValue,
    context: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stateName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const failStateHandler = new FailStateHandler(stateDefinition);
    const executionResult = await failStateHandler.executeState(input, context);

    return executionResult;
  }
}

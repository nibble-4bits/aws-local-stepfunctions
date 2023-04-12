import type { AllStates } from '../typings/AllStates';
import type { ExecutionResult } from '../typings/StateActions';
import type { RetryResult, CatchResult, StateHandlers } from '../typings/StateExecutor';
import type { ExecuteOptions } from '../typings/StateMachineImplementation';
import type { ErrorOutput } from '../typings/ErrorHandling';
import type { JSONValue } from '../typings/JSONValue';
import type { TaskState } from '../typings/TaskState';
import type { ParallelState } from '../typings/ParallelState';
import type { MapState } from '../typings/MapState';
import type { PassState } from '../typings/PassState';
import type { WaitState } from '../typings/WaitState';
import type { ChoiceState } from '../typings/ChoiceState';
import type { FailState } from '../typings/FailState';
import type { SucceedState } from '../typings/SucceedState';
import type { RuntimeError } from '../error/RuntimeError';
import type { Context } from '../typings/Context';
import {
  processInputPath,
  processOutputPath,
  processPayloadTemplate,
  processResultPath,
} from './InputOutputProcessing';
import { ChoiceStateAction } from './stateActions/ChoiceStateAction';
import { FailStateAction } from './stateActions/FailStateAction';
import { MapStateAction } from './stateActions/MapStateAction';
import { ParallelStateAction } from './stateActions/ParallelStateAction';
import { PassStateAction } from './stateActions/PassStateAction';
import { SucceedStateAction } from './stateActions/SucceedStateAction';
import { TaskStateAction } from './stateActions/TaskStateAction';
import { WaitStateAction } from './stateActions/WaitStateAction';
import { StatesTimeoutError } from '../error/predefined/StatesTimeoutError';
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
 * The wildcard error. This matches all thrown errors.
 */
const WILDCARD_ERROR = 'States.ALL';

/**
 * The wildcard error for task state failures. This matches all errors thrown by a Task state, except for `States.Timeout`.
 */
const TASK_STATE_WILDCARD_ERROR = 'States.TaskFailed';

/**
 * This class handles the execution of a single state in the state machine, which includes:
 *  - Applying input processing.
 *  - Executing the state action itself.
 *  - Applying output processing.
 *  - If state is retryable, run the retry attempts.
 *  - If state is catchable, transition to next state.
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
  private readonly stateHandlers: StateHandlers;

  constructor(stateName: string, stateDefinition: AllStates) {
    this.stateName = stateName;
    this.stateDefinition = stateDefinition;
    this.retrierAttempts = 'Retry' in this.stateDefinition ? new Array(this.stateDefinition.Retry.length).fill(0) : [];
    this.stateHandlers = {
      Task: this.executeTaskState,
      Parallel: this.executeParallelState,
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
  async execute(input: JSONValue, context: Context, options: ExecuteOptions): Promise<ExecutionResult> {
    const rawInput = cloneDeep(input);

    try {
      const processedInput = this.processInput(input, context);

      const {
        stateResult: currResult,
        nextState,
        isEndState,
      } = await this.stateHandlers[this.stateDefinition.Type](
        // @ts-expect-error Indexing `this.stateActions` by non-literal value produces a `never` type for the `this.stateDefinition` parameter of the handler being called
        this.stateDefinition,
        processedInput,
        context,
        this.stateName,
        options
      );

      const processedResult = this.processResult(currResult, rawInput, context);

      return { stateResult: processedResult, nextState, isEndState };
    } catch (error) {
      // Handle `Retry` logic
      const { shouldRetry, waitTimeBeforeRetry } = this.shouldRetry(error as RuntimeError);
      if (shouldRetry && waitTimeBeforeRetry) {
        await sleep(waitTimeBeforeRetry, options.abortSignal);
        return this.execute(input, context, options);
      }

      // Handle `Catch` logic
      const { nextState, errorOutput, resultPath } = this.catchError(error as RuntimeError);
      if (nextState && errorOutput) {
        return { stateResult: processResultPath(resultPath, rawInput, errorOutput), nextState, isEndState: false };
      }

      throw error;
    }
  }

  /**
   * Process the current input according to the `InputPath` and `Parameters` fields.
   */
  private processInput(input: JSONValue, context: Context): JSONValue {
    let processedInput = input;

    if ('InputPath' in this.stateDefinition) {
      processedInput = processInputPath(this.stateDefinition.InputPath, processedInput, context);
    }

    if ('Parameters' in this.stateDefinition && this.stateDefinition.Type !== 'Map') {
      // `Parameters` field is handled differently in the `Map` state,
      // hence why we omit processing it here.
      processedInput = processPayloadTemplate(this.stateDefinition.Parameters, processedInput, context);
    }

    return processedInput;
  }

  /**
   * Process the current result according to the `ResultSelector`, `ResultPath` and `OutputPath` fields.
   */
  private processResult(result: JSONValue, rawInput: JSONValue, context: Context): JSONValue {
    let processedResult = result;

    if ('ResultSelector' in this.stateDefinition) {
      processedResult = processPayloadTemplate(this.stateDefinition.ResultSelector, processedResult, context);
    }

    if ('ResultPath' in this.stateDefinition) {
      processedResult = processResultPath(this.stateDefinition.ResultPath, rawInput, processedResult);
    }

    if ('OutputPath' in this.stateDefinition) {
      processedResult = processOutputPath(this.stateDefinition.OutputPath, processedResult, context);
    }

    return processedResult;
  }

  /**
   * Decide whether this state should be retried, according to the `Retry` field.
   */
  private shouldRetry(error: RuntimeError): RetryResult {
    if (!('Retry' in this.stateDefinition)) {
      return { shouldRetry: false };
    }

    for (let i = 0; i < this.stateDefinition.Retry.length; i++) {
      const retrier = this.stateDefinition.Retry[i];
      const maxAttempts = retrier.MaxAttempts ?? DEFAULT_MAX_ATTEMPTS;
      const intervalSeconds = retrier.IntervalSeconds ?? DEFAULT_INTERVAL_SECONDS;
      const backoffRate = retrier.BackoffRate ?? DEFAULT_BACKOFF_RATE;
      const waitTimeBeforeRetry = intervalSeconds * Math.pow(backoffRate, this.retrierAttempts[i]) * 1000;
      const retryable = error.isRetryable ?? true;

      for (const retrierError of retrier.ErrorEquals) {
        const isErrorMatch = retrierError === error.name;
        const isErrorWildcard = retrierError === WILDCARD_ERROR;
        const isErrorTaskWildcard =
          retrierError === TASK_STATE_WILDCARD_ERROR &&
          this.stateDefinition.Type === 'Task' &&
          !(error instanceof StatesTimeoutError);

        const maybeShouldRetry = retryable && (isErrorMatch || isErrorWildcard || isErrorTaskWildcard);
        if (maybeShouldRetry) {
          if (this.retrierAttempts[i] >= maxAttempts) return { shouldRetry: false };

          this.retrierAttempts[i]++;

          return { shouldRetry: true, waitTimeBeforeRetry };
        }
      }
    }

    return { shouldRetry: false };
  }

  /**
   * Try to match the current error with a catcher, according to the `Catch` field.
   */
  private catchError(error: RuntimeError): CatchResult {
    if (!('Catch' in this.stateDefinition)) {
      return { nextState: '' };
    }

    for (let i = 0; i < this.stateDefinition.Catch.length; i++) {
      const catcher = this.stateDefinition.Catch[i];
      const catchable = error.isCatchable ?? true;

      for (const catcherError of catcher.ErrorEquals) {
        const isErrorMatch = catcherError === error.name;
        const isErrorWildcard = catcherError === WILDCARD_ERROR;
        const isErrorTaskWildcard =
          catcherError === TASK_STATE_WILDCARD_ERROR &&
          this.stateDefinition.Type === 'Task' &&
          !(error instanceof StatesTimeoutError);

        const shouldCatch = catchable && (isErrorMatch || isErrorWildcard || isErrorTaskWildcard);
        if (shouldCatch) {
          const nextState = catcher.Next;
          const errorOutput: ErrorOutput = {
            Error: error.name,
            Cause: error.message,
          };
          const resultPath = catcher.ResultPath;

          return { nextState, errorOutput, resultPath };
        }
      }
    }

    return { nextState: '' };
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
    context: Context,
    stateName: string,
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const overrideFn = options.runOptions?.overrides?.taskResourceLocalHandlers?.[stateName];

    const taskStateAction = new TaskStateAction(stateDefinition);
    const executionResult = await taskStateAction.execute(input, context, { overrideFn });

    return executionResult;
  }

  /**
   * Handler for parallel states.
   *
   * Creates a new state machine for each of the branches specified in the `Branches` field,
   * and then executes each branch state machine by passing them the Parallel state input.
   */
  private async executeParallelState(
    stateDefinition: ParallelState,
    input: JSONValue,
    context: Context,
    stateName: string,
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const parallelStateAction = new ParallelStateAction(stateDefinition);
    const executionResult = await parallelStateAction.execute(input, context, {
      validationOptions: options.validationOptions,
      runOptions: options.runOptions,
    });

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
    context: Context,
    stateName: string,
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const mapStateAction = new MapStateAction(stateDefinition);
    const executionResult = await mapStateAction.execute(input, context, {
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
    context: Context,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stateName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const passStateAction = new PassStateAction(stateDefinition);
    const executionResult = await passStateAction.execute(input, context);

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
    context: Context,
    stateName: string,
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const waitTimeOverrideOption = options.runOptions?.overrides?.waitTimeOverrides?.[stateName];
    const abortSignal = options.abortSignal;

    const waitStateAction = new WaitStateAction(stateDefinition);
    const executionResult = await waitStateAction.execute(input, context, {
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
    context: Context,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stateName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const choiceStateAction = new ChoiceStateAction(stateDefinition);
    const executionResult = await choiceStateAction.execute(input, context);

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
    context: Context,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stateName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const succeedStateAction = new SucceedStateAction(stateDefinition);
    const executionResult = await succeedStateAction.execute(input, context);

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
    context: Context,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    stateName: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ExecuteOptions
  ): Promise<ExecutionResult> {
    const failStateAction = new FailStateAction(stateDefinition);
    const executionResult = await failStateAction.execute(input, context);

    return executionResult;
  }
}

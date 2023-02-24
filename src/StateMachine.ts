import type { AllStates } from './typings/AllStates';
import type { StateMachineDefinition } from './typings/StateMachineDefinition';
import type { TaskState } from './typings/TaskState';
import type { JSONValue } from './typings/JSONValue';
import type { PassState } from './typings/PassState';
import type { WaitState } from './typings/WaitState';
import type { MapState } from './typings/MapState';
import type { ChoiceState } from './typings/ChoiceState';
import type { SucceedState } from './typings/SucceedState';
import type { FailState } from './typings/FailState';
import type { ExecuteOptions, RunOptions, StateHandler, ValidationOptions } from './typings/StateMachineImplementation';
import type { ExecutionResult } from './typings/StateHandlers';
import { TaskStateHandler } from './stateHandlers/TaskStateHandler';
import { MapStateHandler } from './stateHandlers/MapStateHandler';
import { PassStateHandler } from './stateHandlers/PassStateHandler';
import { WaitStateHandler } from './stateHandlers/WaitStateHandler';
import { ChoiceStateHandler } from './stateHandlers/ChoiceStateHandler';
import { SucceedStateHandler } from './stateHandlers/SucceedStateHandler';
import { FailStateHandler } from './stateHandlers/FailStateHandler';
import {
  processInputPath,
  processOutputPath,
  processPayloadTemplate,
  processResultPath,
} from './InputOutputProcessing';
import aslValidator from 'asl-validator';
import cloneDeep from 'lodash/cloneDeep.js';

export class StateMachine {
  /**
   * The structure of the State Machine as represented by the Amazon States Language.
   */
  private readonly definition: StateMachineDefinition;

  /**
   * A map of functions to execute each type of state.
   */
  private readonly stateExecutors: StateHandler;

  /**
   * Options to control whether to apply certain validations to the state machine definition.
   */
  private readonly validationOptions: ValidationOptions | undefined;

  /**
   * Constructs a new state machine.
   * @param definition The state machine definition defined using the Amazon States Language (https://states-language.net/spec.html).
   * @param validationOptions Options to control whether to apply certain validations to the definition.
   * These options also apply to state machines defined in  the `Iterator` field of `Map` states.
   */
  constructor(definition: StateMachineDefinition, validationOptions?: ValidationOptions) {
    const { isValid, errorsText } = aslValidator(definition, {
      checkArn: true,
      checkPaths: true,
      ...validationOptions,
    });

    if (!isValid) {
      throw new Error(`State machine definition is invalid, see error(s) below:\n ${errorsText('\n')}`);
    }

    this.definition = definition;
    this.stateExecutors = {
      Task: this.executeTaskState,
      Map: this.executeMapState,
      Pass: this.executePassState,
      Wait: this.executeWaitState,
      Choice: this.executeChoiceState,
      Succeed: this.executeSucceedState,
      Fail: this.executeFailState,
    };
    this.validationOptions = validationOptions;
  }

  /**
   * Executes the state machine, running through the states specified in the definition.
   * @param input The input to pass to this state machine execution.
   * @param options Miscellaneous options to control certain behaviors of the execution.
   */
  run(input: JSONValue, options?: RunOptions): { abort: () => void; result: Promise<JSONValue> } {
    const abortController = new AbortController();

    const resolveOnAbort = new Promise<null>((resolve) => {
      abortController.signal.addEventListener('abort', () => resolve(null));
    });

    const executionResult = this.execute(input, {
      runOptions: options,
      abortSignal: abortController.signal,
    });

    const result = Promise.race([executionResult, resolveOnAbort]);

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
    let rawInput = cloneDeep(input);
    let currInput = cloneDeep(input);
    let currResult: JSONValue = null;
    let nextState = '';
    let isEndState = false;
    // eslint-disable-next-line prefer-const
    let context: Record<string, unknown> = {};

    do {
      currInput = this.processInput(currState, currInput, context);
      ({
        stateResult: currResult,
        nextState,
        isEndState,
        // @ts-expect-error Indexing `this.stateHandlers` by non-literal value produces a `never` type for the `stateDefinition` parameter of the handler being called
      } = await this.stateExecutors[currState.Type](currState, currInput, context, currStateName, options));
      currResult = this.processResult(currState, currResult, rawInput, context);

      rawInput = currResult;
      currInput = currResult;

      currState = this.definition.States[nextState];
      currStateName = nextState;
    } while (!isEndState && !options.abortSignal.aborted);

    return currResult;
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
      validationOptions: this.validationOptions,
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

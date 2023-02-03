import type { AllStates } from './typings/AllStates';
import type { StateMachineDefinition } from './typings/StateMachineDefinition';
import type { TaskState } from './typings/TaskState';
import type { JSONValue } from './typings/JSONValue';
import type { PassState } from './typings/PassState';
import type { WaitState } from './typings/WaitState';
import type { MapState } from './typings/MapState';
import type { ChoiceState } from './typings/ChoiceState';
import type { RunOptions, StateHandler, ValidationOptions } from './typings/StateMachineImplementation';
import { JSONPath as jp } from 'jsonpath-plus';
import { testChoiceRule } from './ChoiceHelper';
import aslValidator from 'asl-validator';
import {
  processInputPath,
  processOutputPath,
  processPayloadTemplate,
  processResultPath,
} from './InputOutputProcessing';
import { TaskStateHandler } from './stateHandlers/TaskStateHandler';
import { MapStateHandler } from './stateHandlers/MapStateHandler';
import { PassStateHandler } from './stateHandlers/PassStateHandler';
import { WaitStateHandler } from './stateHandlers/WaitStateHandler';

export class StateMachine {
  /**
   * The name of the state currently being executed.
   */
  private currStateName: string;

  /**
   * The current state being executed.
   */
  private currState: AllStates;

  /**
   * The unmodified input to the current state.
   */
  private rawInput: JSONValue;

  /**
   * The input that can be modified according to the `InputPath` and `Parameters` fields of the current state.
   */
  private currInput: JSONValue;

  /**
   * The result that can be modified according to the `ResultSelector`, `ResultPath` and `OutputPath` fields of the current state.
   */
  private currResult: JSONValue;

  /**
   * The context object of the state machine.
   */
  private context: Record<string, unknown>;

  /**
   * A map of all states defined in the state machine.
   */
  private readonly states: Record<string, AllStates>;

  /**
   * A map of functions to handle each type of state.
   */
  private readonly stateHandlers: StateHandler;

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

    this.states = definition.States;
    this.currStateName = definition.StartAt;
    this.currState = this.states[this.currStateName];
    this.rawInput = {};
    this.currInput = {};
    this.currResult = null;
    this.context = {};
    this.stateHandlers = {
      Task: this.handleTaskState.bind(this),
      Map: this.handleMapState.bind(this),
      Pass: this.handlePassState.bind(this),
      Wait: this.handleWaitState.bind(this),
      Choice: this.handleChoiceState.bind(this),
      Succeed: this.handleSucceedState.bind(this),
      Fail: this.handleFailState.bind(this),
    };
    this.validationOptions = validationOptions;
  }

  /**
   * Executes the state machine, running through the states specified in the definiton.
   * @param input The input to pass to this state machine execution.
   * @param options Miscellaneous options to control certain behaviors of the execution.
   */
  async run(input: JSONValue, options?: RunOptions): Promise<JSONValue> {
    this.rawInput = input;
    this.currInput = input;

    let isEndState = false;
    do {
      this.currState = this.states[this.currStateName];

      this.processInput();

      await this.stateHandlers[this.currState.Type](options);

      this.processResult();

      this.rawInput = this.currResult;
      this.currInput = this.currResult;

      if ('Next' in this.currState) {
        this.currStateName = this.currState.Next;
      }

      if ('End' in this.currState || this.currState.Type === 'Succeed' || this.currState.Type === 'Fail') {
        isEndState = true;
      }
    } while (!isEndState);

    return this.currResult;
  }

  /**
   * Process the current input according to the `InputPath` and `Parameters` fields.
   */
  private processInput(): void {
    if ('InputPath' in this.currState) {
      this.currInput = processInputPath(this.currState.InputPath, this.currInput, this.context);
    }

    if ('Parameters' in this.currState && this.currState.Type !== 'Map') {
      // `Parameters` field is handled differently in the `Map` state,
      // hence why we omit processing it here.
      this.currInput = processPayloadTemplate(this.currState.Parameters, this.currInput, this.context);
    }
  }

  /**
   * Process the current result according to the `ResultSelector`, `ResultPath` and `OutputPath` fields.
   */
  private processResult(): void {
    if ('ResultSelector' in this.currState) {
      this.currResult = processPayloadTemplate(this.currState.ResultSelector, this.currResult, this.context);
    }

    if ('ResultPath' in this.currState) {
      this.currResult = processResultPath(this.currState.ResultPath, this.rawInput, this.currResult);
    }

    if ('OutputPath' in this.currState) {
      this.currResult = processOutputPath(this.currState.OutputPath, this.currResult, this.context);
    }
  }

  /**
   * Handler for task states.
   *
   * Invokes the Lambda function specified in the `Resource` field
   * and sets the current result of the state machine to the value returned by the Lambda.
   */
  private async handleTaskState(options?: RunOptions): Promise<void> {
    const overrideFn = options?.overrides?.taskResourceLocalHandlers?.[this.currStateName];

    const taskStateHandler = new TaskStateHandler(this.currState as TaskState);
    const { stateResult } = await taskStateHandler.executeState(this.currInput, this.context, { overrideFn });

    this.currResult = stateResult;
  }

  /**
   * Handler for map states.
   *
   * Iterates over the current input items or the items of an array specified
   * by the `ItemsPath` field, and then processes each item by passing it
   * as the input to the state machine specified in the `Iterator` field.
   */
  private async handleMapState(options?: RunOptions): Promise<void> {
    const mapStateHandler = new MapStateHandler(this.currState as MapState);
    const { stateResult } = await mapStateHandler.executeState(this.currInput, this.context, {
      validationOptions: this.validationOptions,
      runOptions: options,
    });

    this.currResult = stateResult;
  }

  /**
   * Handler for pass states.
   *
   * If the `Result` field is specified, copies `Result` into the current result.
   * Else, copies the current input into the current result.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handlePassState(_options?: RunOptions): Promise<void> {
    const passStateHandler = new PassStateHandler(this.currState as PassState);
    const { stateResult } = await passStateHandler.executeState(this.currInput, this.context);

    this.currResult = stateResult;
  }

  /**
   * Handler for wait states.
   *
   * Pauses the state machine execution for a certain amount of time
   * based on one of the `Seconds`, `Timestamp`, `SecondsPath` or `TimestampPath` fields.
   */
  private async handleWaitState(options?: RunOptions): Promise<void> {
    const waitTimeOverrideOption = options?.overrides?.waitTimeOverrides?.[this.currStateName];

    const waitStateHandler = new WaitStateHandler(this.currState as WaitState);
    const { stateResult } = await waitStateHandler.executeState(this.currInput, this.context, {
      waitTimeOverrideOption,
    });

    this.currResult = stateResult;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleChoiceState(_options?: RunOptions): Promise<void> {
    const state = this.currState as ChoiceState;

    for (const choice of state.Choices) {
      const choiceIsMatch = testChoiceRule(choice, this.currInput, this.jsonQuery);
      if (choiceIsMatch) {
        this.currStateName = choice.Next;
        this.currResult = this.currInput;
        return;
      }
    }

    if (state.Default) {
      this.currStateName = state.Default;
      this.currResult = this.currInput;
      return;
    }

    // TODO: Throw States.NoChoiceMatched error here because all choices failed to match and no `Default` field was specified.
  }

  /**
   * Handler for succeed states.
   *
   * Ends the state machine execution successfully.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleSucceedState(_options?: RunOptions): Promise<void> {
    this.currResult = this.currInput;
  }

  /**
   * Handler for fail states.
   *
   * Ends the state machine execution and marks it as a failure.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handleFailState(_options?: RunOptions): Promise<void> {
    // TODO: Implement behavior of Fail state
  }

  /**
   * Queries for a property in an object using a JSONPath expression.
   * @param pathExpression The JSONPath expression to query for.
   * @param json The object to evaluate (whether of null, boolean, number, string, object, or array type).
   * @returns The value of the property that was queried for, if found. Otherwise returns `undefined`.
   */
  // TODO: Remove this method once the `ChoiceStateHandler` class is implemented.
  private jsonQuery(pathExpression: string, json: JSONValue): any {
    // If the expression starts with double `$$`, evaluate the path in the context object.
    if (pathExpression.startsWith('$$')) {
      return jp({ path: pathExpression.slice(1), json: this.context, wrap: false });
    }

    return jp({ path: pathExpression, json, wrap: false });
  }
}

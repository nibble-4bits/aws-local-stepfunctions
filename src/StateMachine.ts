import type { AllStates } from './typings/AllStates';
import type { StateMachineDefinition } from './typings/StateMachineDefinition';
import type { TaskState } from './typings/TaskState';
import type { PayloadTemplate } from './typings/InputOutputProcessing';
import type { JSONValue } from './typings/JSONValue';
import type { PassState } from './typings/PassState';
import type { WaitState } from './typings/WaitState';
import type { MapState } from './typings/MapState';
import type { ChoiceState } from './typings/ChoiceState';
import type { RunOptions, StateHandler, ValidationOptions } from './typings/StateMachineImplementation';
import { JSONPath as jp } from 'jsonpath-plus';
import { isPlainObj, sleep } from './util';
import { LambdaClient } from './aws/LambdaClient';
import { LambdaExecutionError } from './error/LambdaExecutionError';
import { testChoiceRule } from './ChoiceHelper';
import aslValidator from 'asl-validator';
import set from 'lodash/set.js';
import cloneDeep from 'lodash/cloneDeep.js';

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
   * Process the current input according to the path defined in the `InputPath` field, if specified in the current state.
   * @returns
   * * If `InputPath` is not specified, returns the current input unmodified.
   * * If `InputPath` is `null`, returns an empty object (`{}`).
   * * If `InputPath` is a string, it's considered a JSONPath and the selected portion of the current input is returned.
   */
  private processInputPath(): JSONValue {
    if ('InputPath' in this.currState) {
      if (this.currState.InputPath === null) {
        return {};
      }

      return this.jsonQuery(this.currState.InputPath!, this.currInput);
    }

    return this.currInput;
  }

  /**
   * Recursively process a payload template to resolve the properties that are JSONPaths.
   * @param payloadTemplate The payload template to process.
   * @param json The object to evaluate with JSONPath (whether of null, boolean, number, string, object, or array type).
   * @returns The processed payload template.
   */
  private processPayloadTemplate(payloadTemplate: PayloadTemplate, json: JSONValue): PayloadTemplate {
    const resolvedProperties = Object.entries(payloadTemplate).map(([key, value]) => {
      let sanitizedKey = key;
      let resolvedValue = value;

      // Recursively process child object
      if (isPlainObj(value)) {
        resolvedValue = this.processPayloadTemplate(value, json);
      }

      // Only resolve value if key ends with `.$` and value is a string
      if (key.endsWith('.$') && typeof value === 'string') {
        sanitizedKey = key.replace('.$', '');
        resolvedValue = this.jsonQuery(value, json);
      }

      return [sanitizedKey, resolvedValue];
    });

    return Object.fromEntries(resolvedProperties);
  }

  /**
   * Process the current input according to the `InputPath` and `Parameters` fields.
   */
  private processInput(): void {
    this.currInput = this.processInputPath();
    if ('Parameters' in this.currState && this.currState.Type !== 'Map') {
      // `Parameters` field is handled differently in the `Map` state,
      // hence why we omit processing it here.
      this.currInput = this.processPayloadTemplate(this.currState.Parameters!, this.currInput);
    }
  }

  /**
   * Process the current result according to the path defined in the `ResultPath` field, if specified in the current state.
   * @returns
   * * If `ResultPath` is not specified, returns the current result unmodified.
   * * If `ResultPath` is `null`, returns the raw input (i.e. the input passed to current state).
   * * If `ResultPath` is a string, it's considered a JSONPath and returns a combination of the raw input with the current result,
   * by placing the current result in the specified path.
   */
  private processResultPath(): JSONValue {
    if ('ResultPath' in this.currState) {
      if (this.currState.ResultPath === null) {
        return this.rawInput;
      }

      const sanitizedPath = this.currState.ResultPath!.replace('$.', '');
      if (isPlainObj(this.rawInput)) {
        const clonedRawInput = cloneDeep(this.rawInput) as object;
        return set(clonedRawInput, sanitizedPath, this.currResult);
      } else {
        // TODO: throw exception since rawInput is not an object, thus ResultPath won't work.
      }
    }

    return this.currResult;
  }

  /**
   * Process the current result according to the path defined in the `OutputPath` field, if specified in the current state.
   * @returns
   * * If `OutputPath` is not specified, returns the current result unmodified.
   * * If `OutputPath` is `null`, returns an empty object (`{}`).
   * * If `OutputPath` is a string, it's considered a JSONPath and the selected portion of the current result is returned.
   */
  private processOutputPath(): JSONValue {
    if ('OutputPath' in this.currState) {
      if (this.currState.OutputPath === null) {
        return {};
      }

      return this.jsonQuery(this.currState.OutputPath!, this.currResult);
    }

    return this.currResult;
  }

  /**
   * Process the current result according to the `ResultSelector`, `ResultPath` and `OutputPath` fields.
   */
  private processResult(): void {
    if ('ResultSelector' in this.currState) {
      this.currResult = this.processPayloadTemplate(this.currState.ResultSelector!, this.currResult);
    }

    this.currResult = this.processResultPath();

    this.currResult = this.processOutputPath();
  }

  /**
   * Handler for task states.
   *
   * Invokes the Lambda function specified in the `Resource` field
   * and sets the current result of the state machine to the value returned by the Lambda.
   */
  private async handleTaskState(options?: RunOptions): Promise<void> {
    const state = this.currState as TaskState;
    const lambdaClient = new LambdaClient();
    const overrideFn = options?.overrides?.taskResourceLocalHandlers?.[this.currStateName];

    try {
      // If local override for task resource is defined, use that
      if (overrideFn) {
        const result = await overrideFn(this.currInput);
        this.currResult = result;
        return;
      }

      const result = await lambdaClient.invokeFunction(state.Resource, this.currInput);
      this.currResult = result;
    } catch (error) {
      if (error instanceof LambdaExecutionError) {
        console.error(error.toString());
      } else {
        console.error(error);
      }

      throw error;
    }
  }

  /**
   * Handler for map states.
   *
   * Iterates over the current input items or the items of an array specified
   * by the `ItemsPath` field, and then processes each item by passing it
   * as the input to the state machine specified in the `Iterator` field.
   */
  private async handleMapState(options?: RunOptions): Promise<void> {
    const state = this.currState as MapState;

    let items = this.currInput;
    if (state.ItemsPath) {
      items = this.jsonQuery(state.ItemsPath, this.currInput);
    }

    if (!Array.isArray(items)) {
      // TODO: throw error instead of returning, because current input is not an array.
      return;
    }

    const result = new Array(items.length);
    let paramValue;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      this.context['Map'] = {
        Item: {
          Index: i,
          Value: item,
        },
      };

      // Handle `Parameters` field if specified
      if (state.Parameters) {
        paramValue = this.processPayloadTemplate(state.Parameters, this.currInput);
      }

      // Pass the current parameter value if defined, otherwise pass the current item being iterated
      const mapStateMachine = new StateMachine(state.Iterator, this.validationOptions);
      result[i] = await mapStateMachine.run(paramValue ?? item, options);
    }

    delete this.context['Map'];
    this.currResult = result;
  }

  /**
   * Handler for pass states.
   *
   * If the `Result` field is specified, copies `Result` into the current result.
   * Else, copies the current input into the current result.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async handlePassState(_options?: RunOptions): Promise<void> {
    const state = this.currState as PassState;

    if (state.Result) {
      this.currResult = state.Result;
    } else {
      this.currResult = this.currInput;
    }
  }

  /**
   * Handler for wait states.
   *
   * Pauses the state machine execution for a certain amount of time
   * based on one of the `Seconds`, `Timestamp`, `SecondsPath` or `TimestampPath` fields.
   */
  private async handleWaitState(options?: RunOptions): Promise<void> {
    const state = this.currState as WaitState;
    const waitTimeOverrideOption = options?.overrides?.waitTimeOverrides?.[this.currStateName];

    if (waitTimeOverrideOption) {
      // If the wait time override is set, sleep for the specified number of milliseconds
      await sleep(waitTimeOverrideOption);
      this.currResult = this.currInput;
      return;
    }

    if (state.Seconds) {
      await sleep(state.Seconds * 1000);
    } else if (state.Timestamp) {
      const dateTimestamp = new Date(state.Timestamp);
      const currentTime = Date.now();
      const timeDiff = dateTimestamp.getTime() - currentTime;

      await sleep(timeDiff);
    } else if (state.SecondsPath) {
      const seconds = this.jsonQuery(state.SecondsPath, this.currInput);
      await sleep(seconds * 1000);
    } else if (state.TimestampPath) {
      const timestamp = this.jsonQuery(state.TimestampPath, this.currInput);
      const dateTimestamp = new Date(timestamp);
      const currentTime = Date.now();
      const timeDiff = dateTimestamp.getTime() - currentTime;

      await sleep(timeDiff);
    }

    this.currResult = this.currInput;
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
  private jsonQuery(pathExpression: string, json: JSONValue): any {
    // If the expression starts with double `$$`, evaluate the path in the context object.
    if (pathExpression.startsWith('$$')) {
      return jp({ path: pathExpression.slice(1), json: this.context, wrap: false });
    }

    return jp({ path: pathExpression, json, wrap: false });
  }
}

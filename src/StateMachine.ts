import { exit } from 'process';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import { JSONPath as jp } from 'jsonpath-plus';
import { AllStates } from './typings/AllStates';
import { StateMachineDefinition } from './typings/StateMachineDefinition';
import { StateType } from './typings/StateType';
import { isPlainObj } from './util';
import { LambdaClient } from './aws/LambdaClient';
import { TaskState } from './typings/TaskState';
import { LambdaExecutionError } from './error/LambdaExecutionError';
import { PayloadTemplate } from './typings/InputOutputProcessing';

type StateHandler = {
  [T in StateType]: () => Promise<void>;
};

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
  private rawInput: Record<string, unknown>;

  /**
   * The input that can be modified according to the `InputPath` and `Parameters` fields of the current state.
   */
  private currInput: Record<string, unknown>;

  /**
   * The result that can be modified according to the `ResultSelector`, `ResultPath` and `OutputPath` fields of the current state.
   */
  private currResult: unknown;

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
   * Constructs a new state machine.
   * @param definition The state machine definition declared using the Amazon States Language (https://states-language.net/spec.html).
   * @param input The input to the state machine.
   */
  constructor(definition: StateMachineDefinition, input: Record<string, unknown>) {
    this.states = definition.States;
    this.currStateName = definition.StartAt;
    this.currState = this.states[this.currStateName];
    this.rawInput = input;
    this.currInput = this.rawInput;
    this.currResult = null;
    this.context = {};
    this.stateHandlers = {
      Task: this.handleTaskState.bind(this),
      Map: () => Promise.resolve(),
      Pass: () => Promise.resolve(),
      Wait: () => Promise.resolve(),
      Choice: () => Promise.resolve(),
      Succeed: () => Promise.resolve(),
      Fail: () => Promise.resolve(),
    };
  }

  /**
   * Executes the state machine, running through the states specified in the definiton.
   */
  async run() {
    let isEndState = false;

    do {
      this.currState = this.states[this.currStateName];

      this.processInput();

      await this.stateHandlers[this.currState.Type]();

      this.processResult();

      if ('Next' in this.currState) {
        this.currStateName = this.currState.Next;
      }

      if ('End' in this.currState || this.currState.Type === 'Succeed' || this.currState.Type === 'Fail') {
        isEndState = true;
      }
    } while (!isEndState);
  }

  /**
   * Process the current input according to the path defined in the `InputPath` field, if specified in the current state.
   * @returns
   * * If `InputPath` is not specified, returns the current input unmodified.
   * * If `InputPath` is `null`, returns an empty object (`{}`).
   * * If `InputPath` is a string, it's considered a JSONPath and the selected portion of the current input is returned.
   */
  private processInputPath() {
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
   * @param json The object to evaluate with JSONPath.
   * @returns The processed payload template.
   */
  private processPayloadTemplate(payloadTemplate: PayloadTemplate, json: Record<string, unknown>) {
    const resolvedProperties = Object.entries(payloadTemplate).map(([key, value]) => {
      let sanitizedKey = key;
      let resolvedValue = value;

      // Recursively process child object
      if (isPlainObj(value)) {
        resolvedValue = this.processPayloadTemplate(value as Record<string, unknown>, json);
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
  private processInput() {
    this.currInput = this.processInputPath();
    if ('Parameters' in this.currState) {
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
  private processResultPath() {
    if ('ResultPath' in this.currState) {
      if (this.currState.ResultPath === null) {
        return this.rawInput;
      }

      const sanitizedPath = this.currState.ResultPath!.replace('$.', '');
      return set(cloneDeep(this.rawInput), sanitizedPath, this.currResult);
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
  private processOutputPath() {
    if ('OutputPath' in this.currState) {
      if (this.currState.OutputPath === null) {
        return {};
      }

      return this.jsonQuery(this.currState.OutputPath!, this.currResult as Record<string, unknown>);
    }

    return this.currResult;
  }

  /**
   * Process the current result according to the `ResultSelector`, `ResultPath` and `OutputPath` fields.
   */
  private processResult() {
    if ('ResultSelector' in this.currState) {
      this.currResult = this.processPayloadTemplate(
        this.currState.ResultSelector!,
        this.currResult as Record<string, unknown>
      );
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
  private async handleTaskState() {
    const state = this.currState as TaskState;
    const lambdaClient = new LambdaClient();

    try {
      const result = await lambdaClient.invokeFunction(state.Resource, this.currInput);
      this.currResult = result;
    } catch (error) {
      if (error instanceof LambdaExecutionError) {
        console.error(error.toString());
      } else {
        console.error(error);
      }

      exit(1);
    }
  }

  /**
   * Queries for a property in an object using a JSONPath expression.
   * @param pathExpression The JSONPath expression to query for.
   * @param json The object to evaluate.
   * @returns The value of the property that was queried for, if found. Otherwise returns `undefined`.
   */
  private jsonQuery(pathExpression: string, json: Record<string, unknown>) {
    // If the expression starts with double `$$`, evaluate the path in the context object.
    if (pathExpression.startsWith('$$')) {
      return jp({ path: pathExpression.slice(1), json: this.context, wrap: false });
    }

    return jp({ path: pathExpression, json, wrap: false });
  }
}

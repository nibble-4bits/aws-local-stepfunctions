import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import { JSONPath as jp } from 'jsonpath-plus';
import { AllStates } from './typings/AllStates';
import { StateMachineDefinition } from './typings/StateMachineDefinition';
import { StateType } from './typings/StateType';
import { isPlainObj } from './util';

type StateHandler = {
  [T in StateType]: () => Promise<void>;
};

export class StateMachine {
  private currStateName: string;
  private currState: AllStates;
  private rawInput: Record<string, unknown>;
  private currInput: Record<string, unknown>;
  private currResult: unknown;
  private context: Record<string, unknown>;
  private readonly states: Record<string, AllStates>;
  private readonly stateHandlers: StateHandler;

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

  private processInputPath() {
    if ('InputPath' in this.currState) {
      if (this.currState.InputPath === null) {
        return {};
      }

      return this.jsonQuery(this.currState.InputPath!, this.currInput);
    }

    return this.currInput;
  }

  private processPayloadTemplate(payloadTemplate: Record<string, unknown>, json: Record<string, unknown>) {
    const resolvedProperties = Object.entries(payloadTemplate).map(([key, value]) => {
      let sanitizedKey = key;
      let resolvedValue = value;

      if (isPlainObj(value)) {
        resolvedValue = this.processPayloadTemplate(value as Record<string, unknown>, json);
      }

      if (key.endsWith('.$') && typeof value === 'string') {
        sanitizedKey = key.replace('.$', '');
        resolvedValue = this.jsonQuery(value, json);
      }

      return [sanitizedKey, resolvedValue];
    });

    return Object.fromEntries(resolvedProperties);
  }

  private processInput() {
    this.currInput = this.processInputPath();
    if ('Parameters' in this.currState) {
      this.currInput = this.processPayloadTemplate(this.currState.Parameters!, this.currInput);
    }
  }

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

  private processOutputPath() {
    if ('OutputPath' in this.currState) {
      if (this.currState.OutputPath === null) {
        return {};
      }

      return this.jsonQuery(this.currState.OutputPath!, this.currResult as Record<string, unknown>);
    }

    return this.currResult;
  }

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

  private async handleTaskState() {
    // TODO: Implement task state handler
  }

  private jsonQuery(pathExpression: string, json: Record<string, unknown>) {
    if (pathExpression.startsWith('$$')) {
      return jp({ path: pathExpression.slice(1), json: this.context, wrap: false });
    }

    return jp({ path: pathExpression, json, wrap: false });
  }
}

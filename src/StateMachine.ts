import { JSONPath as jp } from 'jsonpath-plus';
import { AllStates } from './typings/AllStates';
import { StateMachineDefinition } from './typings/StateMachineDefinition';
import { StateType } from './typings/StateType';

type StateHandler = {
  [T in StateType]: () => Promise<void>;
};

export class StateMachine {
  private currStateName: string;
  private currState: AllStates;
  private currInput: Record<string, unknown>;
  private context: Record<string, unknown>;
  private readonly states: Record<string, AllStates>;
  private readonly stateHandlers: StateHandler;

  constructor(definition: StateMachineDefinition, input: Record<string, unknown>) {
    this.states = definition.States;
    this.currStateName = definition.StartAt;
    this.currState = this.states[this.currStateName];
    this.currInput = input;
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

      await this.stateHandlers[this.currState.Type]();

      if ('Next' in this.currState) {
        this.currStateName = this.currState.Next;
      }

      if ('End' in this.currState || this.currState.Type === 'Succeed' || this.currState.Type === 'Fail') {
        isEndState = true;
      }
    } while (!isEndState);
  }

  async handleTaskState() {
    // TODO: Implement task state handler
  }

  jsonQuery(pathExpression: string) {
    if (pathExpression.startsWith('$$')) {
      return jp({ path: pathExpression.slice(1), json: this.context });
    }

    return jp({ path: pathExpression, json: this.currInput });
  }
}

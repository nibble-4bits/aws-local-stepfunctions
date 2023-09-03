import type { IntermediateState } from '../../typings/IntermediateState';
import type { TerminalState } from '../../typings/TerminalState';
import type { JSONValue } from '../../typings/JSONValue';
import type { BaseState } from '../../typings/BaseState';
import type { ExecutionResult } from '../../typings/StateActions';
import type { Context } from '../../typings/Context';

abstract class BaseStateAction<T extends BaseState | IntermediateState | TerminalState> {
  protected stateDefinition: T;
  protected stateName: string;

  constructor(stateDefinition: T, stateName: string) {
    this.stateDefinition = stateDefinition;
    this.stateName = stateName;
  }

  protected buildExecutionResult(stateResult: JSONValue): ExecutionResult {
    const executionResult: ExecutionResult = { stateResult, nextState: '', isEndState: false };

    if ('Next' in this.stateDefinition) {
      executionResult.nextState = this.stateDefinition.Next;
    }

    if ('End' in this.stateDefinition) {
      executionResult.isEndState = this.stateDefinition.End;
    }

    return executionResult;
  }

  abstract execute(input: JSONValue, context: Context, options?: Record<string, unknown>): Promise<ExecutionResult>;
}

export { BaseStateAction };

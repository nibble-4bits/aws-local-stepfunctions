import type { IntermediateState } from '../typings/IntermediateState';
import type { TerminalState } from '../typings/TerminalState';
import type { JSONValue } from '../typings/JSONValue';
import type { BaseState } from '../typings/BaseState';

export interface ExecutionResult {
  stateResult: JSONValue;
  nextState?: string;
  isEndState?: boolean;
}

abstract class BaseStateHandler<T extends BaseState | IntermediateState | TerminalState> {
  protected stateDefinition: T;

  constructor(stateDefinition: T) {
    this.stateDefinition = stateDefinition;
  }

  protected buildExecutionResult(stateResult: JSONValue) {
    const executionResult: ExecutionResult = { stateResult };

    if ('Next' in this.stateDefinition) {
      executionResult.nextState = this.stateDefinition.Next;
    } else if ('End' in this.stateDefinition) {
      executionResult.isEndState = this.stateDefinition.End;
    }

    return executionResult;
  }

  abstract executeState(
    input: JSONValue,
    context: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<ExecutionResult>;
}

export { BaseStateHandler };

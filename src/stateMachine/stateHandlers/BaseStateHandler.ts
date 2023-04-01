import type { IntermediateState } from '../../typings/IntermediateState';
import type { TerminalState } from '../../typings/TerminalState';
import type { JSONValue } from '../../typings/JSONValue';
import type { BaseState } from '../../typings/BaseState';
import type { ExecutionResult } from '../../typings/StateHandlers';

abstract class BaseStateHandler<T extends BaseState | IntermediateState | TerminalState> {
  protected stateDefinition: T;

  constructor(stateDefinition: T) {
    this.stateDefinition = stateDefinition;
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

  abstract executeState(
    input: JSONValue,
    context: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<ExecutionResult>;
}

export { BaseStateHandler };

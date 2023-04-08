import type { AllStates } from './AllStates';
import type { ErrorOutput } from './ErrorHandling';
import type { JSONValue } from './JSONValue';
import type { ExecutionResult } from './StateActions';
import type { ExecuteOptions } from './StateMachineImplementation';

export type StateHandlers = {
  [T in AllStates as T['Type']]: (
    stateDefinition: T,
    input: JSONValue,
    context: Record<string, unknown>,
    stateName: string,
    options: ExecuteOptions
  ) => Promise<ExecutionResult>;
};

export type RetryResult = {
  shouldRetry: boolean;
  waitTimeBeforeRetry?: number;
};

export type CatchResult = {
  nextState: string;
  errorOutput?: ErrorOutput;
  resultPath?: string | undefined;
};

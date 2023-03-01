import type { AllStates } from './AllStates';
import type { JSONValue } from './JSONValue';
import type { ExecutionResult } from './StateHandlers';

type TaskStateResourceLocalHandler = {
  [taskStateName: string]: (input: JSONValue) => Promise<JSONValue>;
};

type WaitStateTimeOverride = {
  [waitStateName: string]: number;
};

interface Overrides {
  taskResourceLocalHandlers?: TaskStateResourceLocalHandler;
  waitTimeOverrides?: WaitStateTimeOverride;
}

export interface ValidationOptions {
  readonly checkPaths?: boolean;
  readonly checkArn?: boolean;
}

export interface RunOptions {
  overrides?: Overrides;
  noThrowOnAbort?: boolean;
}

export interface ExecuteOptions {
  validationOptions: ValidationOptions | undefined;
  runOptions: RunOptions | undefined;
  abortSignal: AbortSignal;
}

export type StateExecutors = {
  [T in AllStates as T['Type']]: (
    stateDefinition: T,
    input: JSONValue,
    context: Record<string, unknown>,
    stateName: string,
    options: ExecuteOptions
  ) => Promise<ExecutionResult>;
};

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

export interface RunOptions {
  overrides?: Overrides;
}

export type StateHandler = {
  [T in AllStates as T['Type']]: (
    stateDefinition: T,
    input: JSONValue,
    context: Record<string, unknown>,
    stateName: string,
    options?: RunOptions
  ) => Promise<ExecutionResult>;
};

export interface ValidationOptions {
  readonly checkPaths?: boolean;
  readonly checkArn?: boolean;
}

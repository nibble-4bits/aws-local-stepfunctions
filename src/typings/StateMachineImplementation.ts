import type { JSONValue } from './JSONValue';

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

export interface StateMachineOptions {
  validationOptions: ValidationOptions;
}

export interface RunOptions {
  overrides?: Overrides;
  noThrowOnAbort?: boolean;
}

export interface ExecuteOptions {
  stateMachineOptions: StateMachineOptions | undefined;
  runOptions: RunOptions | undefined;
  abortSignal: AbortSignal;
}

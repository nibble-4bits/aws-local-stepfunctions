import type { StateType } from './StateType';

type TaskStateResourceLocalHandler = {
  [taskStateName: string]: (...args: any) => any;
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
  [T in StateType]: (options?: RunOptions) => Promise<void>;
};

export interface ValidationOptions {
  readonly checkPaths?: boolean;
  readonly checkArn?: boolean;
}

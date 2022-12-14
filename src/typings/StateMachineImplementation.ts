import type { StateType } from './StateType';

type TaskStateResourceLocalOverrides = {
  [taskStateName: string]: (...args: any) => any;
};

interface Overrides {
  taskResourceLocalOverrides?: TaskStateResourceLocalOverrides;
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

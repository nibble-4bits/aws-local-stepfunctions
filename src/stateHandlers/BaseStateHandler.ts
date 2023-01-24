import type { BaseState } from '../typings/BaseState';
import type { JSONValue } from '../typings/JSONValue';
import type { ValidationOptions, RunOptions } from '../typings/StateMachineImplementation';

export type TaskStateHandlerOptions = {
  overrideFn: ((...args: any) => any) | undefined;
};

export type MapStateHandlerOptions = {
  validationOptions: ValidationOptions | undefined;
  runOptions: RunOptions | undefined;
};

export type PassStateHandlerOptions = Record<string, unknown>;

export type WaitStateHandlerOptions = {
  waitTimeOverrideOption: number | undefined;
};

abstract class BaseStateHandler<T extends BaseState> {
  protected stateDefinition: T;

  constructor(stateDefinition: T) {
    this.stateDefinition = stateDefinition;
  }

  abstract executeState(
    input: JSONValue,
    context: Record<string, unknown>,
    options?: TaskStateHandlerOptions | MapStateHandlerOptions | PassStateHandlerOptions | WaitStateHandlerOptions
  ): Promise<JSONValue>;
}

export { BaseStateHandler };

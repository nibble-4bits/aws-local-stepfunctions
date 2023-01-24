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

abstract class BaseStateHandler {
  protected stateDefinition: BaseState;

  constructor(stateDefinition: BaseState) {
    this.stateDefinition = stateDefinition;
  }

  abstract executeState(
    input: JSONValue,
    context: Record<string, unknown>,
    options?: TaskStateHandlerOptions | MapStateHandlerOptions
  ): Promise<JSONValue>;
}

export { BaseStateHandler };

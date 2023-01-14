import type { BaseState } from '../typings/BaseState';
import type { JSONValue } from '../typings/JSONValue';

export type TaskStateHandlerOptions = {
  overrideFn: ((...args: any) => any) | undefined;
};

abstract class BaseStateHandler {
  protected stateDefinition: BaseState;

  constructor(stateDefinition: BaseState) {
    this.stateDefinition = stateDefinition;
  }

  abstract executeState(input: JSONValue, options?: TaskStateHandlerOptions): Promise<JSONValue>;
}

export { BaseStateHandler };

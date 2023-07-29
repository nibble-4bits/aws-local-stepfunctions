import type { Context } from './Context';
import type { StateMachineDefinition } from './StateMachineDefinition';
import type { TaskStateResourceLocalHandler, WaitStateTimeOverride } from './StateMachineImplementation';

export type ParsedCommandOptions = {
  definition: StateMachineDefinition;
  definitionFile: StateMachineDefinition;
  overrideTask: TaskStateResourceLocalHandler;
  overrideWait: WaitStateTimeOverride;
  context: Context;
  contextFile: Context;
  jsonpathValidation: boolean;
  arnValidation: boolean;
};

export enum ExitCodes {
  Success,
  /**
   * Represents the failure of the command before it could run an execution, e.g. if argument parsing failed.
   */
  PreExecutionFailure,
  /**
   * Represents the failure of the command because any of the executions failed.
   */
  StateMachineExecutionFailure,
}

import type { StateMachineDefinition } from './StateMachineDefinition';
import type { TaskStateResourceLocalHandler, WaitStateTimeOverride } from './StateMachineImplementation';

export type ParsedCommandOptions = {
  definition: StateMachineDefinition;
  definitionFile: StateMachineDefinition;
  overrideTask: TaskStateResourceLocalHandler;
  overrideWait: WaitStateTimeOverride;
  jsonpathValidation: boolean;
  arnValidation: boolean;
};

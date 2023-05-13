import type { StateMachineDefinition } from '../typings/StateMachineDefinition';
import type { TaskStateResourceLocalHandler, WaitStateTimeOverride } from '../typings/StateMachineImplementation';
import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';

function parseDefinitionOption(definition: string): StateMachineDefinition {
  return JSON.parse(definition);
}

function parseDefinitionFileOption(definitionFile: string): StateMachineDefinition {
  const file = readFileSync(definitionFile).toString();
  return JSON.parse(file);
}

function parseOverrideTaskOption(
  value: string,
  previous: TaskStateResourceLocalHandler = {}
): TaskStateResourceLocalHandler {
  const [taskStateName, scriptPath] = value.split(':');

  previous[taskStateName] = (input) => {
    const spawnResult = spawnSync(scriptPath, [JSON.stringify(input)]);
    return JSON.parse(spawnResult.stdout.toString());
  };

  return previous;
}

function parseOverrideWaitOption(value: string, previous: WaitStateTimeOverride = {}): WaitStateTimeOverride {
  const [waitStateName, duration] = value.split(':');

  previous[waitStateName] = Number(duration);

  return previous;
}

function parseInputArguments(value: string, previous: string[] = []) {
  return previous.concat(JSON.parse(value));
}

export {
  parseDefinitionOption,
  parseDefinitionFileOption,
  parseOverrideTaskOption,
  parseOverrideWaitOption,
  parseInputArguments,
};

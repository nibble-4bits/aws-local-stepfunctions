import type { Command } from 'commander';
import type { StateMachineDefinition } from '../typings/StateMachineDefinition';
import type { TaskStateResourceLocalHandler, WaitStateTimeOverride } from '../typings/StateMachineImplementation';
import type { JSONValue } from '../typings/JSONValue';
import { readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { ExitCodes } from '../typings/CLI';
import { tryJSONParse } from '../util';

function parseDefinitionOption(command: Command, definition: string): StateMachineDefinition {
  const jsonOrError = tryJSONParse<StateMachineDefinition>(definition);

  if (jsonOrError instanceof Error) {
    command.error(
      `error: parsing of state machine definition passed in option '-d, --definition <definition>' failed: ${jsonOrError.message}`,
      {
        exitCode: ExitCodes.PreExecutionFailure,
      }
    );
  }

  return jsonOrError;
}

function parseDefinitionFileOption(command: Command, definitionFile: string): StateMachineDefinition {
  let file: string;

  try {
    file = readFileSync(definitionFile).toString();
  } catch (error) {
    command.error(`error: ${(error as Error).message}`, { exitCode: ExitCodes.PreExecutionFailure });
  }

  const jsonOrError = tryJSONParse<StateMachineDefinition>(file);

  if (jsonOrError instanceof Error) {
    command.error(
      `error: parsing of state machine definition in file '${definitionFile}' failed: ${jsonOrError.message}`,
      { exitCode: ExitCodes.PreExecutionFailure }
    );
  }

  return jsonOrError;
}

function parseOverrideTaskOption(
  value: string,
  previous: TaskStateResourceLocalHandler = {}
): TaskStateResourceLocalHandler {
  const [taskStateName, scriptPath] = value.split(':');

  previous[taskStateName] = (input) => {
    const spawnResult = spawnSync(scriptPath, [JSON.stringify(input)]);

    if (spawnResult.error) {
      throw new Error(
        `Attempt to run task override '${scriptPath}' for state '${taskStateName}' failed: ${spawnResult.error.message}`
      );
    }

    if (spawnResult.status !== 0) {
      throw new Error(`${scriptPath} ('${taskStateName}'): ${spawnResult.stderr.toString()}`);
    }

    const overrideResult = spawnResult.stdout.toString();
    const jsonOrError = tryJSONParse<JSONValue>(overrideResult);
    if (jsonOrError instanceof Error) {
      throw new Error(
        `Parsing of output '${overrideResult}' from task override '${scriptPath}' for state '${taskStateName}' failed: ${jsonOrError.message}`
      );
    }

    return Promise.resolve(jsonOrError);
  };

  return previous;
}

function parseOverrideWaitOption(value: string, previous: WaitStateTimeOverride = {}): WaitStateTimeOverride {
  const [waitStateName, duration] = value.split(':');

  previous[waitStateName] = Number(duration);

  return previous;
}

function parseInputArguments(command: Command, value: string, previous: JSONValue[] = []): JSONValue[] {
  const jsonOrError = tryJSONParse<JSONValue>(value);

  if (jsonOrError instanceof Error) {
    command.error(`error: parsing of input value '${value}' failed: ${jsonOrError.message}`, {
      exitCode: ExitCodes.PreExecutionFailure,
    });
  }

  return previous.concat(jsonOrError);
}

export {
  parseDefinitionOption,
  parseDefinitionFileOption,
  parseOverrideTaskOption,
  parseOverrideWaitOption,
  parseInputArguments,
};

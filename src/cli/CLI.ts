#!/usr/bin/env node

import type { JSONValue } from '../typings/JSONValue';
import readline from 'readline';
import { Option, Command } from 'commander';
import { version as packageVersion } from '../../package.json';
import {
  parseDefinitionFileOption,
  parseDefinitionOption,
  parseInputArguments,
  parseOverrideTaskOption,
  parseOverrideWaitOption,
  parseContextOption,
  parseContextFileOption,
} from './ArgumentParsers';
import { commandAction, preActionHook } from './CommandHandler';
import { tryJSONParse } from '../util';

function makeProgram() {
  const command = new Command();

  command
    .name('local-sfn')
    .description(
      `Execute an Amazon States Language state machine with the given inputs.
The result of each execution will be output in a new line and in the same order as its corresponding input.`
    )
    .helpOption('-h, --help', 'Print help for command and exit.')
    .configureHelp({ helpWidth: 80 })
    .addHelpText(
      'after',
      `
Exit codes:
  0\tAll executions ran successfully.
  1\tAn error occurred before the state machine could be executed.
  2\tAt least one execution had an error.

Example calls:
  $ local-sfn -f state-machine.json '{ "num1": 2, "num2": 2 }'
  $ local-sfn -f state-machine.json -t SendRequest:./override.sh -w WaitResponse:2000 '{ "num1": 2, "num2": 2 }'
  $ cat inputs.txt | local-sfn -f state-machine.json`
    )
    .version(packageVersion, '-V, --version', 'Print the version number and exit.')
    .addOption(
      new Option('-d, --definition <definition>', 'A JSON definition of a state machine.')
        .conflicts('definition-file')
        .argParser((value) => parseDefinitionOption(command, value))
    )
    .addOption(
      new Option('-f, --definition-file <path>', 'Path to a file containing a JSON state machine definition.')
        .conflicts('definition')
        .argParser((value) => parseDefinitionFileOption(command, value))
    )
    .addOption(
      new Option(
        '-t, --override-task <mapping>',
        "Override a Task state to run an executable file or script, instead of calling the service specified in the 'Resource' field of the state definition. The mapping value has to be provided in the format [TaskStateToOverride]:[path/to/override/script]. The override script will be passed the input of the Task state as first argument, which can then be used to compute the task result. The script must print the task result as a JSON value to the standard output."
      ).argParser(parseOverrideTaskOption)
    )
    .addOption(
      new Option(
        '-w, --override-wait <mapping>',
        'Override a Wait state to pause for the specified amount of milliseconds, instead of pausing for the duration specified in the state definition. The mapping value has to be provided in the format [WaitStateToOverride]:[number].'
      ).argParser(parseOverrideWaitOption)
    )
    .addOption(
      new Option(
        '--context <json>',
        'A JSON object that will be passed to each execution as the context object.'
      ).argParser((value) => parseContextOption(command, value))
    )
    .addOption(
      new Option(
        '--context-file <path>',
        'Path to a file containing a JSON object that will be passed to each execution as the context object.'
      ).argParser((value) => parseContextFileOption(command, value))
    )
    .addOption(
      new Option('--no-jsonpath-validation', 'Disable validation of JSONPath strings in the state machine definition.')
    )
    .addOption(new Option('--no-arn-validation', 'Disable validation of ARNs in the state machine definition.'))
    .addOption(
      new Option(
        '--no-validation',
        'Disable validation of the state machine definition entirely. Use this option at your own risk, there are no guarantees when passing an invalid or non-standard definition to the state machine. Running it might result in undefined/unsupported behavior.'
      )
    )
    .argument(
      '[inputs...]',
      'Input data for the state machine, can be any valid JSON value. Each input represents a state machine execution.\n\nWhen reading from the standard input, if the first line can be parsed as a single JSON value, then each line will be considered as an input. Otherwise, the entire standard input will be considered as a single JSON input.',
      (value, previous: JSONValue[]) => parseInputArguments(command, value, previous)
    )
    .hook('preAction', preActionHook)
    .action(commandAction);

  return command;
}

if (require.main === module) {
  // If this file is being run directly and not imported as a module,
  // then parse arguments and invoke command
  (async function () {
    const program = makeProgram();

    if (process.stdin.isTTY) {
      await program.parseAsync();
    } else {
      // If piping into command or using input redirection, read the standard input
      const rl = readline.createInterface({
        input: process.stdin,
      });

      const stdin: string[] = [];
      for await (const line of rl) {
        stdin.push(line);
      }

      const firstLineJSON = tryJSONParse<JSONValue>(stdin[0]);
      if (firstLineJSON instanceof Error) {
        // If first line of stdin is not parsable JSON, assume entire stdin is a single JSON value...
        await program.parseAsync([...process.argv, stdin.join('').trim()]);
        return;
      }

      // ...otherwise, assume each line of stdin is a distinct JSON value
      await program.parseAsync([...process.argv, ...stdin.filter((line) => line)]);
    }
  })();
}

// Export `makeProgram` function to unit test the CLI
export { makeProgram };

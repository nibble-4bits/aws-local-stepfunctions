#!/usr/bin/env node

import { program, Option } from 'commander';
import { version as packageVersion } from '../../package.json';
import {
  parseDefinitionFileOption,
  parseDefinitionOption,
  parseInputArguments,
  parseOverrideTaskOption,
  parseOverrideWaitOption,
} from './ArgumentParsers';
import { commandAction, preActionHook } from './CommandHandler';

program
  .name('local-sfn')
  .version(packageVersion)
  .addOption(
    new Option('-d, --definition <definition>', 'a JSON definition of a state machine')
      .conflicts('definition-file')
      .argParser(parseDefinitionOption)
  )
  .addOption(
    new Option('-f, --definition-file <path>', 'path to a file containing a JSON state machine definition')
      .conflicts('definition')
      .argParser(parseDefinitionFileOption)
  )
  .addOption(
    new Option('-t, --override-task <mapping>', 'override a Task state to run an executable file or script').argParser(
      parseOverrideTaskOption
    )
  )
  .addOption(
    new Option(
      '-w, --override-wait <mapping>',
      'override a Wait state to pause for the specified amount of milliseconds'
    ).argParser(parseOverrideWaitOption)
  )
  .argument('<inputs...>', 'input data for the execution', parseInputArguments)
  .hook('preAction', preActionHook)
  .action(commandAction);

// Parse arguments and invoke command
(async function () {
  await program.parseAsync();
})();

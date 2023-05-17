import type { ParsedCommandOptions } from '../typings/CLI';
import type { JSONValue } from '../typings/JSONValue';
import { ExitCodes } from '../typings/CLI';
import { Command, program } from 'commander';
// @ts-expect-error Import path doesn't exist when used here, but it works once transpiled file is output to build/ dir
import { StateMachine } from './main.node.cjs';

async function commandAction(inputs: JSONValue[], options: ParsedCommandOptions) {
  let stateMachine: StateMachine;
  try {
    stateMachine = new StateMachine(options.definition ?? options.definitionFile, {
      validationOptions: {
        checkPaths: options.jsonpathValidation,
        checkArn: options.arnValidation,
      },
    });
  } catch (error) {
    program.error(`error: ${(error as Error).message}`);
  }

  const resultsPromises = inputs.map<JSONValue>((input) => {
    const { result } = stateMachine.run(input, {
      overrides: {
        taskResourceLocalHandlers: options.overrideTask,
        waitTimeOverrides: options.overrideWait,
      },
    });

    return result;
  });

  const results = await Promise.allSettled(resultsPromises);

  for (const result of results) {
    if (result.status === 'fulfilled') {
      console.log(result.value);
    } else {
      const reason = result.reason as Error;
      console.log(reason.message.trim());
    }
  }
}

function preActionHook(thisCommand: Command) {
  const options = thisCommand.opts();

  if (!options['definition'] && !options['definitionFile']) {
    program.error(
      "error: missing either option '-d, --definition <definition>' or option '-f, --definition-file <path>'",
      { exitCode: ExitCodes.PreExecutionFailure }
    );
  }
}

export { commandAction, preActionHook };

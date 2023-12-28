import type { Command } from 'commander';
import type { ParsedCommandOptions } from '../typings/CLI';
import type { JSONValue } from '../typings/JSONValue';
import { ExitCodes } from '../typings/CLI';
import { StateMachine, ExecutionTimeoutError } from '../main';

async function commandAction(inputs: JSONValue[], options: ParsedCommandOptions, command: Command) {
  let stateMachine: StateMachine;
  try {
    stateMachine = new StateMachine(options.definition ?? options.definitionFile, {
      validationOptions: {
        checkPaths: options.jsonpathValidation,
        checkArn: options.arnValidation,
        noValidate: !options.validation,
      },
    });
  } catch (error) {
    command.error(`error: ${(error as Error).message}`);
  }

  const resultsPromises = inputs.map((input) => {
    const { result } = stateMachine.run(input, {
      overrides: {
        taskResourceLocalHandlers: options.overrideTask,
        waitTimeOverrides: options.overrideWait,
        retryIntervalOverrides: options.overrideRetry,
      },
      context: options.context ?? options.contextFile,
    });

    return result;
  });

  const results = await Promise.allSettled(resultsPromises);

  let exitCode = ExitCodes.Success;
  for (const result of results) {
    if (result.status === 'fulfilled') {
      console.log(result.value);
    } else {
      // If at least one execution fails, set the execution failure exit code
      exitCode = ExitCodes.StateMachineExecutionFailure;

      let msg = (result.reason as Error).message;
      if (result.reason instanceof ExecutionTimeoutError) {
        msg = 'Execution timed out';
      }

      console.log(msg.trim());
    }
  }

  process.exitCode = exitCode;
}

function preActionHook(thisCommand: Command) {
  const options = thisCommand.opts();

  if (thisCommand.args.length === 0) {
    thisCommand.help();
  }

  if (!options['definition'] && !options['definitionFile']) {
    thisCommand.error(
      "error: missing either option '-d, --definition <definition>' or option '-f, --definition-file <path>'",
      { exitCode: ExitCodes.PreExecutionFailure }
    );
  }
}

export { commandAction, preActionHook };

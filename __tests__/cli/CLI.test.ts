import { makeProgram } from '../../src/cli/CLI';
import { LambdaClient } from '../../src/aws/LambdaClient';
import * as fs from 'fs';
import * as child_process from 'child_process';

jest.mock('fs', () => ({
  __esModule: true,
  ...jest.requireActual('fs'),
  readFileSync: null,
}));

jest.mock('child_process', () => ({
  __esModule: true,
  ...jest.requireActual('child_process'),
  spawnSync: null,
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('CLI', () => {
  describe('Help display', () => {
    test('should print help when calling command without any options or arguments', async () => {
      const program = makeProgram();
      let helpStr = '';

      program.exitOverride();
      program.configureOutput({
        writeOut: (str) => {
          helpStr += str;
        },
      });

      await expect(program.parseAsync([], { from: 'user' })).rejects.toThrow();
      expect(helpStr).toBe(
        'Usage: local-sfn [options] [inputs...]\n\nExecute an Amazon States Language state machine with the given inputs.\nThe result of each execution will be printed in a new line and in the same\norder as its corresponding input.\n\nArguments:\n  inputs                          Input data for the state machine, can be any\n                                  valid JSON value. Each input represents a\n                                  state machine execution.\n  \n                                  When reading from the standard input, if the\n                                  first line can be parsed as a single JSON\n                                  value, then each line will be considered as\n                                  an input. Otherwise, the entire standard\n                                  input will be considered as a single JSON\n                                  input.\n\nOptions:\n  -V, --version                   Print the version number and exit.\n  -d, --definition <definition>   A JSON definition of a state machine.\n  -f, --definition-file <path>    Path to a file containing a JSON state\n                                  machine definition.\n  -t, --override-task <mapping>   Override a Task state to run an executable\n                                  file or script, instead of calling the\n                                  service specified in the \'Resource\' field of\n                                  the state definition. The mapping value has\n                                  to be provided in the format\n                                  [TaskStateToOverride]:[path/to/override/script].\n                                  The override script will be passed the input\n                                  of the Task state as first argument, which\n                                  can then be used to compute the task result.\n                                  The script must print the task result as a\n                                  JSON value to the standard output.\n  -w, --override-wait <mapping>   Override a Wait state to pause for the\n                                  specified amount of milliseconds, instead of\n                                  pausing for the duration specified in the\n                                  state definition. The mapping value has to be\n                                  provided in the format\n                                  [WaitStateToOverride]:[number].\n  -r, --override-retry <mapping>  Override a \'Retry\' field to pause for the\n                                  specified amount of milliseconds, instead of\n                                  pausing for the duration specified by the\n                                  retry policy. The mapping value has to be\n                                  provided in the format\n                                  [NameOfStateWithRetryField]:[number].\n  --context <json>                A JSON object that will be passed to each\n                                  execution as the context object.\n  --context-file <path>           Path to a file containing a JSON object that\n                                  will be passed to each execution as the\n                                  context object.\n  --no-jsonpath-validation        Disable validation of JSONPath strings in the\n                                  state machine definition.\n  --no-arn-validation             Disable validation of ARNs in the state\n                                  machine definition.\n  --no-validation                 Disable validation of the state machine\n                                  definition entirely. Use this option at your\n                                  own risk, there are no guarantees when\n                                  passing an invalid or non-standard definition\n                                  to the state machine. Running it might result\n                                  in undefined/unsupported behavior.\n  -h, --help                      Print help for command and exit.\n\nExit codes:\n  0	All executions ran successfully.\n  1	An error occurred before the state machine could be executed.\n  2	At least one execution had an error.\n\nExample calls:\n  $ local-sfn -f state-machine.json \'{ "num1": 2, "num2": 2 }\'\n  $ local-sfn -f state-machine.json -t SendRequest:./override.sh -w WaitResponse:2000 \'{ "num1": 2, "num2": 2 }\'\n  $ cat inputs.txt | local-sfn -f state-machine.json\n'
      );
    });
  });

  describe('Pre-execution errors', () => {
    test('should print error when calling command with input args but missing either `-d` or `-f` options', async () => {
      const program = makeProgram();
      let errStr = '';

      program.exitOverride();
      program.configureOutput({
        writeErr: (str) => {
          errStr += str;
        },
      });

      // program.parseAsync(['{}'], { from: 'user' });
      await expect(program.parseAsync(['{}'], { from: 'user' })).rejects.toThrow();
      expect(errStr).toBe(
        "error: missing either option '-d, --definition <definition>' or option '-f, --definition-file <path>'\n"
      );
    });

    test('should print error when passing an non-parseable definition via `-d` option', async () => {
      const program = makeProgram();
      const definition =
        // missing double quotes for "StartAt" key
        `{
          StartAt: "AddNumbers",
          "States": {
           "AddNumbers": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
            "End": true
           }
          }
         }`;
      let errStr = '';

      program.exitOverride();
      program.configureOutput({
        writeErr: (str) => {
          errStr += str;
        },
      });

      await expect(program.parseAsync(['-d', definition, '{}'], { from: 'user' })).rejects.toThrow();
      expect(errStr).toBe(
        "error: parsing of state machine definition passed in option '-d, --definition <definition>' failed: Unexpected token S in JSON at position 12\n"
      );
    });

    test('should print error when passing an non-existent file via `-f` option', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fs.readFileSync = jest.fn((path) => {
        throw new Error(`ENOENT: no such file or directory, open '${path}'`);
      });

      const program = makeProgram();
      const filePath = '/path/to/nonexistent/file';
      let errStr = '';

      program.exitOverride();
      program.configureOutput({
        writeErr: (str) => {
          errStr += str;
        },
      });

      await expect(program.parseAsync(['-f', filePath, '{}'], { from: 'user' })).rejects.toThrow();
      expect(errStr).toBe("error: ENOENT: no such file or directory, open '/path/to/nonexistent/file'\n");
    });

    test('should print error when passing an non-parseable definition via `-f` option', async () => {
      const definition =
        // missing double quotes for "StartAt" key
        `{
          StartAt: "AddNumbers",
          "States": {
           "AddNumbers": {
            "Type": "Task",
            "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
            "End": true
           }
          }
         }`;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      fs.readFileSync = jest.fn(() => definition);

      const program = makeProgram();
      const filePath = './state-machine.asl.json';
      let errStr = '';

      program.exitOverride();
      program.configureOutput({
        writeErr: (str) => {
          errStr += str;
        },
      });

      await expect(program.parseAsync(['-f', filePath, '{}'], { from: 'user' })).rejects.toThrow();
      expect(errStr).toBe(
        "error: parsing of state machine definition in file './state-machine.asl.json' failed: Unexpected token S in JSON at position 12\n"
      );
    });

    test('should print error when passing an non-parseable input argument', async () => {
      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
          "End": true
         }
        }
       }`;

      const program = makeProgram();
      const input = '{ key: 123 }';
      let errStr = '';

      program.exitOverride();
      program.configureOutput({
        writeErr: (str) => {
          errStr += str;
        },
      });

      await expect(program.parseAsync(['-d', definition, input], { from: 'user' })).rejects.toThrow();
      expect(errStr).toBe(
        "error: parsing of input value '{ key: 123 }' failed: Unexpected token k in JSON at position 2\n"
      );
    });

    test('should print error when passing a definition that contains an invalid JSONPath', async () => {
      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
          "OutputPath": "invalid-path",
          "End": true
         }
        }
       }`;

      const program = makeProgram();
      let errStr = '';

      program.exitOverride();
      program.configureOutput({
        writeErr: (str) => {
          errStr += str;
        },
      });

      await expect(program.parseAsync(['-d', definition, '{}'], { from: 'user' })).rejects.toThrow();
      expect(errStr).toBe(
        'error: State machine definition is invalid, see error(s) below:\n SCHEMA_VALIDATION_FAILED: /States/AddNumbers/OutputPath is invalid. must match format "asl_path"\n'
      );
    });

    test('should print error when passing a definition that contains an invalid ARN', async () => {
      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "invalid-arn",
          "End": true
         }
        }
       }`;

      const program = makeProgram();
      let errStr = '';

      program.exitOverride();
      program.configureOutput({
        writeErr: (str) => {
          errStr += str;
        },
      });

      await expect(program.parseAsync(['-d', definition, '{}'], { from: 'user' })).rejects.toThrow();
      expect(errStr).toBe(
        'error: State machine definition is invalid, see error(s) below:\n SCHEMA_VALIDATION_FAILED: /States/AddNumbers/Resource is invalid. must match exactly one schema in oneOf\n'
      );
    });

    test('should NOT print error when passing a definition that contains an invalid JSONPath and --no-jsonpath-validation option is passed', async () => {
      const consoleLogMock = jest.fn();
      jest.spyOn(LambdaClient.prototype, 'invokeFunction').mockImplementation(jest.fn());
      jest.spyOn(console, 'log').mockImplementation(consoleLogMock);

      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
          "OutputPath": "invalid-path",
          "End": true
         }
        }
       }`;

      const program = makeProgram();

      await program.parseAsync(['-d', definition, '--no-jsonpath-validation', '{}'], { from: 'user' });
      expect(consoleLogMock).toHaveBeenCalled();
    });

    test('should NOT print error when passing a definition that contains an invalid ARN and --no-arn-validation option is passed', async () => {
      const consoleLogMock = jest.fn();
      jest.spyOn(LambdaClient.prototype, 'invokeFunction').mockImplementation(jest.fn());
      jest.spyOn(console, 'log').mockImplementation(consoleLogMock);

      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "invalid-arn",
          "End": true
         }
        }
       }`;

      const program = makeProgram();

      await program.parseAsync(['-d', definition, '--no-arn-validation', '{}'], { from: 'user' });

      expect(consoleLogMock).toHaveBeenCalled();
    });

    test('should NOT print error when passing a definition that does not conform to the spec and --no-validation option is passed', async () => {
      const consoleLogMock = jest.fn();
      jest.spyOn(LambdaClient.prototype, 'invokeFunction').mockImplementation(jest.fn());
      jest.spyOn(console, 'log').mockImplementation(consoleLogMock);

      const definition = `{
        "StartAt": "AddNumbers",
        "InvalidTopLevelField": false,
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "invalid-arn",
          "End": true
         },
         "UnreachableState": {
          "Type": "CustomType"
         }
        }
       }`;

      const program = makeProgram();

      await program.parseAsync(['-d', definition, '--no-validation', '{}'], { from: 'user' });

      expect(consoleLogMock).toHaveBeenCalled();
    });
  });

  describe('State machine execution', () => {
    test('should call console.log to print results to stdout', async () => {
      const invokeFunctionMock = jest.fn((_, input) => input.num1 + input.num2);
      const consoleLogMock = jest.fn();
      jest.spyOn(LambdaClient.prototype, 'invokeFunction').mockImplementation(invokeFunctionMock);
      jest.spyOn(console, 'log').mockImplementation(consoleLogMock);

      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
          "End": true
         }
        }
       }`;

      const program = makeProgram();
      const inputs = ['{ "num1": 1, "num2": 2 }', '{ "num1": 3, "num2": 4 }', 'null'];

      await program.parseAsync(['-d', definition, ...inputs], { from: 'user' });

      expect(consoleLogMock).toHaveBeenCalledTimes(3);
      expect(consoleLogMock).toHaveBeenNthCalledWith(1, 3);
      expect(consoleLogMock).toHaveBeenNthCalledWith(2, 7);
      expect(consoleLogMock).toHaveBeenNthCalledWith(
        3,
        "Execution has failed with the following error: Cannot read properties of null (reading 'num1')"
      );
    });

    test('should exit with status code 0 when all executions are successful', async () => {
      const invokeFunctionMock = jest.fn((_, input) => input.num1 + input.num2);
      const consoleLogMock = jest.fn();
      jest.spyOn(LambdaClient.prototype, 'invokeFunction').mockImplementation(invokeFunctionMock);
      jest.spyOn(console, 'log').mockImplementation(consoleLogMock);

      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
          "End": true
         }
        }
       }`;

      const program = makeProgram();
      const inputs = ['{ "num1": 1, "num2": 2 }', '{ "num1": 3, "num2": 4 }', '{ "num1": 5, "num2": 6 }'];

      await program.parseAsync(['-d', definition, ...inputs], { from: 'user' });

      expect(process.exitCode).toBe(0);
    });

    test('should exit with status code 2 when at least one execution failed', async () => {
      const invokeFunctionMock = jest.fn((_, input) => input.num1 + input.num2);
      const consoleLogMock = jest.fn();
      jest.spyOn(LambdaClient.prototype, 'invokeFunction').mockImplementation(invokeFunctionMock);
      jest.spyOn(console, 'log').mockImplementation(consoleLogMock);

      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
          "End": true
         }
        }
       }`;

      const program = makeProgram();
      const inputs = ['{ "num1": 1, "num2": 2 }', '{ "num1": 3, "num2": 4 }', 'null'];

      await program.parseAsync(['-d', definition, ...inputs], { from: 'user' });

      expect(process.exitCode).toBe(2);
    });

    test('should print execution timeout error as result when execution ran longer that `TimeoutSeconds`', async () => {
      const invokeFunctionMock = jest.fn((_, input) => input.num1 + input.num2);
      const consoleLogMock = jest.fn();
      jest.spyOn(LambdaClient.prototype, 'invokeFunction').mockImplementation(invokeFunctionMock);
      jest.spyOn(console, 'log').mockImplementation(consoleLogMock);

      const definition = `{
        "StartAt": "WaitState",
        "TimeoutSeconds": 0,
        "States": {
         "WaitState": {
          "Type": "Wait",
          "Seconds": 3,
          "End": true
         }
        }
       }`;

      const program = makeProgram();
      const inputs = ['{ "num1": 1, "num2": 2 }'];

      await program.parseAsync(['-d', definition, ...inputs], { from: 'user' });

      expect(consoleLogMock).toHaveBeenCalledWith('Execution timed out');
    });

    test('should spawn external script when `-t` option is passed', async () => {
      const consoleLogMock = jest.fn();
      jest.spyOn(console, 'log').mockImplementation(consoleLogMock);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      child_process.spawnSync = jest.fn(() => ({
        status: 0,
        stdout: '"Script result"',
      }));

      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
          "End": true
         }
        }
       }`;

      const program = makeProgram();
      const overrideTaskMapping = 'AddNumbers:./override.sh';
      const inputs = ['{ "num1": 1, "num2": 2 }'];

      await program.parseAsync(['-d', definition, '-t', overrideTaskMapping, ...inputs], { from: 'user' });

      expect(child_process.spawnSync).toHaveBeenCalled();
      expect(consoleLogMock).toHaveBeenCalledWith('Script result');
    });

    test('should print error as result when attempt to spawn overriding script fails', async () => {
      const consoleLogMock = jest.fn();
      jest.spyOn(console, 'log').mockImplementation(consoleLogMock);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      child_process.spawnSync = jest.fn(() => ({
        status: 1,
        error: new Error('spawnSync failure'),
      }));

      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
          "End": true
         }
        }
       }`;

      const program = makeProgram();
      const overrideTaskMapping = 'AddNumbers:./override.sh';
      const inputs = ['{ "num1": 1, "num2": 2 }'];

      await program.parseAsync(['-d', definition, '-t', overrideTaskMapping, ...inputs], { from: 'user' });

      expect(child_process.spawnSync).toHaveBeenCalled();
      expect(consoleLogMock).toHaveBeenCalledWith(
        "Execution has failed with the following error: Attempt to run task override './override.sh' for state 'AddNumbers' failed: spawnSync failure"
      );
    });

    test('should print error as result when overriding script terminates with non-zero exit code', async () => {
      const consoleLogMock = jest.fn();
      jest.spyOn(console, 'log').mockImplementation(consoleLogMock);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      child_process.spawnSync = jest.fn(() => ({
        status: 1,
        stderr: 'Failure on script execution',
      }));

      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
          "End": true
         }
        }
       }`;

      const program = makeProgram();
      const overrideTaskMapping = 'AddNumbers:./override.sh';
      const inputs = ['{ "num1": 1, "num2": 2 }'];

      await program.parseAsync(['-d', definition, '-t', overrideTaskMapping, ...inputs], { from: 'user' });

      expect(child_process.spawnSync).toHaveBeenCalled();
      expect(consoleLogMock).toHaveBeenCalledWith(
        "Execution has failed with the following error: ./override.sh ('AddNumbers'): Failure on script execution"
      );
    });

    test('should print error as result when output from overriding script cannot be parsed', async () => {
      const consoleLogMock = jest.fn();
      jest.spyOn(console, 'log').mockImplementation(consoleLogMock);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      child_process.spawnSync = jest.fn(() => ({
        status: 0,
        stdout: '{ key: value }',
      }));

      const definition = `{
        "StartAt": "AddNumbers",
        "States": {
         "AddNumbers": {
          "Type": "Task",
          "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
          "End": true
         }
        }
       }`;

      const program = makeProgram();
      const overrideTaskMapping = 'AddNumbers:./override.sh';
      const inputs = ['{ "num1": 1, "num2": 2 }'];

      await program.parseAsync(['-d', definition, '-t', overrideTaskMapping, ...inputs], { from: 'user' });

      expect(child_process.spawnSync).toHaveBeenCalled();
      expect(consoleLogMock).toHaveBeenCalledWith(
        "Execution has failed with the following error: Parsing of output '{ key: value }' from task override './override.sh' for state 'AddNumbers' failed: Unexpected token k in JSON at position 2"
      );
    });
  });
});

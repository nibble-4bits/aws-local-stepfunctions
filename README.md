# AWS Local Step Functions

A TypeScript implementation of the [Amazon States Language specification](https://states-language.net/spec.html).

This package lets you run AWS Step Functions completely locally, both in Node.js and in the browser!

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Importing](#importing)
  - [Node.js](#nodejs)
    - [CommonJS](#commonjs)
    - [ES Module](#es-module)
  - [Browser](#browser)
- [API](#api)
  - [Constructor](#constructor-new-statemachinedefinition-statemachineoptions)
  - [StateMachine.run](#statemachineruninput-options)
- [CLI](#cli)
  - [Basic usage](#basic-usage)
  - [Passing input from stdin](#passing-input-from-stdin)
  - [Overriding Task and Wait states](#overriding-task-and-wait-states)
    - [Task state override](#task-state-override)
    - [Wait state override](#wait-state-override)
  - [Disabling ASL validations](#disabling-asl-validations)
  - [Exit codes](#exit-codes)
- [Examples](#examples)
- [License](#license)

## Features

To see the list of features defined in the specification that have full support, partial support, or no support, refer to [this document](/docs/feature-support.md).

## Installation

```sh
npm install aws-local-stepfunctions
```

## Importing

### Node.js

#### CommonJS

```js
const { StateMachine } = require('aws-local-stepfunctions');
```

#### ES Module

```js
import { StateMachine } from 'aws-local-stepfunctions';
```

### Browser

You can import the bundled package directly into a browser script as an ES module, from one of the following CDNs:

> NOTE: The following examples will import the latest package version. Refer to the CDNs websites to know about other ways in which you can specify the package URL (for example, to import a specific version).

#### [unpkg](https://unpkg.com/)

```js
import { StateMachine } from 'https://unpkg.com/aws-local-stepfunctions';
```

#### [jsDelivr](https://www.jsdelivr.com/)

```js
import { StateMachine } from 'https://cdn.jsdelivr.net/npm/aws-local-stepfunctions/build/main.browser.esm.js';
```

## API

### Constructor: `new StateMachine(definition[, stateMachineOptions])`

#### Parameters

The constructor takes the following parameters:

- `definition`: The Amazon States Language definition of the state machine.
- `stateMachineOptions?`:
  - `validationOptions?`: An object that specifies how the definition should be validated.
    - `checkPaths`: If set to `false`, won't validate JSONPaths.
    - `checkArn`: If set to `false`, won't validate ARN syntax in `Task` states.
  - `awsConfig?`: An object that specifies the [AWS region and credentials](/docs/feature-support.md#providing-aws-credentials-and-region-to-execute-lambda-functions-specified-in-task-states) to use when invoking a Lambda function in a `Task` state. If not set, the AWS config will be resolved based on the [credentials provider chain](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html) of the AWS SDK for JavaScript V3. You don't need to use this option if you have a [shared config/credentials file](https://docs.aws.amazon.com/sdkref/latest/guide/file-format.html) (for example, if you have the [AWS CLI](https://aws.amazon.com/cli/) installed) or if you use a local override for all of your `Task` states.
    - `region`: The AWS region where the Lambda functions are created.
    - `credentials`: An object that specifies which type of credentials to use.
      - `cognitoIdentityPool`: An object that specifies the Cognito Identity Pool ID to use for requesting credentials.
      - `accessKeys`: An object that specifies the Access Key ID and Secret Access Key to use as credentials.

The constructor will attempt to validate the definition by default, unless the `validationOptions` property is specified. If the definition is not valid, an error will be thrown.

#### Example

```js
import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  Comment: 'A simple minimal example of the States language',
  StartAt: 'Hello World',
  States: {
    'Hello World': {
      Type: 'Task',
      Resource: 'arn:aws:lambda:us-east-1:123456789012:function:HelloWorld',
      End: true,
    },
  },
};

// Instantiate a new state machine with the given definition and don't validate JSONPaths.
const stateMachine = new StateMachine(machineDefinition, {
  validationOptions: { checkPaths: false },
});
```

### `StateMachine.run(input[, options])`

Runs the state machine with the given `input` parameter and returns an object with the following properties:

- `abort`: A function that takes no parameters and doesn't return any value. If called, [aborts the execution](/docs/feature-support.md#abort-a-running-execution) and throws an `ExecutionAbortedError`, unless the `noThrowOnAbort` option is set.
- `result`: A `Promise` that resolves with the execution result once it finishes.

Each execution is independent of all others, meaning that you can concurrently call this method as many times as needed, without worrying about race conditions.

#### Parameters

- `input`: The initial input to pass to the state machine. This can be any valid JSON value.
- `options?`:
  - `overrides?`: An object to override the behavior of certain states:
    - `taskResourceLocalHandlers?`: An [object that overrides](/docs/feature-support.md#task-state-resource-override) the resource of the specified `Task` states to run a local function.
    - `waitTimeOverrides?`: An [object that overrides](/docs/feature-support.md#wait-state-duration-override) the wait duration of the specified `Wait` states. The specifed override duration should be in milliseconds.
  - `noThrowOnAbort?`: If this option is set to `true`, aborting the execution will simply return `null` as result instead of throwing.

#### Basic example:

```js
import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  StartAt: 'Hello World',
  States: {
    'Hello World': {
      Type: 'Task',
      Resource: 'arn:aws:lambda:us-east-1:123456789012:function:HelloWorld',
      End: true,
    },
  },
};

const stateMachine = new StateMachine(machineDefinition);
const myInput = { value1: 'hello', value2: 123, value3: true };
const execution = stateMachine.run(myInput); // execute the state machine

const result = await execution.result; // wait until the execution finishes to get the result
console.log(result); // log the result of the execution
```

## CLI

In addition to the JavaScript API, `aws-local-stepfunctions` also provides a command-line interface. The CLI allows you to run one or several executions without having to create a Node.js script.

To use the CLI as a global shell command, you need to install the package globally:

```sh
npm install -g aws-local-stepfunctions
```

After installing the package, the command `local-sfn` will be available in your shell.

### Basic usage

The simplest way to use the CLI is by passing either the `-d, --definition` or the `-f, --definition-file` option, along with the input(s) for the state machine. For example:

```sh
local-sfn \
  -f state-machine.json \
  '{ "num1": 1, "num2": 2 }' \
  '{ "num1": 3, "num2": 4 }' \
  '{ "num1": 5, "num2": 6 }'
```

This command would execute the state machine defined in file `state-machine.json` with `'{ "num1": 1, "num2": 2 }'`, `'{ "num1": 3, "num2": 4 }'`, and `'{ "num1": 5, "num2": 6 }'` as inputs. Each input corresponds to a state machine execution, and each execution is run independently, so the failure of one execution doesn't mean the failure of all of the other executions.

Now, suppose the state machine in file `state-machine.json` is defined as a single `Task` state that calls a Lambda function that adds `num1` and `num2`:

<a id="cli-state-machine"></a>

```json
{
  "StartAt": "AddNumbers",
  "States": {
    "AddNumbers": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:AddNumbers",
      "End": true
    }
  }
}
```

Then, the output of the `local-sfn` command above may look something like this:

```sh
3
7
11
```

Note that each line of the output corresponds to the result of each input, in the same order that the inputs were given to the command.

### Passing input from stdin

`local-sfn` can also read the execution input from the standard input. For example, assume you have the following text file, called `inputs.txt`, and you want to pass the contents of the file as inputs to `local-sfn`:

```txt
{ "num1": 1, "num2": 2 }
{ "num1": 3, "num2": 4 }
{ "num1": 5, "num2": 6 }
```

You can then run the following command to pass the inputs of the text file to `local-sfn`:

```sh
cat inputs.txt | local-sfn -f state-machine.json
```

Alternatively, using input redirection:

```sh
local-sfn -f state-machine.json < inputs.txt
```

When reading from stdin, `local-sfn` will take each line and use it as an input. Hence, to avoid any parsing errors, make sure the output of the command you're piping into `local-sfn` prints each input in a new line.

### Overriding Task and Wait states

As explained in the Feature support document, it's possible to override the default actions of [`Task` states](/docs/feature-support.md#task-state-resource-override) and [`Wait` states](/docs/feature-support.md#wait-state-duration-override).

#### Task state override

To override a `Task` state, pass the `-t, --override-task` option. This option takes as value the name of the `Task` state you want to override, and a path to a script or program that will be executed instead of the resource specified in the state definition. The state name and the path must be separated by a colon `:`.

Using the same [state machine definition](#cli-state-machine) as before, if you wanted to override the `AddNumbers` state to run a custom script, you can do it like this:

```
local-sfn -f state-machine.json -t AddNumbers:./override.sh '{ "num1": 1, "num2": 2 }'
```

This command would run the state machine, but instead of invoking the Lambda function specified in the `Resource` field of the `AddNumbers` state, the `override.sh` script would be executed.

Now, suppose the `override.sh` script is defined like this:

```sh
#!/bin/sh

TASK_INPUT=$1 # First argument is the input to the overridden Task state
echo "$TASK_INPUT" | jq '.num1 + .num2' # Use jq to add "num1" and "num2", and print result to stdout
```

When overriding a `Task` state, the overriding script/program will be passed the input to the `Task` state as first argument, which can then be used to compute the task result. Similarly, the overriding script/program must print the task result as a JSON value to the standard output.

#### Wait state override

To override the duration of a `Wait` state, pass the `-w, --override-wait` option. This option takes as value the name of the `Wait` state you want to override, and a number that represents the amount in milliseconds that you want to pause the execution for. The state name and the milliseconds amount must be separated by a colon `:`.

For example:

```
local-sfn -f state-machine.json -w WaitResponse:1500 '{ "num1": 1, "num2": 2 }'
```

This command would execute the state machine, and when entering the `WaitResponse` `Wait` state, the execution would be paused for 1500 milliseconds (1.5 seconds), disregarding the `Seconds`, `Timestamp`, `SecondsPath`, or `TimestampPath` fields that could've been specified in the definition of `WaitResponse`.

### Disabling ASL validations

Before attempting to run the state machine with the given inputs, the state machine definition itself is validated to check that:

- JSONPath strings are valid.
- ARNs in the `Resource` field of `Task` states are valid.

If any of these two checks fail, `local-sfn` will print the validation error and exit. To suppress this behavior, you can pass the `--no-jsonpath-validation` option, to suppress JSONPath validation; and the `--no-arn-validation` option, to suppress ARN validation.

### Exit codes

`local-sfn` can terminate with the following exit codes:

| Exit code | Explanation                                                                          |
| :-------: | ------------------------------------------------------------------------------------ |
|     0     | The state machine was executed, and all executions ran successfully.                 |
|     1     | An error occurred before the state machine could be executed (e.g. a parsing error). |
|     2     | The state machine was executed, but at least one execution had an error.             |

## Examples

You can check more examples and options usage in the [examples](/examples) directory.

To run the examples, clone the repo, install the dependencies and build the project:

```sh
git clone https://github.com/nibble-4bits/aws-local-stepfunctions.git --depth 1
cd aws-local-stepfunctions
npm install
npm run build
```

Then run whichever example you want:

```sh
node examples/abort-execution.js
```

## License

[MIT](https://github.com/nibble-4bits/aws-local-stepfunctions/blob/develop/LICENSE)

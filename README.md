# AWS Local Step Functions

A TypeScript implementation of the [Amazon States Language specification](https://states-language.net/spec.html).

This package lets you run AWS Step Functions state machines completely locally, both in Node.js and in the browser!

<p align="left">
  <a href="/LICENSE">
    <img alt="Project license (MIT)" src="https://img.shields.io/github/license/nibble-4bits/aws-local-stepfunctions">
  </a>
  <a href="https://github.com/nibble-4bits/aws-local-stepfunctions/actions/workflows/pr-run-tests.yml">
    <img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/nibble-4bits/aws-local-stepfunctions/pr-run-tests.yml">
  </a>
  <a href="https://www.npmjs.com/package/aws-local-stepfunctions">
    <img alt="Latest npm version" src="https://img.shields.io/npm/v/aws-local-stepfunctions">
  </a>
  <a href="https://www.npmjs.com/package/aws-local-stepfunctions">
    <img alt="node-lts" src="https://img.shields.io/node/v-lts/aws-local-stepfunctions">
  </a>
  <a href="https://www.npmjs.com/package/aws-local-stepfunctions">
    <img alt="npm type definitions" src="https://img.shields.io/npm/types/aws-local-stepfunctions">
  </a>
</p>

## Table of contents

- [Features](#features)
- [Use cases](#use-cases)
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
    - [Retry field pause override](#retry-field-pause-override)
  - [Passing a custom Context Object](#passing-a-custom-context-object)
  - [Disabling ASL validations](#disabling-asl-validations)
  - [Exit codes](#exit-codes)
- [Examples](#examples)
- [License](#license)

## Features

To see the list of features defined in the specification that have full support, partial support, or no support, refer to [this document](/docs/feature-support.md).

## Use cases

Why would you want to use this package? Below is a non-exhaustive list of use cases for `aws-local-stepfunctions`:

- Testing state machines changes locally before deploying them to AWS.
- Testing the integration between a state machine and the Lambda functions associated with it in `Task` states.
- Debugging the code of associated Lambda functions interactively using the [`Task` state resource override feature](/docs/feature-support.md#task-state-resource-override).
- Debugging a state machine by using the [event logs feature](/docs/feature-support.md#execution-event-logs), to better understand the transitions between states and how data flows between them.
- Running state machines in the browser (not possible with [AWS Step Functions Local](https://docs.aws.amazon.com/step-functions/latest/dg/sfn-local.html)).

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

> NOTE: The following examples will import the latest package version. Refer to the CDNs websites to know about other ways in which you can specify the package URL (for example, to import a specific version or a minified version).

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
    - `noValidate`: If set to `true`, will skip validation of the definition entirely.
      > NOTE: Use this option at your own risk, there are no guarantees when passing an invalid or non-standard definition to the state machine. Running it might result in undefined/unsupported behavior.
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

Runs the state machine with the given `input`.

Each execution is independent of all others, meaning that you can concurrently call this method as many times as needed, without worrying about race conditions.

#### Parameters

- `input`: The initial input to pass to the state machine. This can be any valid JSON value.
- `options?`:
  - `overrides?`: An object to override the behavior of certain states:
    - `taskResourceLocalHandlers?`: An [object that overrides](/docs/feature-support.md#task-state-resource-override) the resource of the specified `Task` states to run a local function.
    - `waitTimeOverrides?`: An [object that overrides](/docs/feature-support.md#wait-state-duration-override) the wait duration of the specified `Wait` states. The specified override duration should be in milliseconds.
    - `retryIntervalOverrides?`: An [object that overrides](/docs/feature-support.md#retry-field-interval-override) the pause duration of the specified state's `Retry` field. The specified override duration should be a number in milliseconds; or an array of numbers, where each number represents milliseconds.
  - `noThrowOnAbort?`: If this option is set to `true`, aborting the execution will simply return `null` as result instead of throwing.
  - `context?`: An object that will be used as the [Context Object](https://docs.aws.amazon.com/step-functions/latest/dg/input-output-contextobject.html) for the execution. If not passed, the Context Object will default to the following object:
    ```js
    {
      "Execution": {
        "Input": /* input passed to the execution */,
        "StartTime": /* ISO 8601 timestamp of when the execution started */
      }
    }
    ```
    This option is useful to mock the fields of the Context Object in case your definition references it in a JSONPath.

#### Return value

Returns an object that has the following properties:

- `result`: A `Promise` that resolves with the result of the execution, if it ends successfully.
- `abort`: A function that takes no parameters and doesn't return any value. If called, [aborts the execution](/docs/feature-support.md#abort-a-running-execution) and throws an `ExecutionAbortedError`, unless the `noThrowOnAbort` option is set.
- `eventLogs`: An `AsyncGenerator` that [produces a log of events](/docs/feature-support.md#execution-event-logs) as the execution runs. To learn more about the events, their type, and their format, see the [following document](/docs/execution-event-logs.md).

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

`local-sfn` can also read the execution input from the standard input.

If the first line of stdin can be parsed as a single JSON value, then `local-sfn` will consider each line as an input. Otherwise, the entire stdin will be considered as a single JSON input.

For example, assume you have the following text file, called `inputs.txt`, and you want to pass the contents of the file as inputs to `local-sfn`:

```txt
{ "num1": 1, "num2": 2 }
{ "num1": 3, "num2": 4 }
{ "num1": 5, "num2": 6 }
```

Because the first line is parsable as JSON, `local-sfn` will process each line as a single input.

You can then run the following command to pass the inputs of the text file to `local-sfn`:

```sh
cat inputs.txt | local-sfn -f state-machine.json
```

Alternatively, using input redirection:

```sh
local-sfn -f state-machine.json < inputs.txt
```

On the other hand, assume you have this additional file, called `input.json`:

```json
{
  "num1": 5,
  "num2": 3
}
```

If you pass this file as input, `local-sfn` will automatically detect that it is a single, multiline JSON value and process it as a single value.

### Overriding Task and Wait states

As explained in the Feature support document, it's possible to override the default actions of [`Task` states](/docs/feature-support.md#task-state-resource-override) and [`Wait` states](/docs/feature-support.md#wait-state-duration-override).

#### Task state override

To override a `Task` state, pass the `-t, --override-task` option. This option takes as value the name of the `Task` state you want to override, and a path to a script or program that will be executed instead of the resource specified in the state definition. The state name and the path must be separated by a colon `:`.

Using the same [state machine definition](#cli-state-machine) as before, if you wanted to override the `AddNumbers` state to run a custom script, you can do it like this:

```sh
local-sfn -f state-machine.json -t AddNumbers:./override.sh '{ "num1": 1, "num2": 2 }'
```

This command would run the state machine, but instead of invoking the Lambda function specified in the `Resource` field of the `AddNumbers` state, the `override.sh` script would be executed.

Now, suppose the `override.sh` script is defined like this:

```sh
#!/bin/sh

TASK_INPUT=$1 # First argument is the input to the overridden Task state
echo "$TASK_INPUT" | jq '.num1 + .num2' # Use jq to add "num1" and "num2", and print result to stdout
```

When overriding a `Task` state, the overriding executable will be passed the input to the `Task` state as first argument, which can then be used to compute the task result. Similarly, the executable must print the task result as a JSON value to the standard output, so `local-sfn` can then read stdout and use the value as the result of the `Task` state. If the executable terminates with an exit code different from `0`, its standard error will be printed and the execution will be marked as a failure.

Additionally, you can pass the `-t, --override-task` option multiple times, to override more than one `Task` state. For example:

```sh
local-sfn
  -f state-machine.json \
  -t AddNumbers:./override.sh \
  -t SendRequest:./request.py \
  -t ProcessImage:./proc_image \
  '{ "num1": 1, "num2": 2 }'
```

This command would execute the state machine, and override `Task` states `AddNumbers`, `SendRequest`, and `ProcessImage` to run the `override.sh` shell script, the `request.py` Python script, and the `proc_image` program, respectively.

#### Wait state override

To override the duration of a `Wait` state, pass the `-w, --override-wait` option. This option takes as value the name of the `Wait` state you want to override, and a number that represents the amount in milliseconds that you want to pause the execution for. The state name and the milliseconds amount must be separated by a colon `:`.

For example:

```sh
local-sfn -f state-machine.json -w WaitResponse:1500 '{ "num1": 1, "num2": 2 }'
```

This command would execute the state machine, and when entering the `WaitResponse` `Wait` state, the execution would be paused for 1500 milliseconds (1.5 seconds), disregarding the `Seconds`, `Timestamp`, `SecondsPath`, or `TimestampPath` fields that could've been specified in the definition of `WaitResponse`.

In the same way as the `-t, --override-task` option, you can pass the `-w, --override-wait` option multiple times, to override more than one `Wait` state. For example:

```sh
local-sfn \
  -f state-machine.json \
  -w WaitResponse:1500 \
  -w PauseUntilSignal:250 \
  -w Delay:0 \
  '{ "num1": 1, "num2": 2 }'
```

This command would execute the state machine, and override `Wait` states `WaitResponse` and `PauseUntilSignal` to pause the execution for 1500 and 250 milliseconds, respectively. The `Delay` state wouldn't be paused at all, since the override value is set to 0.

#### Retry field pause override

To override the duration of the pause in the `Retry` field of a state, pass the `-r, --override-retry` option. This option takes as value the name of the state whose `Retry` field you want to override, and a number that represents the amount in milliseconds that you want to pause the execution for before retrying the state. The state name and the milliseconds amount must be separated by a colon `:`.

For example, suppose the state machine definition contains a state called `TaskToRetry` that is defined as follows:

```json
{
  "Type": "Task",
  "Resource": "arn:aws:lambda:us-east-1:123456789012:function:HelloWorld",
  "Retry": [
    { "ErrorEquals": ["States.Timeout", "SyntaxError"] },
    { "ErrorEquals": ["RangeError"] },
    { "ErrorEquals": ["States.ALL"] }
  ],
  "End": true
}
```

Then, the following command is run:

```sh
local-sfn -f state-machine.json -r TaskToRetry:100 '{ "num1": 1, "num2": 2 }'
```

This command would execute the state machine, and if the `TaskToRetry` state fails, the execution would be paused for 100 milliseconds before retrying the state again, disregarding the `IntervalSeconds`, `BackoffRate`, `MaxDelaySeconds`, and `JitterStrategy` fields that could've been specified in any of the `Retry` field retriers.

Alternatively, you can also pass a list of comma-separated numbers as value, to override the duration of specific retriers, for instance:

```sh
local-sfn -f state-machine.json -r TaskToRetry:100,-1,20 '{ "num1": 1, "num2": 2 }'
```

The above command would pause the execution for 100 milliseconds if the state error is matched by the first retrier and it would pause for 20 milliseconds if the error matches the third retrier. Note that a -1 was passed for the second retrier. This means that the pause duration of the second retrier will not be overridden, instead, it will be calculated as usually with the `IntervalSeconds` and the other retrier fields, or use the default values if said fields are not specified.

Furthermore, you can pass this option multiple times, to override the `Retry` fields in multiple states. For example:

```sh
local-sfn \
  -f state-machine.json \
  -r SendRequest:1500 \
  -r ProcessData:250 \
  -r MapResponses:0 \
  '{ "num1": 1, "num2": 2 }'
```

This command would execute the state machine, and override the duration of the retry pause in states `SendRequest` and `ProcessData` to pause the execution for 1500 and 250 milliseconds, respectively. The retry in the `MapResponses` state wouldn't be paused at all, since the override value is set to 0.

### Passing a custom Context Object

If the JSONPaths in your definition reference the Context Object, you can provide a mock Context Object by passing either the `--context` or the `--context-file` option. For example, given the following definition:

```json
{
  "StartAt": "Get execution context data",
  "States": {
    "Get execution context data": {
      "Type": "Pass",
      "Parameters": {
        "execId.$": "$$.Execution.Id",
        "execName.$": "$$.Execution.Name"
      },
      "End": true
    }
  }
}
```

And given the following `context.json` file:

```json
{
  "Execution": {
    "Id": "arn:aws:states:us-east-1:123456789012:execution:stateMachineName:executionName",
    "Name": "executionName"
  }
}
```

You could provide the Context Object to the execution in the following manner:

```sh
local-sfn \
  -f state-machine.json \
  --context-file context.json \
  '{}'
```

### Disabling ASL validations

Before attempting to run the state machine with the given inputs, the state machine definition itself is validated to check that:

- JSONPath strings are valid.
- ARNs in the `Resource` field of `Task` states are valid.
- There are no invalid fields.
- All states in the definition can be reached.

If any of these checks fail, `local-sfn` will print the validation error and exit. To partially suppress this behavior, you can pass the `--no-jsonpath-validation` option, to suppress JSONPath validation; and the `--no-arn-validation` option, to suppress ARN validation.

Alternatively, if you want to completely disable all validations, you can pass the `--no-validation` option. Be aware that passing this option implies no guarantees if the provided definition is invalid or contains non-standard fields: running it might result in undefined/unsupported behavior, so use at your own risk.

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

# AWS Local Step Functions

A Node.js implementation of the [Amazon States Language specification](https://states-language.net/spec.html).

This package lets you run AWS Step Functions locally on your machine!

> NOTE: This is a work in progress. Some features defined in the specification might not be supported at all yet or might have limited support.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Importing](#importing)
  - [Node.js](#nodejs)
    - [CommonJS](#commonjs)
    - [ES Module](#es-module)
- [API](#api)
  - [Constructor](#constructor-new-statemachinedefinition-validationoptions)
  - [StateMachine.run](#statemachineruninput-options)
- [Examples](#examples)
- [License](#license)

## Features

To see a list of features that have full support, partial support, or no support, refer to [this document](/docs/feature-support.md).

## Installation

```sh
npm install aws-local-stepfunctions
```

## Importing

Currently, the only supported environment to import the package is Node.js. Browser support is not available yet.

### Node.js

#### CommonJS

```js
const { StateMachine } = require('aws-local-stepfunctions');
```

#### ES Module

```js
import { StateMachine } from 'aws-local-stepfunctions';
```

## API

### Constructor: `new StateMachine(definition[, validationOptions])`

#### Parameters

The constructor takes the following parameters:

- `definition`: The Amazon States Language definition of the state machine.
- `validationOptions` (optional): An object that specifies how the definition should be validated.
  - `checkPaths`: If set to `false`, won't validate JSONPaths.
  - `checkArn`: If set to `false`, won't validate ARN syntax in `Task` states.

The constructor will attempt to validate the definition by default, unless the `validationOptions` param is specified. If the definition is not valid, an error will be thrown.

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
const stateMachine = new StateMachine(machineDefinition, { checkPaths: false });
```

### `StateMachine.run(input[, options])`

Runs the state machine with the given `input` parameter and returns an object with the following properties:

- `abort`: A function that takes no parameters and doesn't return any value. If called, aborts the execution and throws an `ExecutionAbortedError`, unless the `noThrowOnAbort` option is set.
- `result`: A `Promise` that resolves with the execution result once it finishes.

Each execution is independent of all others, meaning that you can concurrently call this method as many times as needed, without worrying about race conditions.

#### Parameters

- `input`: The initial input to pass to the state machine. This can be any valid JSON value.
- `options` (optional):
  - `overrides`: An object to override the behavior of certain states:
    - `taskResourceLocalHandlers`: Overrides the resource of the specified `Task` states to run a local function.
    - `waitTimeOverrides`: Overrides the wait duration of the specified `Wait` states. The specifed override duration should be in milliseconds.
  - `noThrowOnAbort`: If this option is set to `true`, aborting the execution will simply return `null` as result instead of throwing.

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

# AWS Local Step Functions

A Node.js implementation of the [Amazon States Language specification](https://states-language.net/spec.html).

This package lets you run AWS Step Functions locally on your machine!

> NOTE: This is a work in progress. Some features defined in the specification might not be supported at all yet or might have limited support.

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

The constructor takes the following parameters:

- `definition`: The Amazon States Language definition of the state machine.
- `validationOptions` (optional): An object that specifies how the definition should be validated.
  - `checkPaths`: If set to `false`, won't validate JSONPaths.
  - `checkArn`: If set to `false`, won't validate ARN syntax in `Task` states.

The constructor will attempt to validate the definition by default, unless the `validationOptions` param is specified. If the definition is not valid, an error will be thrown.

Example:

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

### `async StateMachine.run(input[, options])`

Executes the state machine with the given `input` parameter and returns the result of the execution.

It takes the following parameters:

- `input`: The initial input to pass to the state machine. This can be any valid JSON value.
- `options` (optional):
  - `overrides`: An object to overrides the behavior of certain states:
    - `taskResourceLocalHandlers`: Overrides the resource of the specified `Task` states to run a local function.
    - `waitTimeOverrides`: Overrides the wait duration of the specified `Wait` states. The specifed override duration should be in milliseconds.

Example without `options`:

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

const stateMachine = new StateMachine(machineDefinition, { checkPaths: false });
const myInput = { value1: 'hello', value2: 123, value3: true };
const result = await stateMachine.run(myInput); // execute the state machine

console.log(result); // log the result of the execution
```

Example with `options`:

```js
import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  StartAt: 'Hello World',
  States: {
    'Hello World': {
      Type: 'Task',
      Resource: 'arn:aws:lambda:us-east-1:123456789012:function:HelloWorld',
      Next: 'AddNumbers',
    },
    AddNumbers: {
      Type: 'Task',
      Resource: 'arn:aws:lambda:us-east-1:123456789012:function:AddNumbers',
      Next: 'Wait10Seconds',
    },
    Wait10Seconds: {
      Type: 'Wait',
      Seconds: 10,
      End: true,
    },
  },
};

function addNumbersLocal(input) {
  return input.num1 + input.num2;
}

const stateMachine = new StateMachine(machineDefinition, { checkPaths: false });
const myInput = { value1: 'hello', value2: 123, value3: true };
const result = await stateMachine.run(myInput, {
  overrides: {
    taskResourceLocalHandlers: {
      AddNumbers: addNumbersLocal, // call the `addNumbersLocal` function instead of invoking the Lambda function specified for the `AddNumbers` state
    },
    waitTimeOverrides: {
      Wait10Seconds: 500, // wait for 500 milliseconds instead of the 10 seconds specified in the `Wait10Seconds` state
    },
  },
});

console.log(result); // log the result of the execution
```

## License

[MIT](https://github.com/nibble-4bits/aws-local-stepfunctions/blob/develop/LICENSE)

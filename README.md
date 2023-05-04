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

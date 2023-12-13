# Feature support

## Table of contents

- [Spec features](#spec-features)
  - [Fully supported](#fully-supported)
  - [Not supported](#not-supported)
- [Non-spec features](#non-spec-features)
  - [Task resource override](#task-state-resource-override)
  - [Wait duration override](#wait-state-duration-override)
  - [Retry interval override](#retry-field-interval-override)
  - [Abort a running execution](#abort-a-running-execution)
  - [AWS config for Lambda functions](#providing-aws-credentials-and-region-to-execute-lambda-functions-specified-in-task-states)
  - [Execution event logs](#execution-event-logs)

## Spec features

The following features all come from the [Amazon States Language specification](https://states-language.net/).

### Fully supported

- Top-level fields
  - [x] `TimeoutSeconds`
- Input processing
  - [x] `InputPath`
  - [x] `Parameters`
- Output processing
  - [x] `ResultSelector`
  - [x] `ResultPath`
  - [x] `OutputPath`
- States
  - [x] Succeed
  - [x] Pass
    - [x] `Result`
  - [x] Wait
    - [x] `Seconds`
    - [x] `SecondsPath`
    - [x] `Timestamp`
    - [x] `TimestampPath`
  - [x] Task
    - [x] `Resource` (only Lambda functions supported)
    - [x] `TimeoutSeconds`
    - [x] `TimeoutSecondsPath`
  - [x] Parallel
    - [x] `Branches`
  - [x] Map
    - [x] `Iterator`
    - [x] `ItemProcessor`
    - [x] `Parameters`
    - [x] `ItemSelector`
    - [x] `ItemsPath`
    - [x] `MaxConcurrency`
    - [x] `MaxConcurrencyPath`
  - [x] Fail
    - [x] `Error`
    - [x] `ErrorPath`
    - [x] `Cause`
    - [x] `CausePath`
    - [x] Terminate execution with error
  - [x] Choice
    - Boolean expressions
      - [x] `And`
      - [x] `Or`
      - [x] `Not`
    - Data-test expressions
      - [x] `StringEquals`, `StringEqualsPath`
      - [x] `StringLessThan`, `StringLessThanPath`
      - [x] `StringGreaterThan`, `StringGreaterThanPath`
      - [x] `StringLessThanEquals`, `StringLessThanEqualsPath`
      - [x] `StringGreaterThanEquals`, `StringGreaterThanEqualsPath`
      - [x] `StringMatches`
      - [x] `NumericEquals`, `NumericEqualsPath`
      - [x] `NumericLessThan`, `NumericLessThanPath`
      - [x] `NumericGreaterThan`, `NumericGreaterThanPath`
      - [x] `NumericLessThanEquals`, `NumericLessThanEqualsPath`
      - [x] `NumericGreaterThanEquals`, `NumericGreaterThanEqualsPath`
      - [x] `BooleanEquals`, `BooleanEqualsPath`
      - [x] `TimestampEquals`, `TimestampEqualsPath`
      - [x] `TimestampLessThan`, `TimestampLessThanPath`
      - [x] `TimestampGreaterThan`, `TimestampGreaterThanPath`
      - [x] `TimestampLessThanEquals`, `TimestampLessThanEqualsPath`
      - [x] `TimestampGreaterThanEquals`, `TimestampGreaterThanEqualsPath`
      - [x] `IsNull`
      - [x] `IsPresent`
      - [x] `IsNumeric`
      - [x] `IsString`
      - [x] `IsBoolean`
      - [x] `IsTimestamp`
    - [x] Throw `States.NoChoiceMatched` error if no choice rule was matched and `Default`
- Intrinsic functions
  - [x] `States.Format`
  - [x] `States.StringToJson`
  - [x] `States.JsonToString`
  - [x] `States.Array`
  - [x] `States.ArrayPartition`
  - [x] `States.ArrayContains`
  - [x] `States.ArrayRange`
  - [x] `States.ArrayGetItem`
  - [x] `States.ArrayLength`
  - [x] `States.ArrayUnique`
  - [x] `States.Base64Encode`
  - [x] `States.Base64Decode`
  - [x] `States.Hash`
  - [x] `States.JsonMerge`
  - [x] `States.MathRandom`
  - [x] `States.MathAdd`
  - [x] `States.StringSplit`
  - [x] `States.UUID`
- Errors
  - [x] Runtime errors
    - [x] Predefined error codes
  - [x] Retry
    - [x] `MaxDelaySeconds`
    - [x] `JitterStrategy`
  - [x] Catch

### Not supported

- States
  - Task
    - [ ] `HeartbeatSeconds`
    - [ ] `HeartbeatSecondsPath`
    - [ ] `Credentials`
  - Map
    - [ ] Distributed mode
    - [ ] `ItemReader`
    - [ ] `ItemBatcher`
    - [ ] `ResultWriter`
    - [ ] `ToleratedFailurePercentage`
    - [ ] `ToleratedFailureCount`

## Non-spec features

The following features are not defined in the specification, but they have been added for convenience.

### `Task` state resource override

`aws-local-stepfunctions` has the ability to invoke Lambda functions specified in the `Resource` field of `Task` states, provided that you have the necessary AWS credentials. No other service integrations are currently available.

However, if you want to be able to run a state machine completely locally (no matter the type of `Resource` specified) you can specify a local function to be called in place of the resource. This is accomplished through the `overrides.taskResourceLocalHandlers` option of the [`StateMachine.run`](/README.md#statemachineruninput-options) method. This option expects an object that maps state names to an overriding local function.

The overriding function will receive the processed input of its `Task` state as the first argument. The return value of said function will be the result of the state (but not its output, which as defined in the spec, depends on further processing done by the `ResultSelector`, `ResultPath` and `OutputPath` fields).

Effectively, task resource overrides allow `aws-local-stepfunctions` to execute state machines without calls to any AWS service, if you override all of the `Task` states in the state machine definition.

An example usage of this feature can be found [here](/examples/task-state-local-override.js).

### `Wait` state duration override

As defined by the spec, `Wait` states in `aws-local-stepfunction` will pause the state machine execution until the specified `Seconds` have elapsed or the specified `Timestamp` has been reached.

Nonetheless, if you want to override the duration of the wait period of a `Wait` state, you can do so by specifying the `overrides.waitTimeOverrides` option of the [`StateMachine.run`](/README.md#statemachineruninput-options) method. This option expects an object that maps state names to numbers, where the number represents the amount of milliseconds that the overridden `Wait` state will pause the execution for. Note that you may pass `0` for the number value, which effectively means that the overridden `Wait` state will not pause the execution at all.

An example usage of this feature can be found [here](/examples/wait-state-local-override.js).

### `Retry` field interval override

As defined by the spec, retriers in a `Retry` field will pause the execution for a certain amount of time before retrying the failed `Task`/`Parallel`/`Map` state, based on the `IntervalSeconds`, `BackoffRate`, `MaxDelaySeconds`, and `JitterStrategy` fields.

If you wish to override the duration of this pause, you can do so by specifying the `overrides.retryIntervalOverrides` option of the [`StateMachine.run`](/README.md#statemachineruninput-options) method. This option expects an object that maps state names to numbers or arrays:

- If you pass a number as value, this value represents the number of milliseconds that the overridden `Retry` field will pause the execution for. This applies to all retriers in the array.
- If you pass an array as value, each value in the array should be a number and it represents how many milliseconds to pause the execution for the retrier at that index, i.e., the value at index 0 applies for the retrier at index 0, the value at index 1 applies for the retrier at index 1, and so forth. If don't want to override a retrier, simply set the value to `-1`, to indicate that the retrier at that index should not be overridden.

In a similar fashion to the [`Wait` state duration override](#wait-state-duration-override), you can pass a duration of `0` to indicate that the overridden retrier should not pause the execution at all before retrying the failed state.

An example usage of this feature can be found [here](/examples/retry-interval-local-override.js).

### Abort a running execution

If for some reason you need to abort an execution in progress, you can do so by calling the `abort` method that is part of the object returned by the `StateMachine.run` method.

By default, aborting an execution will throw an error of type `ExecutionAbortedError`, which you can catch and compare against using `instanceof`. A demonstration of this behavior can be found in this [example](/examples/abort-execution.js).

If instead you prefer to abort an execution without throwing an error, you can pass the `noThrowOnAbort` option to the `StateMachine.run` method. When this option is `true`, aborting an execution will simply return `null` as result. Likewise, an example demonstrating this behavior can be found [here](/examples/abort-execution-without-throwing.js).

### Providing AWS credentials and region to execute Lambda functions specified in `Task` states

_NOTE: If you have [overridden](#task-state-resource-override) all `Task` states in your state machine with local functions, you don't need to specify any AWS credentials or region._

When using `aws-local-stepfunctions` on Node, you don't need to specify AWS credentials explicitly, as those will be automatically loaded from the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` [environment variables](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-environment.html) or from the [shared credentials file](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-shared.html), as described in the [AWS JavaScript SDK docs](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html).

Similarly, you don't need to specify the AWS region, as it will also be automatically loaded, in this case from the `AWS_REGION` environment variable or from the shared config file, as described in the [SDK docs](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-region.html).

However, when using `aws-local-stepfunctions` in the browser you must provide AWS credentials, otherwise the `aws-local-stepfunctions` will not be able to invoke the Lambda functions and the execution will fail.

To provide credentials and region, specify the `stateMachineOptions.awsConfig` option in the `StateMachine` [constructor](/README.md#constructor-new-statemachinedefinition-statemachineoptions). You can set two types of credentials:

1. [Access Keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html): Access Key ID and Secret Access Key ([example](/examples/aws-credentials-access-keys.js)).
2. [Cognito Identity Pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html): The ID of a Cognito Identity Pool ([example](/examples/aws-credentials-cognito.js)).

Make sure that the IAM user/role associated with the access keys or Cognito Identity Pool have the necessary policies to be able to invoke the Lambda functions referenced in your state machine definition.

### Execution event logs

During the course of an execution, the state machine goes through several events, such as transitioning into different states, or performing the action that corresponds to each type of event. Naturally, these events happen until the execution terminates, either by reaching the end state, encountering an error and failing, being aborted or timing out.

`aws-local-stepfunctions` provides the ability to retrieve these events through the `eventLogs` property that is part of the object returned by the `StateMachine.run` method. This feature is similar to the execution logs returned by the [GetExecutionHistory](https://docs.aws.amazon.com/step-functions/latest/apireference/API_GetExecutionHistory.html) action of the AWS Step Functions API.

Note that the `eventLogs` property is an [`AsyncGenerator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator), meaning that the events are yielded as they occur.

You could, for example, use these events to debug your state machine by having a better insight into how and when the execution transitions between the states of the machine.

An example usage of this feature can be found [here](/examples/execution-event-logs.js).

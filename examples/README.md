# Examples

Here you can find some useful examples demonstrating specific usages of AWS Local Step Functions.

- [abort-execution-without-throwing](./abort-execution-without-throwing.js): Abort a running execution without throwing an error.
- [abort-execution](./abort-execution.js): Abort a running execution.
- [aws-credentials-access-keys](./aws-credentials-access-keys.js): Providing AWS credentials to run the Lambdas specified in `Task` states, by using an Access Key ID and a Secret Access Key.
- [aws-credentials-cognito](./aws-credentials-cognito.js): Providing AWS credentials to run the Lambdas specified in `Task` states, by using a Cognito Identity Pool.
- [check-for-execution-failure](./check-for-execution-failure.js): Check if execution failed and catch error.
- [check-for-execution-timeout](./check-for-execution-timeout.js): Check if execution timed out because the execution ran longer than the seconds specified in the `TimeoutSeconds` field and catch error.
- [custom-context-object](./custom-context-object.js): Pass a mock Context Object to the execution.
- [disable-arn-validation](./disable-arn-validation.js): Disable ARN validation when instantiating a new `StateMachine` object.
- [disable-jsonpath-validation](./disable-jsonpath-validation.js): Disable JSONPath validation when instantiating a new `StateMachine` object.
- [disable-state-machine-validation](./disable-state-machine-validation.js): Completely disable validation of the state machine definition when instantiating a new `StateMachine` object.
- [execution-event-logs](./execution-event-logs.js): Pulling the log of events produced by an execution as it runs and printing them.
- [retry-interval-local-override](./retry-interval-local-override.js): Override the pause duration of a `Retry` policy so that instead of pausing for the duration calculated by the `IntervalSeconds`, `BackoffRate`, `MaxDelaySeconds`, and `JitterStrategy` fields, it pauses for a specified number of milliseconds.
- [task-state-local-override](./task-state-local-override.js): Override the default action for a `Task` state, so that instead of invoking the Lambda specified in the `Resource` field, it runs a local function. This allows running state machines completely locally.
- [wait-state-local-override](./wait-state-local-override.js): Override the wait duration of a `Wait` state so that instead of waiting the duration specified in the `Seconds`, `Timestamp`, `SecondsPath`, `TimestampPath` fields, it waits for a specified number of milliseconds.

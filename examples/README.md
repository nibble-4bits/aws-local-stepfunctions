# Examples

Here you can find some useful examples demonstrating specific usages of AWS Local Step Functions.

- [abort-execution-without-throwing](./abort-execution-without-throwing.js): Abort a running execution without throwing an error.
- [abort-execution](./abort-execution.js): Abort a running execution.
- [check-for-execution-failure](./check-for-execution-failure.js): Check if execution failed and catch error.
- [disable-state-machine-validation](./disable-state-machine-validation.js): Disable ARN and/or JSONPath validations when instantiating a new `StateMachine` object.
- [task-state-local-override](./task-state-local-override.js): Override the default action for a `Task` state, so that instead of invoking the Lambda specified in the `Resource` field, it runs a local function. This allows running state machines completely locally.
- [wait-state-local-override](./wait-state-local-override.js): Override the wait duration of a `Wait` state so that instead of waiting the duration specified in the `Seconds`, `Timestamp`, `SecondsPath`, `TimestampPath` fields, it waits for a specified number of milliseconds.
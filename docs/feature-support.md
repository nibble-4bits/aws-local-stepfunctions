# Feature support

## Spec features

The following features all come from the [Amazon States Language specification](https://states-language.net/).

### Fully supported

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
  - [x] Map
    - [x] `Iterator`
    - [x] `ItemsPath`
    - [x] `MaxConcurrency`
  - [x] Fail
    - [x] `Error`
    - [x] `Cause`
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
- Errors
  - [x] Runtime errors
    - [x] Predefined error codes
  - [x] Retry/Catch

### Limited support

- States
  - Task
    - [x] `Resource` (only Lambda functions supported)
    - [ ] `TimeoutSeconds`
    - [ ] `HeartbeatSeconds`
    - [ ] `TimeoutSecondsPath`
    - [ ] `HeartbeatSecondsPath`

### No support

- [ ] Parallel state
- [ ] Intrinsic functions

## Non-spec features

The following features are not defined in the specification, but they have been added for convenience.

- [x] Override Task state resource with a local function handler ([example](/examples/task-state-local-override.js))
- [x] Override Wait state duration ([example](/examples/wait-state-local-override.js))
- [x] Abort a running execution ([example](/examples/abort-execution.js))

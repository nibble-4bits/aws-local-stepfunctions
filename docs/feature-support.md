# Feature support

## Fully supported

- Input processing
  - [x] `InputPath`
  - [x] `Parameters`
- Output processing
  - [x] `ResultSelector`
  - [x] `ResultPath`
  - [x] `OutputPath`
- States
  - [x] Pass
  - [x] Wait
  - [x] Succeed

## Limited support

- States
  - Task
    - [x] `Resource` (only Lambda functions supported)
    - [ ] `TimeoutSeconds`
    - [ ] `HeartbeatSeconds`
    - [ ] `TimeoutSecondsPath`
    - [ ] `HeartbeatSecondsPath`
  - Map
    - [x] `Iterator`
    - [x] `ItemsPath`
    - [ ] `MaxConcurrency`
  - Choice
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
    - [ ] Throw `States.NoChoiceMatched` error if no choice rule was matched and `Default`
  - Fail
    - [ ] `Error`
    - [ ] `Cause`
    - [ ] Terminate execution with error

## No support

- [ ] Parallel state
- [ ] Intrinsic functions
- [ ] Runtime errors
  - [ ] Predefined error codes
- [ ] Retry/Catch

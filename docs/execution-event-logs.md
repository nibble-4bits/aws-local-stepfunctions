# Execution event logs

## Table of contents

- [Events](#events)
- [Types of events](#types-of-events)
  - [`ExecutionStarted` event](#executionstarted-event)
  - [`ExecutionSucceeded` event](#executionsucceeded-event)
  - [`ExecutionFailed` event](#executionfailed-event)
  - [`ExecutionAborted` event](#executionaborted-event)
  - [`ExecutionTimeout` event](#executiontimeout-event)
  - [`MapIterationStarted` event](#mapiterationstarted-event)
  - [`MapIterationSucceeded` event](#mapiterationsucceeded-event)
  - [`MapIterationFailed` event](#mapiterationfailed-event)
  - [`ParallelBranchStarted` event](#parallelbranchstarted-event)
  - [`ParallelBranchSucceeded` event](#parallelbranchsucceeded-event)
  - [`ParallelBranchFailed` event](#parallelbranchfailed-event)
  - [`StateEntered` event](#stateentered-event)
  - [`StateExited` event](#stateexited-event)
- [Helper data types](#helper-data-types)
  - [`StateData`](#statedata)

## Events

Execution events are represented as plain objects, and all of them share two common fields:

- `type`: A string that indicates the type of the event being produced.
- `timestamp`: The Unix timestamp in milliseconds, representing the time at which the event was produced.

In turn, each type of event may contain additional fields containing supplementary data associated with the event.

## Types of events

### `ExecutionStarted` event

The `ExecutionStarted` event is produced when the execution is started.

#### Additional fields

- `input`: Input value passed to the execution.

#### Example

```js
{
    type: 'ExecutionStarted',
    timestamp: 1234567890123,
    input: { id: 5, coordX: '12.638614', coordY: '-36.581396' }
}
```

---

### `ExecutionSucceeded` event

The `ExecutionSucceeded` event is produced when the execution ends successfully.

#### Additional fields

- `output`: Output value produced by the execution.

#### Example

```js
{
    type: 'ExecutionSucceeded',
    timestamp: 1234567890123,
    output: [55, 99, 22]
}
```

---

### `ExecutionFailed` event

The `ExecutionFailed` event is produced when the execution encounters an error and fails.

#### Additional fields

- `Error`: Name of the error that caused the failure.
- `Cause`: This field can either be a string or an object:
  - `string`: Contains a description explaining why the execution failed.
  - `object`: Contains details that provide information as to why the execution failed.

#### Example

```js
{
    type: 'ExecutionFailed',
    timestamp: 1234567890123,
    Error: 'TypeError',
    Cause: "Cannot read properties of undefined (reading '0')"
}
```

---

### `ExecutionAborted` event

The `ExecutionAborted` event is produced when the execution is aborted by calling the `abort` function returned by the [`StateMachine.run`](/README.md#statemachineruninput-options) method.

#### Additional fields

None.

#### Example

```js
{
    type: 'ExecutionAborted',
    timestamp: 1234567890123
}
```

---

### `ExecutionTimeout` event

The `ExecutionTimeout` event is produced when the execution times out because the execution ran longer than the number of seconds specified in the [`TimeoutSeconds` top-level field](https://states-language.net/#toplevelfields).

#### Additional fields

None.

#### Example

```js
{
    type: 'ExecutionTimeout',
    timestamp: 1234567890123
}
```

---

### `MapIterationStarted` event

The `MapIterationStarted` event is produced when an iteration in a `Map` state has started.

#### Additional fields

- `parentState`: An object of type [`StateData`](#statedata) containing data associated with the `Map` state to which this iteration belongs to.
- `index`: The index of this iteration.
- `input`: Input value passed to the iteration.

#### Example

```js
{
    type: 'MapIterationStarted',
    timestamp: 1234567890123,
    parentState: {
        name: 'MapState',
        type: 'Map',
        input: [
            { prod: "R31", dest-code: 9511, quantity: 1344 },
            { prod: "S39", dest-code: 9511, quantity: 40 }
        ]
    },
    index: 0,
    input: { prod: "R31", dest-code: 9511, quantity: 1344 }
}
```

---

### `MapIterationSucceeded` event

The `MapIterationSucceeded` event is produced when an iteration in a `Map` state ends successfully.

#### Additional fields

- `parentState`: An object of type [`StateData`](#statedata) containing data associated with the `Map` state to which this iteration belongs to.
- `index`: The index of this iteration.
- `output`: Output value produced by the iteration.

#### Example

```js
{
    type: 'MapIterationSucceeded',
    timestamp: 1234567890123,
    parentState: {
        name: 'MapState',
        type: 'Map',
        input: [
            { prod: "R31", dest-code: 9511, quantity: 1344 },
            { prod: "S39", dest-code: 9511, quantity: 40 }
        ]
    },
    index: 0,
    output: true
}
```

---

### `MapIterationFailed` event

The `MapIterationFailed` event is produced when an iteration in a `Map` encounters an error and fails.

#### Additional fields

- `parentState`: An object of type [`StateData`](#statedata) containing data associated with the `Map` state to which this iteration belongs to.
- `index`: The index of this iteration.
- `Error`: Name of the error that caused the failure.
- `Cause`: This field can either be a string or an object:
  - `string`: Contains a description explaining why the iteration failed.
  - `object`: Contains details that provide information as to why the iteration failed.

#### Example

```js
{
    type: 'MapIterationFailed',
    timestamp: 1234567890123,
    parentState: {
        name: 'MapState',
        type: 'Map',
        input: [
            { prod: "R31", dest-code: 9511, quantity: 1344 },
            { prod: "S39", dest-code: 9511, quantity: 40 }
        ]
    },
    index: 0,
    Error: 'CustomProcessingError',
    Cause: 'Could not process item with id `R31` sucessfully'
}
```

---

### `ParallelBranchStarted` event

The `ParallelBranchStarted` event is produced when a branch in a `Parallel` state has started.

#### Additional fields

- `parentState`: An object of type [`StateData`](#statedata) containing data associated with the `Parallel` state to which this branch belongs to.
- `input`: Input value passed to the branch.

#### Example

```js
{
    type: 'ParallelBranchStarted',
    timestamp: 1234567890123,
    parentState: {
        name: 'ParallelState',
        type: 'Parallel',
        input: { bucketName: 'videos-bucket', key: 'training/first-day.mp4' }
    },
    input: { bucketName: 'videos-bucket', key: 'training/first-day.mp4' }
}
```

---

### `ParallelBranchSucceeded` event

The `ParallelBranchSucceeded` event is produced when a branch in a `Parallel` state ends successfully.

#### Additional fields

- `parentState`: An object of type [`StateData`](#statedata) containing data associated with the `Parallel` state to which this branch belongs to.
- `output`: Output value produced by the branch.

#### Example

```js
{
    type: 'ParallelBranchSucceeded',
    timestamp: 1234567890123,
    parentState: {
        name: 'ParallelState',
        type: 'Parallel',
        input: { bucketName: 'videos-bucket', key: 'training/first-day.mp4' }
    },
    output: { compressedSize: 12364311 }
}
```

---

### `ParallelBranchFailed` event

The `ParallelBranchFailed` event is produced when a branch in a `Parallel` state encounters an error and fails.

#### Additional fields

- `parentState`: An object of type [`StateData`](#statedata) containing data associated with the `Parallel` state to which this branch belongs to.
- `Error`: Name of the error that caused the failure.
- `Cause`: This field can either be a string or an object:
  - `string`: Contains a description explaining why the branch failed.
  - `object`: Contains details that provide information as to why the branch failed.

#### Example

```js
{
    type: 'ParallelBranchFailed',
    timestamp: 1234567890123,
    parentState: {
        name: 'ParallelState',
        type: 'Parallel',
        input: { bucketName: 'videos-bucket', key: 'training/first-day.mp4' }
    },
    Error: 'CompressionError',
    Cause: 'Could not apply compression to item stored in bucket'
}
```

---

### `StateEntered` event

The `StateEntered` event is produced when the execution transitions into a new state.

#### Additional fields

- `state`: An object of type [`StateData`](#statedata) containing data associated with the state that was entered.
- `index?`: The index of the `Map` iteration in which this state is being executed. This property is only set if this state is being executed within a `Map` state.

#### Example

```js
{
    type: 'StateEntered',
    timestamp: 1234567890123,
    state: {
        name: 'AddNumbers',
        type: 'Task',
        input: { num1: 3, num2: 2 }
    }
}
```

---

### `StateExited` event

The `StateExited` event is produced when the execution transitions out of a state.

#### Additional fields

- `state`: An object of type [`StateData`](#statedata) containing data associated with the state that was exited.
- `index?`: The index of the `Map` iteration in which this state was executed. This property is only set if this state was executed within a `Map` state.

#### Example

```js
{
    type: 'StateExited',
    timestamp: 1234567890123,
    state: {
        name: 'AddNumbers',
        type: 'Task',
        input: { num1: 3, num2: 2 },
        output: 5
    }
}
```

## Helper data types

#### `StateData`

```ts
interface StateData {
  name: string;
  type: 'Task' | 'Parallel' | 'Map' | 'Pass' | 'Wait' | 'Choice' | 'Succeed' | 'Fail';
  input: any;
  output?: any;
}
```

- `name`: Name of the state.
- `type`: Type of the state.
- `input`: The input passed to the state.
- `output`: The output produced by the state. Only set when event is of type `StateExited`.

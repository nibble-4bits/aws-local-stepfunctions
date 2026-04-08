# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build
npm run build           # Build all targets (Node CJS/ESM, Browser ESM, CLI)
npm run build:watch     # Watch mode

# Test
npm test                                             # Run all tests
npm test -- __tests__/StateMachine.test.ts           # Run a single test file
npm test -- --testNamePattern="pattern"              # Filter tests by name
npm test -- --coverage                               # Run with coverage

# Lint & format
npm run lint            # ESLint check
npm run lint:fix        # ESLint with auto-fix
npm run prettier        # Check formatting
npm run prettier:fix    # Fix formatting
```

## What This Project Does

`aws-local-stepfunctions` is a TypeScript implementation of the [Amazon States Language](https://states-language.net/spec.html) that executes AWS Step Functions state machines entirely locally — no AWS account or internet access required. It supports both Node.js (CJS and ESM) and browsers, plus a CLI (`local-sfn`).

Primary use cases:
- Locally test state machine logic before deploying to AWS
- Integration-test Lambda invocations via task overrides (replace Lambda calls with local functions)
- Debug executions via event log streaming

## Architecture & Execution Flow

### Entry Point

`src/main.ts` exports three things: `StateMachine` class, `ExecutionError`/`ExecutionAbortedError`/`ExecutionTimeoutError` error classes, and their associated TypeScript types.

### Core Execution Pipeline

```
StateMachine.run(input, options)
  └── validates definition (asl-validator)
  └── loops through states, calling StateExecutor.execute() for each
        ├── InputOutputProcessing.processInputPath()
        ├── InputOutputProcessing.processPayloadTemplate()   ← Parameters
        ├── [dispatch to StateAction by type]
        ├── InputOutputProcessing.processResultPath()
        └── InputOutputProcessing.processOutputPath()
```

1. **`StateMachine`** (`src/stateMachine/StateMachine.ts`) — validates the definition, manages execution lifecycle (timeouts via `TimeoutSeconds`, abort signals, concurrent execution safety), and drives state transitions via `StateExecutor`.

2. **`StateExecutor`** (`src/stateMachine/StateExecutor.ts`) — executes a single state. Applies input/output processing, dispatches to the right `StateAction`, and implements retry/catch logic (with configurable backoff, jitter, `MaxDelaySeconds`, and `JitterStrategy`).

3. **`stateActions/`** — one file per state type: `Task`, `Pass`, `Choice`, `Wait`, `Map`, `Parallel`, `Succeed`, `Fail`. Each contains the state's core behavior.

4. **`InputOutputProcessing`** (`src/stateMachine/InputOutputProcessing.ts`) — applies the four transform steps between states:
   - `processInputPath` — JSONPath selection on input (`null` → `{}`, `undefined` → passthrough)
   - `processPayloadTemplate` — resolves `Parameters`/`ItemSelector` templates (keys ending in `.$` are evaluated as JSONPath or intrinsic functions)
   - `processResultPath` — merges result back into raw input at a JSONPath location (`null` → discard result, keep raw input)
   - `processOutputPath` — JSONPath selection on final result

5. **`IntrinsicFunctionEvaluation`** (`src/stateMachine/IntrinsicFunctionEvaluation.ts`) — evaluates all 18 `States.*` intrinsic functions (see full list in `src/typings/`). Nested calls are evaluated inside-out.

6. **`jsonPath/`** — JSONPath parsing and evaluation with constraint validation for use within state machine expressions.

7. **`EventLogger`** (`src/stateMachine/EventLogger.ts`) — records execution events (state entered/exited, task scheduled, etc.) as an `AsyncGenerator<EventLog>` stream returned from `run()`.

### Concurrency

- `Parallel` state creates independent branch `StateMachine` instances run concurrently.
- `Map` state creates one `StateMachine` per item, respecting `MaxConcurrency` via `p-limit`.
- Each `run()` call is independent; concurrent calls on the same `StateMachine` instance are safe.

## Public API

### `StateMachine` constructor

```typescript
new StateMachine(definition, options?)
```

`options.validationOptions`:
- `checkPaths` (default: `true`) — validate JSONPaths
- `checkArn` (default: `true`) — validate ARN syntax
- `noValidate` (default: `false`) — skip all validation

`options.awsConfig` — required in browsers, optional in Node (falls back to SDK credential chain):
- `region`: AWS region string
- `credentials`: `{ cognitoIdentityPool: string }` or `{ accessKeys: { accessKeyId, secretAccessKey } }`

### `StateMachine.run(input, options?)`

Returns `{ result: Promise<JSONValue>, abort(): void, eventLogs: AsyncGenerator<EventLog> }`.

`options.overrides`:
- `taskResourceLocalHandlers`: `Record<stateName, (input, abortSignal) => JSONValue>` — replaces Lambda invocations with local functions
- `waitTimeOverrides`: `Record<stateName, milliseconds>` — replaces `SecondsPath`/`Seconds` durations
- `retryIntervalOverrides`: `Record<stateName, ms | ms[]>` — replaces retry backoff intervals

`options.noThrowOnAbort`: return `null` instead of throwing `ExecutionAbortedError` when aborted.

`options.context`: Custom [Context Object](https://docs.aws.amazon.com/step-functions/latest/dg/input-output-contextobject.html).

## CLI

Installed globally as `local-sfn`. Key options:

```
-d, --definition <json>              Inline ASL definition JSON
-f, --definition-file <path>         Path to ASL definition file
-t, --override-task <state:path>     Replace Task state with local executable (repeatable)
-w, --override-wait <state:ms>       Override Wait state duration in ms (repeatable)
-r, --override-retry <state:ms|ms[]> Override retry pause in ms (repeatable)
--context <json>                     Context Object JSON
--context-file <path>                Path to Context Object file
--no-jsonpath-validation             Skip JSONPath validation
--no-arn-validation                  Skip ARN validation
--no-validation                      Skip all validation
[inputs...]                          JSON input values; also reads from stdin
```

Exit codes: `0` = all succeeded, `1` = pre-execution error, `2` = at least one execution failed.

## Build Targets

`tsup.config.ts` produces three outputs:

| Target | Output | Notes |
|--------|--------|-------|
| Node CJS + ESM | `build/main.node.cjs` / `.esm.js` | AWS SDK kept external |
| Browser ESM | `build/main.browser.esm.js` | Fully bundled, no external deps |
| CLI | `bin/CLI.cjs` | Standalone; imports node build via esbuild plugin |

TypeScript strict mode is fully enabled (`exactOptionalPropertyTypes`, `noImplicitReturns`, `noUnusedLocals`, etc.). Prettier print width is 120 chars.

## Feature Support Notes

**Not implemented** (listed in `docs/feature-support.md`):
- Task: `HeartbeatSeconds`, `HeartbeatSecondsPath`, `Credentials`
- Map: Distributed mode, `ItemReader`, `ItemBatcher`, `ResultWriter`, `ToleratedFailurePercentage/Count`

**Non-spec extensions** supported:
- `taskResourceLocalHandlers` — replace Task resource with a local function
- `waitTimeOverrides` — override wait durations at runtime
- `retryIntervalOverrides` — override retry pause durations
- Execution abort via `abort()`
- `eventLogs` AsyncGenerator stream

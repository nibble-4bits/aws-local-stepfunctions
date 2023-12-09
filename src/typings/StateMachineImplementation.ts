import type { JSONValue } from './JSONValue';
import type { Context } from './Context';
import type { FromCognitoIdentityPoolParameters } from '@aws-sdk/credential-provider-cognito-identity/dist-types/fromCognitoIdentityPool';
import type { AwsCredentialIdentity as AWSCredentials } from '@aws-sdk/types/dist-types/identity/AwsCredentialIdentity';
import type { EventLogger } from '../stateMachine/EventLogger';

export type TaskStateResourceLocalHandler = {
  [taskStateName: string]: (input: JSONValue) => Promise<JSONValue> | JSONValue;
};

export type WaitStateTimeOverride = {
  [waitStateName: string]: number;
};

export type RetryIntervalOverrides = {
  [retryableStateName: string]: number | number[];
};

interface Overrides {
  /**
   * Pass an object to this option to override a `Task` state to run a local function,
   * instead of calling the service specified in the `Resource` field.
   */
  taskResourceLocalHandlers?: TaskStateResourceLocalHandler;

  /**
   * Pass an object to this option to override a `Wait` state to pause for the specified number of milliseconds,
   * instead of pausing for the duration specified by the `Seconds`, `Timestamp`, `SecondsPath`, or `TimestampPath` fields.
   */
  waitTimeOverrides?: WaitStateTimeOverride;

  /**
   * Pass an object to this option to override the duration in milliseconds a retrier in a `Retry` field waits before retrying the state,
   * instead of pausing for the duration calculated by the `IntervalSeconds`, `BackoffRate`, `MaxDelaySeconds`, and `JitterStrategy` fields.
   */
  retryIntervalOverrides?: RetryIntervalOverrides;
}

export interface ValidationOptions {
  /**
   * Disables validation of the state machine definition entirely.
   *
   * Use this option at your own risk, there are no guarantees when passing an invalid or non-standard definition to the state machine.
   * Running it might result in undefined/unsupported behavior.
   */
  readonly noValidate?: boolean;

  /**
   * Disables validation of JSONPath expressions in the state machine definition.
   */
  readonly checkPaths?: boolean;

  /**
   * Disables validation of ARNs in the state machine definition.
   */
  readonly checkArn?: boolean;
}

export interface AWSConfig {
  /**
   * AWS Region where your Task resources are located.
   */
  region: string;

  /**
   * AWS credentials needed to be able to call Task resources.
   */
  credentials?: {
    cognitoIdentityPool?: FromCognitoIdentityPoolParameters;
    accessKeys?: AWSCredentials;
  };
}

export interface StateMachineOptions {
  /**
   * Options that allow changing certain rules when validating the state machine definition.
   */
  validationOptions?: ValidationOptions;

  /**
   * Config options related to AWS resources.
   */
  awsConfig?: AWSConfig;
}

export interface RunOptions {
  /**
   * This option allows overriding the behavior of certain states.
   */
  overrides?: Overrides;

  /**
   * If set to `true`, aborting the execution will simply return `null` as result instead of throwing
   */
  noThrowOnAbort?: boolean;

  /**
   * Pass an object to this option to mock the [Context Object](https://states-language.net/#context-object) that will be used in the execution.
   * @see https://docs.aws.amazon.com/step-functions/latest/dg/input-output-contextobject.html
   */
  context?: Context;

  /**
   * @internal DO NOT USE.
   *
   * This property is meant for internal use only.
   * There are no guarantees regarding future changes made to this property.
   */
  _rootAbortSignal?: AbortSignal | undefined;
}

export interface ExecuteOptions {
  stateMachineOptions: StateMachineOptions | undefined;
  runOptions: RunOptions | undefined;
  abortSignal: AbortSignal;
  eventLogger: EventLogger;
}

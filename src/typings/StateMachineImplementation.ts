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

interface Overrides {
  taskResourceLocalHandlers?: TaskStateResourceLocalHandler;
  waitTimeOverrides?: WaitStateTimeOverride;
}

export interface ValidationOptions {
  readonly checkPaths?: boolean;
  readonly checkArn?: boolean;
  /**
   * @internal DO NOT USE.
   *
   * This property is meant for internal use only.
   * There are no guarantees regarding future changes made to this property.
   */
  readonly _noValidate?: boolean;
}

export interface AWSConfig {
  region: string;
  credentials?: {
    cognitoIdentityPool?: FromCognitoIdentityPoolParameters;
    accessKeys?: Omit<AWSCredentials, 'expiration'>;
  };
}

export interface StateMachineOptions {
  validationOptions?: ValidationOptions;
  awsConfig?: AWSConfig;
}

export interface RunOptions {
  overrides?: Overrides;
  noThrowOnAbort?: boolean;
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

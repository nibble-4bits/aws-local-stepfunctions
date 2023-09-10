import type { JSONValue } from '../typings/JSONValue';
import type { AWSConfig } from '../typings/StateMachineImplementation';
import type { LambdaErrorResult } from '../typings/LambdaExecution';
import { LambdaClient as AWSLambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { LambdaInvocationError } from '../error/LambdaInvocationError';
import { StatesRuntimeError } from '../error/predefined/StatesRuntimeError';

/**
 * Wrapper class around the Lambda AWS SDK client
 */
export class LambdaClient {
  private readonly client: AWSLambdaClient;

  constructor(config: AWSConfig | undefined) {
    this.client = new AWSLambdaClient({});

    if (config) {
      if (!config.region) {
        throw new StatesRuntimeError(
          "'awsConfig' option was specified for state machine, but 'region' property is not set"
        );
      }

      // Check if multiple types of credentials were passed. Passing more than one type is an error.
      if (config.credentials) {
        const credentialsTypes = Object.keys(config.credentials);
        const credentialsNames = credentialsTypes.map((name) => `'${name}'`).join(', ');
        if (credentialsTypes.length > 1) {
          throw new StatesRuntimeError(
            `More than one type of AWS credentials were specified: ${credentialsNames}. Only one type may be specified`
          );
        }
      }

      if (config.credentials?.cognitoIdentityPool) {
        this.client = new AWSLambdaClient({
          region: config.region,
          credentials: fromCognitoIdentityPool({
            ...config.credentials.cognitoIdentityPool,
            clientConfig: { region: config.region },
          }),
        });
      } else if (config.credentials?.accessKeys) {
        this.client = new AWSLambdaClient({ region: config.region, credentials: config.credentials.accessKeys });
      }
    }
  }

  async invokeFunction(funcNameOrArn: string, payload: JSONValue) {
    const payloadBuffer = new TextEncoder().encode(JSON.stringify(payload));

    const invokeCommand = new InvokeCommand({
      FunctionName: funcNameOrArn,
      Payload: payloadBuffer,
    });

    try {
      const invocationResult = await this.client.send(invokeCommand);

      let resultValue = null;
      if (invocationResult.Payload) {
        resultValue = new TextDecoder().decode(invocationResult.Payload);
        resultValue = JSON.parse(resultValue);
      }

      if (invocationResult.FunctionError) {
        const errorResult = resultValue as LambdaErrorResult;
        throw new LambdaInvocationError(
          errorResult.errorType,
          `${errorResult.errorType}: ${errorResult.errorMessage}`,
          errorResult
        );
      }

      return resultValue;
    } catch (error) {
      if (typeof error === 'string') {
        throw new StatesRuntimeError(error);
      }

      throw error;
    }
  }
}

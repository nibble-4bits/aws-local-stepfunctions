import type { JSONValue } from '../typings/JSONValue';
import type { AWSConfig } from '../typings/StateMachineImplementation';
import type { LambdaErrorResult } from '../typings/LambdaExecution';
import { LambdaClient as AWSLambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { LambdaInvocationError } from '../error/LambdaInvocationError';
import { StatesRuntimeError } from '../error/predefined/StatesRuntimeError';
import { isBrowserEnvironment } from '../util';

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
          "'awsConfig' option was specified in state machine constructor, but 'region' property is not set."
        );
      }

      if (!config.credentials) {
        throw new StatesRuntimeError(
          "'awsConfig' option was specified in state machine constructor, but 'credentials' property is not set."
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
    } else {
      // Browser environments must provide an AWS config in order for the Lambda client to make API calls.
      if (isBrowserEnvironment) {
        throw new StatesRuntimeError(
          "aws-local-stepfunctions is running in a browser environment and your state machine definition contains a state of type 'Task'. In order to invoke the Lambda function, you must provide an AWS region and credentials in the state machine constructor by passing the 'awsConfig' option."
        );
      }
    }
  }

  async invokeFunction(funcNameOrArn: string, payload: JSONValue) {
    const payloadBuffer = new TextEncoder().encode(JSON.stringify(payload));

    const invokeCommand = new InvokeCommand({
      FunctionName: funcNameOrArn,
      Payload: payloadBuffer,
    });

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
  }
}

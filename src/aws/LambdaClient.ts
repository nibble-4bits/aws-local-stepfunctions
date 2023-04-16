import type { JSONValue } from '../typings/JSONValue';
import type { AWSConfig } from '../typings/StateMachineImplementation';
import { LambdaClient as AWSLambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { FailStateError } from '../error/FailStateError';

interface LambdaErrorResult {
  errorType: string;
  errorMessage: string;
  trace: string[];
}

/**
 * Wrapper class around the Lambda AWS SDK client
 */
export class LambdaClient {
  private readonly client: AWSLambdaClient;

  constructor(config: AWSConfig | undefined) {
    this.client = new AWSLambdaClient({});

    if (config) {
      if (!config.region) {
        throw new Error('`awsConfig` option was specified for state machine, but `region` property is not set');
      }

      // Check if multiple types of credentials were passed. Passing more than one type is an error.
      if (config.credentials) {
        const credentialsTypes = Object.keys(config.credentials);
        const credentialsNames = credentialsTypes.map((name) => `\`${name}\``).join(', ');
        if (credentialsTypes.length > 1) {
          throw new Error(
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
    const payloadBuffer = Buffer.from(JSON.stringify(payload));

    const invokeCommand = new InvokeCommand({
      FunctionName: funcNameOrArn,
      Payload: payloadBuffer,
    });

    const invocationResult = await this.client.send(invokeCommand);

    let resultValue = null;
    if (invocationResult.Payload) {
      resultValue = Buffer.from(invocationResult.Payload).toString();
      resultValue = JSON.parse(resultValue);
    }

    if (invocationResult.FunctionError) {
      const errorResult = resultValue as LambdaErrorResult;
      // Even though this is not a Fail State, we can take advantage of the `FailStateError`
      // to throw an error with a custom name and message.
      throw new FailStateError(errorResult.errorType, `Execution of Lambda function "${funcNameOrArn}" failed`);
    }

    return resultValue;
  }
}

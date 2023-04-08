import type { Credentials } from '@aws-sdk/types/dist-types/credentials';
import type { JSONValue } from '../typings/JSONValue';
import { LambdaClient as AWSLambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { FailStateError } from '../error/FailStateError';

interface LambdaClientConfig {
  region: string;
  credentials: Credentials;
}

interface LambdaErrorResult {
  errorType: string;
  errorMessage: string;
  trace: string[];
}

/**
 * Wrapper class around the Lambda AWS SDK client
 */
export class LambdaClient {
  private client: AWSLambdaClient;

  constructor(config?: LambdaClientConfig) {
    this.client = new AWSLambdaClient(config ?? {});
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

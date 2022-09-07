import { LambdaClient as AWSLambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { Credentials } from '@aws-sdk/types/dist-types/credentials';
import { LambdaExecutionError } from '../error/LambdaExecutionError';

interface LambdaClientConfig {
  region: string;
  credentials: Credentials;
}

/**
 * Wrapper class around the Lambda AWS SDK client
 */
export class LambdaClient {
  private client: AWSLambdaClient;

  constructor(config?: LambdaClientConfig) {
    this.client = new AWSLambdaClient(config ?? {});
  }

  async invokeFunction(funcNameOrArn: string, payload: Record<string, unknown>) {
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
      throw new LambdaExecutionError(resultValue, funcNameOrArn);
    }

    return resultValue;
  }
}

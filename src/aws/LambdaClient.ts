import { LambdaClient as AWSLambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { Credentials } from '@aws-sdk/types/dist-types/credentials';

interface LambdaClientConfig {
  region: string;
  credentials: Credentials;
}

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

    let resultValue;
    if (invocationResult.Payload) {
      resultValue = Buffer.from(invocationResult.Payload).toString();
    }

    return resultValue;
  }
}

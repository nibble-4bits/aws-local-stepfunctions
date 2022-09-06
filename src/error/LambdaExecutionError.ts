import { CustomError } from './CustomError';

interface LambdaErrorResult {
  errorType: string;
  errorMessage: string;
  trace: string[];
}

export class LambdaExecutionError extends CustomError {
  wrappedError: Error;

  constructor(errorResult: LambdaErrorResult, functionNameOrArn: string) {
    super(`Execution of Lambda function "${functionNameOrArn}" failed`);

    this.name = 'LambdaExecutionError';
    this.wrappedError = new Error(errorResult.errorMessage);
    this.wrappedError.stack = errorResult.trace.join('\n');
  }

  override toString(): string {
    return `${this.name}: ${this.message}. The error thrown by the Lambda was:
${this.wrappedError.stack}`;
  }
}

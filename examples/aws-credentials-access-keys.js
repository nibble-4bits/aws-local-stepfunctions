// NOTE: This example doesn't work out of the box.
// To be able to run it without errors:
//  1. Specify your own Lambda function in the `Resource` field of the state machine definition below.
//  2. Specify your own Access Key ID and Secret Access Key in the `awsConfig.credentials.accessKeys` constructor option.

import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  StartAt: 'AddNumbers',
  States: {
    AddNumbers: {
      Type: 'Task',
      // The Lambda below will be invoked using the Access Key ID and Secret Access Key specified in the StateMachine constructor options
      Resource: 'arn:aws:lambda:us-east-1:123456789012:function:AddNumbers',
      End: true,
    },
  },
};

const myInput = { num1: 10, num2: 20 };
const stateMachine = new StateMachine(machineDefinition, {
  awsConfig: {
    region: 'us-east-1', // The AWS region where the Lambda function is created
    credentials: {
      // Here we specify the Access Key ID and Secret Access Key that will be used to invoke the Lambda function
      accessKeys: {
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      },
      // WARNING: You shouldn't commit the `accessKeys` option, as that will expose your keys to other people in the repository.
      // Ideally, on Node your access keys should be loaded from one of the following two settings:
      //  - the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-environment.html
      //  - the shared `credentials` file: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-shared.html
      // The `accessKeys` option is meant for browser use, where the two settings above are not available as they have no web platform equivalent.
    },
  },
});
const { result } = stateMachine.run(myInput);

console.log('result', await result);

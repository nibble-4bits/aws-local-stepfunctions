// NOTE: This example doesn't work out of the box.
// To be able to run it without errors:
//  1. Specify your own Lambda function in the `Resource` field of the state machine definition below.
//  2. Specify your own Cognito Identity Pool in the `identityPoolId` property of the `awsConfig.credentials.cognitoIdentityPool` constructor option.

import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  StartAt: 'AddNumbers',
  States: {
    AddNumbers: {
      Type: 'Task',
      // The Lambda below will be invoked using the credentials provided by the Cognito Identity Pool specified in the StateMachine constructor options
      Resource: 'arn:aws:lambda:us-east-1:123456789012:function:AddNumbers',
      End: true,
    },
  },
};

const myInput = { num1: 10, num2: 20 };
const stateMachine = new StateMachine(machineDefinition, {
  awsConfig: {
    region: 'us-east-1', // The AWS region where the Lambda function and Cognito Identity Pool are created
    credentials: {
      cognitoIdentityPool: {
        // Here we specify the ID of the Cognito Identity Pool that will be used to request credentials
        identityPoolId: 'us-east-1:a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5',
      },
    },
  },
});
const { result } = stateMachine.run(myInput);

console.log('result', await result);

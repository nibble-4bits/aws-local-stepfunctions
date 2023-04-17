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
    },
  },
});
const { result } = stateMachine.run(myInput);

console.log('result', await result);

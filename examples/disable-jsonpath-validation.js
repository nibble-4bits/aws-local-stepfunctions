import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  Comment: 'A simple minimal example of the States language',
  StartAt: 'Hello World',
  States: {
    'Hello World': {
      Type: 'Task',
      InputPath: 'invalid JSONPath syntax',
      Resource: 'arn:aws:lambda:us-east-1:123456789012:function:AddNumbers',
      End: true,
    },
  },
};

// Construct a new state machine with the given definition and don't validate JSONPaths
const stateMachine = new StateMachine(machineDefinition, {
  validationOptions: {
    checkPaths: false,
  },
});

// The following log is printed because no error was thrown by the constructor
console.log('No error was thrown!');

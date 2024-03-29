import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  Comment: 'A simple minimal example of the States language',
  StartAt: 'Hello World',
  States: {
    'Hello World': {
      Type: 'Task',
      Resource: 'arn:aws:lambda:us-east-1:123456789012:function:AddNumbers',
      End: true,
    },
    UnreachableState: {
      Type: 'Succeed',
    },
    InvalidStateType: {
      Type: 'SomeNewType',
    },
  },
  InvalidTopLevelField: {},
};

// Construct a new state machine with the given definition and don't validate it at all
const stateMachine = new StateMachine(machineDefinition, {
  validationOptions: {
    noValidate: true,
  },
});

// The following log is printed because no error was thrown by the constructor
console.log('No error was thrown!');

import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  Comment: 'A simple minimal example of the States language',
  StartAt: 'Hello World',
  States: {
    'Hello World': {
      Type: 'Task',
      InputPath: 'invalid JSONPath syntax',
      Resource: 'invalid arn syntax',
      End: true,
    },
  },
};

// Construct a new state machine with the given definition and don't validate ARNs nor JSONPaths
const stateMachine = new StateMachine(machineDefinition, {
  validationOptions: {
    checkArn: false,
    checkPaths: false,
  },
});

// The following log is printed because no error was thrown by the constructor
console.log('No error was thrown!');

import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  Comment: 'Accessing context object in a state machine',
  StartAt: 'Get execution context data',
  States: {
    'Get execution context data': {
      Type: 'Pass',
      Parameters: {
        'execId.$': '$$.Execution.Id', // JSONPaths starting with `$$` query the context object, not the input
        'execName.$': '$$.Execution.Name',
      },
      End: true,
    },
  },
};

const stateMachine = new StateMachine(machineDefinition);
const myInput = {};
const contextObject = {
  Execution: {
    Id: 'some execution id',
    Name: 'execution name',
  },
};
const execution = stateMachine.run(myInput, {
  context: contextObject,
});

const result = await execution.result;
console.log(result); // Logs `{ execId: 'some execution id', execName: 'execution name' }`

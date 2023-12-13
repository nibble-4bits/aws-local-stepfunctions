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
        'execInput.$': '$$.Execution.Input', // '$$.Execution.Input' and '$$.Execution.StartTime' are always prepopulated, even if you don't explicitly provide them
        'execStartTime.$': '$$.Execution.StartTime',
      },
      End: true,
    },
  },
};

const stateMachine = new StateMachine(machineDefinition);
const myInput = { number: 10, string: 'Hello!' };
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
console.log(result); // Logs the following object:
// {
//   execId: 'some execution id',
//   execName: 'execution name',
//   execInput: { number: 10, string: 'Hello!' },
//   execStartTime: '2023-12-13T02:10:53.153Z'
// }

import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  StartAt: 'AddNumbers',
  States: {
    AddNumbers: {
      Type: 'Task',
      Resource: 'arn:aws:lambda:us-east-1:123456789012:function:AddNumbers',
      Next: 'WaitBeforeEndingExecution',
    },
    WaitBeforeEndingExecution: {
      Type: 'Wait',
      Seconds: 5,
      End: true,
    },
  },
};

const stateMachine = new StateMachine(machineDefinition);
const myInput = { num1: 5, num2: 7 };

// Execute the state machine
const execution = stateMachine.run(myInput, {
  noThrowOnAbort: true, // Enable `noThrowOnAbort` option
  overrides: {
    taskResourceLocalHandlers: {
      AddNumbers: (input) => {
        return input.num1 + input.num2;
      },
    },
  },
});

// Abort the execution after 2 seconds
setTimeout(() => {
  execution.abort();
}, 2000);

const result = await execution.result;
console.log(result); // Will log `null` even when aborted, because of `noThrowOnAbort` option

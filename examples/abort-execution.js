import { StateMachine, ExecutionAbortedError } from 'aws-local-stepfunctions';

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

try {
  const result = await execution.result;
  console.log(result); // If not aborted, would log 12 once execution finishes
} catch (e) {
  if (e instanceof ExecutionAbortedError) {
    // Since execution was aborted, type of error is `ExecutionAbortedError`
    console.log('Execution was aborted');
  } else {
    console.error('Some other error', e);
  }
}

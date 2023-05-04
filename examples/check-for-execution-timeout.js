import { StateMachine, ExecutionTimeoutError } from 'aws-local-stepfunctions';

const machineDefinition = {
  StartAt: 'WaitState',
  TimeoutSeconds: 1, // Specify `TimeoutSeconds` to 1, so execution will time out after 1 second
  States: {
    WaitState: {
      Type: 'Wait',
      Seconds: 10,
      End: true,
    },
  },
};

const stateMachine = new StateMachine(machineDefinition);
const myInput = {};
const execution = stateMachine.run(myInput);

try {
  // Execution times out and fails
  const result = await execution.result;
  console.log(result);
} catch (error) {
  // When execution times out, type of error is `ExecutionTimeoutError`
  if (error instanceof ExecutionTimeoutError) {
    console.error('The execution has timed out');
  }
}

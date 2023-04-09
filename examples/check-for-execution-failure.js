import { StateMachine, ExecutionError } from 'aws-local-stepfunctions';

const machineDefinition = {
  StartAt: 'MapState',
  States: {
    MapState: {
      Type: 'Map',
      Iterator: {
        StartAt: 'Success',
        States: {
          Success: {
            Type: 'Succeed',
          },
        },
      },
      End: true,
    },
  },
};

const stateMachine = new StateMachine(machineDefinition);
const myInput = 'this is not an array';
const execution = stateMachine.run(myInput);

try {
  // Execution fails because Map state expects an array as input
  const result = await execution.result;
  console.log(result);
} catch (error) {
  // When execution fails, type of error is `ExecutionError`
  if (error instanceof ExecutionError) {
    console.error('The execution has failed:', error);
  }
}

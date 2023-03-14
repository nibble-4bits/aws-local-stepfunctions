import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  StartAt: 'Wait10Seconds',
  States: {
    Wait10Seconds: {
      Type: 'Wait',
      Seconds: 10,
      End: true,
    },
  },
};

const stateMachine = new StateMachine(machineDefinition);
const myInput = { value1: 'hello', value2: 123, value3: true };
const execution = stateMachine.run(myInput, {
  overrides: {
    // Property `waitTimeOverrides` lets you override any number of Wait states,
    // by specifying the Wait state name as the key and the duration override as value (represented in milliseconds):
    waitTimeOverrides: {
      Wait10Seconds: 500, // wait for 500 milliseconds instead of the 10 seconds specified in the `Wait10Seconds` state
    },
  },
});

const result = await execution.result;
console.log(result);

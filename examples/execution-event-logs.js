import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  StartAt: 'ProcessAdditions',
  States: {
    ProcessAdditions: {
      Type: 'Map',
      Iterator: {
        StartAt: 'AddNumbers',
        States: {
          AddNumbers: {
            Type: 'Task',
            Resource: 'arn:aws:lambda:us-east-1:123456789012:function:AddNumbers',
            End: true,
          },
        },
      },
      Next: 'Wait1Second',
    },
    Wait1Second: {
      Type: 'Wait',
      Seconds: 1,
      End: true,
    },
  },
};

function addNumbersLocal(event) {
  return event.num1 + event.num2;
}

const stateMachine = new StateMachine(machineDefinition);
const myInput = [
  { num1: 10, num2: 20 },
  { num1: 30, num2: 40 },
  { num1: 50, num2: 60 },
];
const execution = stateMachine.run(myInput, {
  overrides: {
    taskResourceLocalHandlers: {
      AddNumbers: addNumbersLocal,
    },
  },
});

// Since `execution.eventLogs` returns an `AsyncGenerator`, we can use a `for await...of` loop
// to pull the events as they are produced during the course of the execution
for await (const event of execution.eventLogs) {
  console.dir(event, { depth: null });
  console.log('------------------------------------------------------------');
}

const result = await execution.result;
console.log(result);

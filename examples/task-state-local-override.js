import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  StartAt: 'AddNumbers',
  States: {
    AddNumbers: {
      Type: 'Task',
      Resource: 'arn:aws:lambda:us-east-1:123456789012:function:AddNumbers',
      End: true,
    },
  },
};

// The local task handler function receives the state input as the first parameter,
// the same way it would if this was a Lambda function handler: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html
function addNumbersLocal(event) {
  return event.num1 + event.num2;
}

const stateMachine = new StateMachine(machineDefinition);
const myInput = { num1: 10, num2: 20 };
const execution = stateMachine.run(myInput, {
  overrides: {
    // Property `taskResourceLocalHandlers` lets you override any number of Task states,
    // by specifying the Task state name as the key and the local function as value, as in the example below:
    taskResourceLocalHandlers: {
      // Call the `addNumbersLocal` function instead of invoking the Lambda function specified for the `AddNumbers` state.
      // Note that the key is the name of the `Task` state that we want to override.
      AddNumbers: addNumbersLocal,
    },
  },
});

const result = await execution.result;
console.log(result); // Logs 30 as result

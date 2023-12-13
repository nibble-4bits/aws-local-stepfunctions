import { StateMachine } from 'aws-local-stepfunctions';

const machineDefinition = {
  StartAt: 'RetryTask',
  States: {
    RetryTask: {
      // A state of type `Task` with a `Retry` policy that defines 3 retriers:
      // one for `SyntaxError`, another one for `RangeError`, and the last one for all errors.
      Type: 'Task',
      Resource: 'arn:aws:lambda:us-east-1:123456789012:function:RetryTask',
      Retry: [
        {
          ErrorEquals: ['SyntaxError'],
        },
        {
          ErrorEquals: ['RangeError'],
        },
        {
          ErrorEquals: ['States.ALL'],
        },
      ],
      End: true,
    },
  },
};

const stateMachine = new StateMachine(machineDefinition);
const myInput = { num1: 10, num2: 20 };
const execution = stateMachine.run(myInput, {
  overrides: {
    taskResourceLocalHandlers: {
      RetryTask: (input) => {
        const randNum = Math.random();
        if (randNum < 0.3) {
          throw new SyntaxError('Syntax error');
        } else if (randNum > 0.3 && randNum < 0.6) {
          throw new RangeError('Range error');
        } else {
          throw new Error('Unknown error');
        }
      },
    },
    // Property `retryIntervalOverrides` lets you override the pause duration of a `Retry` policy before the state is retried again,
    // by specifying the Task/Parallel/Map state name as the key and the duration override as value (represented in milliseconds):
    retryIntervalOverrides: {
      RetryTask: 50, // pause for 50 milliseconds before retrying the `RetryTask` state, instead of the default 1, 2, and 4 seconds.

      // Alternatively, you can also pass an array to specify the override for each retrier.
      // Pass the duration overrides in the same order as the retriers you've defined for the `Retry` field array.
      // If you don't want to override a retrier, pass -1 to indicate that the retrier at that index should not be overridden.
      // Uncomment the following line to test it out:
      // RetryTask: [-1, 500, 0], // don't override the `SyntaxError` retrier, pause 500ms for the `RangeError` retrier, and don't pause at all for the `States.ALL` retrier
    },
  },
});

for await (const eventLog of execution.eventLogs) {
  console.log(eventLog);
  console.log('--------------------------------------------------');
}

const result = await execution.result;
console.log(result);

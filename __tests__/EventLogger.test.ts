import type { RuntimeError } from '../src/error/RuntimeError';
import type {
  ExecutionFailedEvent,
  ExecutionStartedEvent,
  ExecutionSucceededEvent,
  ExecutionTerminatedEvent,
  StateEvent,
} from '../src/typings/EventLogs';
import { EventLogger } from '../src/stateMachine/EventLogger';
import './_customMatchers';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Event Logger', () => {
  const mockDateNowFunction = jest.fn(() => 1670198400000); // 2022-12-05T00:00:00Z

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(mockDateNowFunction);
  });

  describe('Log retrieval', () => {
    test('should return event logs after dispatching several events', async () => {
      const eventLogger = new EventLogger();
      const generator = eventLogger.getEvents();

      eventLogger.dispatchExecutionStartedEvent(50);
      eventLogger.dispatchStateEnteredEvent('SomeState', 'Choice', { a: 1, b: 'string', c: true, d: [1, 2, 3] });
      eventLogger.dispatchStateExitedEvent('AnotherState', 'Task', ['a', 'b', 1, null], 123.456);
      eventLogger.dispatchExecutionSucceededEvent('result');

      const firstEvent = await generator.next();
      const secondEvent = await generator.next();
      const thirdEvent = await generator.next();
      const fourthEvent = await generator.next();
      const endEvent = await generator.next();

      expect(firstEvent.value).toEqual({ type: 'ExecutionStarted', timestamp: 1670198400000, input: 50 });
      expect(secondEvent.value).toEqual({
        type: 'StateEntered',
        timestamp: 1670198400000,
        state: { name: 'SomeState', type: 'Choice', input: { a: 1, b: 'string', c: true, d: [1, 2, 3] } },
      });
      expect(thirdEvent.value).toEqual({
        type: 'StateExited',
        timestamp: 1670198400000,
        state: { name: 'AnotherState', type: 'Task', input: ['a', 'b', 1, null], output: 123.456 },
      });
      expect(fourthEvent.value).toEqual({ type: 'ExecutionSucceeded', timestamp: 1670198400000, output: 'result' });
      expect(endEvent.value).toBeUndefined();

      expect(firstEvent.done).toBe(false);
      expect(secondEvent.done).toBe(false);
      expect(thirdEvent.done).toBe(false);
      expect(fourthEvent.done).toBe(false);
      expect(endEvent.done).toBe(true);
    });
  });

  describe('Nested event forwarding', () => {
    describe('Map iteration event forwarding', () => {
      test('should forward `ExecutionStarted` event into `MapIterationStarted` event', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: ExecutionStartedEvent = { type: 'ExecutionStarted', timestamp: Date.now(), input: 'input' };

        eventLogger.forwardNestedMapEvent(event, 0, 'MapState', {});

        const { value, done } = await generator.next();

        expect(value).toEqual({
          type: 'MapIterationStarted',
          timestamp: 1670198400000,
          input: 'input',
          index: 0,
          parentState: { type: 'Map', name: 'MapState', input: {} },
        });
        expect(done).toBe(false);
      });

      test('should forward `ExecutionSucceeded` event into `MapIterationSucceeded` event', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: ExecutionSucceededEvent = { type: 'ExecutionSucceeded', timestamp: Date.now(), output: 'output' };

        eventLogger.forwardNestedMapEvent(event, 3, 'MapState', {});

        const { value, done } = await generator.next();

        expect(value).toEqual({
          type: 'MapIterationSucceeded',
          timestamp: 1670198400000,
          output: 'output',
          index: 3,
          parentState: { type: 'Map', name: 'MapState', input: {} },
        });
        expect(done).toBe(false);
      });

      test('should forward `ExecutionFailed` event into `MapIterationFailed` event', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: ExecutionFailedEvent = {
          type: 'ExecutionFailed',
          timestamp: Date.now(),
          Error: 'MapFailure',
          Cause: 'An error occurred',
        };

        eventLogger.forwardNestedMapEvent(event, 1, 'MapState', {});

        const { value, done } = await generator.next();

        expect(value).toEqual({
          type: 'MapIterationFailed',
          timestamp: 1670198400000,
          Error: 'MapFailure',
          Cause: 'An error occurred',
          index: 1,
          parentState: { type: 'Map', name: 'MapState', input: {} },
        });
        expect(done).toBe(false);
      });

      test('should forward `StateEntered` event and add index', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: StateEvent = {
          type: 'StateEntered',
          timestamp: Date.now(),
          state: { name: 'SomeEvent', type: 'Succeed', input: {} },
        };

        eventLogger.forwardNestedMapEvent(event, 2, 'MapState', {});

        const { value, done } = await generator.next();

        expect(value).toEqual({
          type: 'StateEntered',
          timestamp: 1670198400000,
          index: 2,
          state: { name: 'SomeEvent', type: 'Succeed', input: {} },
        });
        expect(done).toBe(false);
      });

      test('should forward `StateExited` event and add index', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: StateEvent = {
          type: 'StateExited',
          timestamp: Date.now(),
          state: { name: 'SomeEvent', type: 'Succeed', input: {}, output: {} },
        };

        eventLogger.forwardNestedMapEvent(event, 4, 'MapState', {});

        const { value, done } = await generator.next();

        expect(value).toEqual({
          type: 'StateExited',
          timestamp: 1670198400000,
          index: 4,
          state: { name: 'SomeEvent', type: 'Succeed', input: {}, output: {} },
        });
        expect(done).toBe(false);
      });

      test('should not forward `ExecutionAborted` event', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: ExecutionTerminatedEvent = { type: 'ExecutionAborted', timestamp: Date.now() };

        eventLogger.forwardNestedMapEvent(event, 5, 'MapState', {});

        const forwardedEvent = generator.next();

        await expect(forwardedEvent).not.toSettle(100);
      });

      test('should not forward `ExecutionTimeout` event', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: ExecutionTerminatedEvent = { type: 'ExecutionTimeout', timestamp: Date.now() };

        eventLogger.forwardNestedMapEvent(event, 5, 'MapState', {});

        const forwardedEvent = generator.next();

        await expect(forwardedEvent).not.toSettle(100);
      });
    });

    describe('Parallel branch event forwarding', () => {
      test('should forward `ExecutionStarted` event into `ParallelBranchStarted` event', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: ExecutionStartedEvent = { type: 'ExecutionStarted', timestamp: Date.now(), input: 'input' };

        eventLogger.forwardNestedParallelEvent(event, 'ParallelState', {});

        const { value, done } = await generator.next();

        expect(value).toEqual({
          type: 'ParallelBranchStarted',
          timestamp: 1670198400000,
          input: 'input',
          parentState: { type: 'Parallel', name: 'ParallelState', input: {} },
        });
        expect(done).toBe(false);
      });

      test('should forward `ExecutionSucceeded` event into `ParallelBranchSucceeded` event', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: ExecutionSucceededEvent = { type: 'ExecutionSucceeded', timestamp: Date.now(), output: 'output' };

        eventLogger.forwardNestedParallelEvent(event, 'ParallelState', {});

        const { value, done } = await generator.next();

        expect(value).toEqual({
          type: 'ParallelBranchSucceeded',
          timestamp: 1670198400000,
          output: 'output',
          parentState: { type: 'Parallel', name: 'ParallelState', input: {} },
        });
        expect(done).toBe(false);
      });

      test('should forward `ExecutionFailed` event into `ParallelBranchFailed` event', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: ExecutionFailedEvent = {
          type: 'ExecutionFailed',
          timestamp: Date.now(),
          Error: 'ParallelFailure',
          Cause: 'An error occurred',
        };

        eventLogger.forwardNestedParallelEvent(event, 'ParallelState', {});

        const { value, done } = await generator.next();

        expect(value).toEqual({
          type: 'ParallelBranchFailed',
          timestamp: 1670198400000,
          Error: 'ParallelFailure',
          Cause: 'An error occurred',
          parentState: { type: 'Parallel', name: 'ParallelState', input: {} },
        });
        expect(done).toBe(false);
      });

      test('should not forward `ExecutionAborted` event', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: ExecutionTerminatedEvent = { type: 'ExecutionAborted', timestamp: Date.now() };

        eventLogger.forwardNestedParallelEvent(event, 'ParallelState', {});

        const forwardedEvent = generator.next();

        await expect(forwardedEvent).not.toSettle(100);
      });

      test('should not forward `ExecutionTimeout` event', async () => {
        const eventLogger = new EventLogger();
        const generator = eventLogger.getEvents();
        const event: ExecutionTerminatedEvent = { type: 'ExecutionTimeout', timestamp: Date.now() };

        eventLogger.forwardNestedParallelEvent(event, 'ParallelState', {});

        const forwardedEvent = generator.next();

        await expect(forwardedEvent).not.toSettle(100);
      });
    });
  });

  describe('Logger closing', () => {
    test('should close logger after dispatching `ExecutionSucceeded` event', async () => {
      const eventLogger = new EventLogger();
      const generator = eventLogger.getEvents();
      const output = 'output';

      eventLogger.dispatchExecutionSucceededEvent(output);

      const { value: firstValue, done: firstDone } = await generator.next();
      const { value: secondValue, done: secondDone } = await generator.next();

      expect(firstValue).toBeDefined();
      expect(firstDone).toBe(false);
      expect(secondValue).toBeUndefined();
      expect(secondDone).toBe(true);
    });

    test('should close logger after dispatching `ExecutionFailed` event', async () => {
      const eventLogger = new EventLogger();
      const generator = eventLogger.getEvents();
      const error = new Error('An error ocurred') as RuntimeError;

      eventLogger.dispatchExecutionFailedEvent(error);

      const { value: firstValue, done: firstDone } = await generator.next();
      const { value: secondValue, done: secondDone } = await generator.next();

      expect(firstValue).toBeDefined();
      expect(firstDone).toBe(false);
      expect(secondValue).toBeUndefined();
      expect(secondDone).toBe(true);
    });

    test('should close logger after dispatching `ExecutionAborted` event', async () => {
      const eventLogger = new EventLogger();
      const generator = eventLogger.getEvents();

      eventLogger.dispatchExecutionAbortedEvent();

      const { value: firstValue, done: firstDone } = await generator.next();
      const { value: secondValue, done: secondDone } = await generator.next();

      expect(firstValue).toBeDefined();
      expect(firstDone).toBe(false);
      expect(secondValue).toBeUndefined();
      expect(secondDone).toBe(true);
    });

    test('should close logger after dispatching `ExecutionTimeout` event', async () => {
      const eventLogger = new EventLogger();
      const generator = eventLogger.getEvents();

      eventLogger.dispatchExecutionTimeoutEvent();

      const { value: firstValue, done: firstDone } = await generator.next();
      const { value: secondValue, done: secondDone } = await generator.next();

      expect(firstValue).toBeDefined();
      expect(firstDone).toBe(false);
      expect(secondValue).toBeUndefined();
      expect(secondDone).toBe(true);
    });
  });
});

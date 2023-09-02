import type { RuntimeError } from '../error/RuntimeError';
import type { EventLog, ExecutionEvent, ExecutionFailedEvent } from '../typings/EventLogs';
import type { JSONValue } from '../typings/JSONValue';
import type { StateType } from '../typings/StateType';

/**
 * This class handles the dispatching and queuing of state machine events as they are produced,
 * which can then be consumed as an async stream via the `getEvents` async generator function.
 */
export class EventLogger {
  private eventTarget: EventTarget;
  private eventQueue: EventLog[];
  private isLoggerClosed: boolean;

  constructor() {
    this.eventTarget = new EventTarget();
    this.eventQueue = [];
    this.isLoggerClosed = false;
  }

  async *getEvents(): AsyncGenerator<EventLog> {
    while (true) {
      if (this.eventQueue.length === 0) {
        await this.waitForNewEvent();
      }

      let event = null;
      while ((event = this.eventQueue.shift())) {
        yield event;
      }

      if (this.isLoggerClosed) return;
    }
  }

  /**
   * Forward nested events created by `Map` states, to the root state machine event logger.
   * @param event An event dispatched by the nested state machine spawned by a `Map` state.
   * @param index Index of the current iteration being processed.
   * @param mapStateName Name of the `Map` state being executed.
   * @param mapStateRawInput Raw input passed to the `Map` state being executed.
   */
  forwardNestedMapEvent(event: EventLog, index: number, mapStateName: string, mapStateRawInput: JSONValue) {
    switch (event.type) {
      case 'ExecutionStarted':
        this.dispatchMapIterationStartedEvent(event, index, mapStateName, mapStateRawInput);
        break;
      case 'ExecutionSucceeded':
        this.dispatchMapIterationSucceededEvent(event, index, mapStateName, mapStateRawInput);
        break;
      case 'ExecutionFailed':
        this.dispatchMapIterationFailedEvent(event, index, mapStateName, mapStateRawInput);
        break;
      case 'StateEntered':
      case 'StateExited':
        event.index = index;
        this.dispatch(event);
        break;
      case 'ExecutionAborted':
      case 'ExecutionTimeout':
        return;
      default:
        this.dispatch(event);
        break;
    }
  }

  /**
   * Forward nested events created by `Parallel` states, to the root state machine event logger.
   * @param event An event dispatched by the nested state machines spawned by a `Parallel` state.
   * @param parallelStateName Name of the `Parallel` state being executed.
   * @param parallelStateRawInput Raw input passed to the `Parallel` state being executed.
   */
  forwardNestedParallelEvent(event: EventLog, parallelStateName: string, parallelStateRawInput: JSONValue) {
    switch (event.type) {
      case 'ExecutionStarted':
        this.dispatchParallelBranchStartedEvent(event, parallelStateName, parallelStateRawInput);
        break;
      case 'ExecutionSucceeded':
        this.dispatchParallelBranchSucceededEvent(event, parallelStateName, parallelStateRawInput);
        break;
      case 'ExecutionFailed':
        this.dispatchParallelBranchFailedEvent(event, parallelStateName, parallelStateRawInput);
        break;
      case 'ExecutionAborted':
      case 'ExecutionTimeout':
        return;
      default:
        this.dispatch(event);
        break;
    }
  }

  dispatchExecutionStartedEvent() {
    this.dispatch({ type: 'ExecutionStarted', timestamp: Date.now() });
  }

  dispatchExecutionSucceededEvent() {
    this.dispatch({ type: 'ExecutionSucceeded', timestamp: Date.now() });
    this.close();
  }

  dispatchExecutionFailedEvent(error: RuntimeError) {
    this.dispatch({ type: 'ExecutionFailed', timestamp: Date.now(), Error: error.name, Cause: error.message });
    this.close();
  }

  dispatchExecutionAbortedEvent() {
    this.dispatch({ type: 'ExecutionAborted', timestamp: Date.now() });
    this.close();
  }

  dispatchExecutionTimeoutEvent() {
    this.dispatch({ type: 'ExecutionTimeout', timestamp: Date.now() });
    this.close();
  }

  dispatchStateEnteredEvent(stateName: string, stateType: StateType, input: JSONValue) {
    this.dispatch({
      type: 'StateEntered',
      timestamp: Date.now(),
      state: { name: stateName, type: stateType, input },
    });
  }

  dispatchStateExitedEvent(stateName: string, stateType: StateType, input: JSONValue, output: JSONValue) {
    this.dispatch({
      type: 'StateExited',
      timestamp: Date.now(),
      state: { name: stateName, type: stateType, input, output },
    });
  }

  private dispatchMapIterationStartedEvent(
    event: ExecutionEvent,
    index: number,
    mapStateName: string,
    mapStateRawInput: JSONValue
  ) {
    this.dispatch({
      ...event,
      type: 'MapIterationStarted',
      index,
      parentState: { type: 'Map', name: mapStateName, input: mapStateRawInput },
    });
  }

  private dispatchMapIterationSucceededEvent(
    event: ExecutionEvent,
    index: number,
    mapStateName: string,
    mapStateRawInput: JSONValue
  ) {
    this.dispatch({
      ...event,
      type: 'MapIterationSucceeded',
      index,
      parentState: { type: 'Map', name: mapStateName, input: mapStateRawInput },
    });
  }

  private dispatchMapIterationFailedEvent(
    event: ExecutionFailedEvent,
    index: number,
    mapStateName: string,
    mapStateRawInput: JSONValue
  ) {
    this.dispatch({
      ...event,
      type: 'MapIterationFailed',
      index,
      parentState: { type: 'Map', name: mapStateName, input: mapStateRawInput },
    });
  }

  private dispatchParallelBranchStartedEvent(
    event: ExecutionEvent,
    parallelStateName: string,
    parallelStateRawInput: JSONValue
  ) {
    this.dispatch({
      ...event,
      type: 'ParallelBranchStarted',
      parentState: { type: 'Parallel', name: parallelStateName, input: parallelStateRawInput },
    });
  }

  private dispatchParallelBranchSucceededEvent(
    event: ExecutionEvent,
    parallelStateName: string,
    parallelStateRawInput: JSONValue
  ) {
    this.dispatch({
      ...event,
      type: 'ParallelBranchSucceeded',
      parentState: { type: 'Parallel', name: parallelStateName, input: parallelStateRawInput },
    });
  }

  private dispatchParallelBranchFailedEvent(
    event: ExecutionFailedEvent,
    parallelStateName: string,
    parallelStateRawInput: JSONValue
  ) {
    this.dispatch({
      ...event,
      type: 'ParallelBranchFailed',
      parentState: { type: 'Parallel', name: parallelStateName, input: parallelStateRawInput },
    });
  }

  private close() {
    this.isLoggerClosed = true;
    this.eventTarget.dispatchEvent(new Event('newEvent'));
  }

  private dispatch(event: EventLog) {
    if (this.isLoggerClosed) return;

    this.eventQueue.push(event);
    this.eventTarget.dispatchEvent(new Event('newEvent'));
  }

  private waitForNewEvent() {
    if (this.isLoggerClosed) return;

    return new Promise((resolve) => {
      this.eventTarget.addEventListener('newEvent', resolve, { once: true });
    });
  }
}

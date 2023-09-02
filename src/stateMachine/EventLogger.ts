import type { RuntimeError } from '../error/RuntimeError';
import type { EventLog } from '../typings/EventLogs';
import type { JSONValue } from '../typings/JSONValue';
import type { StateType } from '../typings/StateType';

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

  forwardEvent(event: EventLog) {
    this.dispatch(event);
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

  dispatchExecutionTimedOutEvent() {
    this.dispatch({ type: 'ExecutionTimedOut', timestamp: Date.now() });
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

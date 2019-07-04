import Handler from 'applicationRoot/Handler';
import Context from 'applicationRoot/Context';
import Severity from 'applicationRoot/utils/Severity';
import BrowserClient from 'applicationRoot/client/BrowserClient';

import StackFrame from 'stackframe';

const stackFrame = new StackFrame({
  functionName: 'funName',
  args: ['args'],
  fileName: 'http://localhost:3000/file.js',
  lineNumber: 1,
  columnNumber: 3288,
  isEval: true,
  isNative: false,
  source: 'ORIGINAL_STACK_LINE'
});

const mockSendEvent = jest.fn(() => {
  return new Promise((resolve, reject) => resolve());
});

jest.mock('applicationRoot/client/BrowserClient', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendEvent: mockSendEvent
    };
  });
});

describe('Handler', () => {
  beforeEach(() => {
    BrowserClient.mockClear();
    mockSendEvent.mockClear();
  });

  test('it should not handle the error if the handler is closed', () => {
    const handler = new Handler({
      token: '123456'
    });

    handler.close();

    expect(handler.handle('message', new Error('message'))).toEqual(undefined);
    expect(mockSendEvent).not.toBeCalled();
  });

  test('it should not handle the message if the handler is closed', () => {
    const handler = new Handler({
      token: '123456'
    });

    handler.close();

    expect(handler.handleMessage('message', Severity.Info)).toEqual(undefined);
    expect(mockSendEvent).not.toBeCalled();
  });

  test('it should handle the event if the handler is open', () => {
    const handler = new Handler({
      token: '123456'
    });

    return handler.handle('test', new Error('test')).then(() => {
      expect(BrowserClient.mock.calls.length).toEqual(1);
    });
  });

  test('it should build the event', () => {
    const handler = new Handler({
      token: '123456',
      env: 'test'
    });

    const event = handler.buildEvent('test', Severity.Info);

    expect(event).toMatchObject({ message: 'test', env: 'test' });
    expect(event).toHaveProperty('method');
    expect(event).toHaveProperty('url');
    expect(event).toHaveProperty('user_agent');
    expect(event).toHaveProperty('level', Severity.Info);
    expect(event).not.toHaveProperty('group_id');
  });

  test('it should build the event with stackframes', () => {
    const handler = new Handler({
      token: '123456',
      env: 'test'
    });

    const event = handler.buildEvent('test', Severity.Info, [stackFrame]);

    expect(event).toMatchObject({ message: 'test', env: 'test' });
    expect(event).toHaveProperty('method');
    expect(event).toHaveProperty('url');
    expect(event).toHaveProperty('user_agent');
    expect(event).toHaveProperty('level', Severity.Info);

    expect(event).toHaveProperty('file', stackFrame.getFileName());
    expect(event).toHaveProperty('line', stackFrame.getLineNumber());
    expect(event).toHaveProperty('col', stackFrame.getColumnNumber());
    expect(event).toHaveProperty('args', stackFrame.getArgs());
    expect(event).toHaveProperty('stack');

    expect(event).not.toHaveProperty('group_id');
  });

  test('it should add `group_id` to the event only when its severity level is `error`, `fatal`, `warning` or `critical`', () => {
    const handler = new Handler({
      token: '123456',
      env: 'test'
    });

    let event = null;

    [
      Severity.Fatal,
      Severity.Error,
      Severity.Warning,
      Severity.Critical
    ].forEach(severity => {
      event = handler.buildEvent('test', severity, [stackFrame]);

      expect(event).toMatchObject({ message: 'test', env: 'test' });
      expect(event).toHaveProperty('level', severity);
      expect(event).toHaveProperty('group_id');
    });
  });

  test('it should return an instance of Context', () => {
    const handler = new Handler({
      token: '123456'
    });

    expect(handler.getContext() instanceof Context);
  });
});

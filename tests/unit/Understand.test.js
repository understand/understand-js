import Handler from 'applicationRoot/Handler';
import Severity from 'applicationRoot/utils/Severity';
import Understand from 'applicationRoot/Understand';

const mockHandle = jest.fn();
const mockHandleMessage = jest.fn();

jest.mock('applicationRoot/Handler', () => {
  return jest.fn().mockImplementation(() => {
    return {
      handle: mockHandle,
      handleMessage: mockHandleMessage
    };
  });
});

describe('Understand - Preliminary', () => {
  test('it should not throw an error if the component is not initialized', () => {
    const errorEvent = new ErrorEvent('error event', {
      error: new Error('error event'),
      message: 'error message',
      lineno: 42,
      filename: 'index.html'
    });

    expect(() => Understand.catchErrors()).not.toThrow();
    expect(() => Understand.logError(errorEvent)).not.toThrow();
    expect(() => Understand.logMessage('my message')).not.toThrow();
    expect(() => Understand.close()).not.toThrow();
  });
});

describe('Understand', () => {
  beforeEach(() => {
    Understand.init({
      token: '123456'
    });

    Handler.mockClear();
    mockHandle.mockClear();
    mockHandleMessage.mockClear();
  });

  test('it should manually capture an ErrorEvent', () => {
    const errorEvent = new ErrorEvent('error event', {
      error: new Error('error event'),
      message: 'error message',
      lineno: 42,
      filename: 'index.html'
    });

    Understand.logError(errorEvent);

    expect(mockHandle).toBeCalledWith('error message', expect.any(Error), {});
  });

  test('it should manually capture a DOMException', () => {
    Understand.logError(new DOMException('dom exception', 'DOM Exception'));

    expect(mockHandleMessage).toBeCalledWith(
      'DOM Exception: dom exception',
      Severity.Error,
      [],
      {}
    );
  });

  test('it should manually capture a generic Error', () => {
    Understand.logError(new Error('error'));

    expect(mockHandle).toBeCalledWith('error', expect.any(Error), {});
  });

  test('it should manually capture an EvalError', () => {
    Understand.logError(new EvalError('EvalError', 'someFile.js', 10));

    expect(mockHandle).toBeCalledWith('EvalError', expect.any(EvalError), {});
  });

  test('it should manually capture a RangeError', () => {
    Understand.logError(new RangeError('RangeError', 'someFile.js', 10));

    expect(mockHandle).toBeCalledWith('RangeError', expect.any(Error), {});
  });

  test('it should manually capture a ReferenceError', () => {
    Understand.logError(
      new ReferenceError('ReferenceError', 'someFile.js', 10)
    );

    expect(mockHandle).toBeCalledWith('ReferenceError', expect.any(Error), {});
  });

  test('it should manually capture a SyntaxError', () => {
    Understand.logError(new SyntaxError('SyntaxError', 'someFile.js', 10));

    expect(mockHandle).toBeCalledWith('SyntaxError', expect.any(Error), {});
  });

  test('it should manually capture a TypeError', () => {
    Understand.logError(new TypeError('TypeError', 'someFile.js', 10));

    expect(mockHandle).toBeCalledWith('TypeError', expect.any(Error), {});
  });

  test('it should manually capture a URIError', () => {
    Understand.logError(new URIError('URIError', 'someFile.js', 10));

    expect(mockHandle).toBeCalledWith('URIError', expect.any(Error), {});
  });

  test('it should apply metadata when manually capturing an Error', () => {
    const meta = {
      foo: 'bar'
    };

    Understand.logError(new Error('error'), meta);

    expect(mockHandle).toBeCalledWith('error', expect.any(Error), meta);
  });

  test('it should manually capture a string', () => {
    Understand.logError('exception');

    expect(mockHandleMessage).toBeCalledWith(
      'exception',
      Severity.Error,
      [],
      {}
    );
  });

  test('it should assign a default `info` level when capturing a message', () => {
    Understand.logMessage('my message');

    expect(mockHandleMessage).toBeCalledWith(
      'my message',
      Severity.Info,
      [],
      {}
    );
  });

  test('it should apply metadata when capturing a message', () => {
    const meta = {
      foo: 'bar'
    };

    Understand.logMessage('my message', Severity.Info, meta);

    expect(mockHandleMessage).toBeCalledWith(
      'my message',
      Severity.Info,
      [],
      meta
    );
  });
});

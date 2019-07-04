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

    Understand.captureError(errorEvent);

    expect(mockHandle).toBeCalled();
    expect(mockHandle).toBeCalledWith('error message', expect.any(Error));
  });

  test('it should manually capture a DOMException', () => {
    Understand.captureError(new DOMException('dom exception', 'DOM Exception'));

    expect(mockHandleMessage).toBeCalled();
    expect(mockHandleMessage).toBeCalledWith(
      'DOM Exception: dom exception',
      Severity.Error
    );
  });

  test('it should manually capture a generic Error', () => {
    Understand.captureError(new Error('error'));

    expect(mockHandle).toBeCalled();
    expect(mockHandle).toBeCalledWith('error', expect.any(Error));
  });

  test('it should manually capture an EvalError', () => {
    Understand.captureError(new EvalError('EvalError', 'someFile.js', 10));

    expect(mockHandle).toBeCalled();
    expect(mockHandle).toBeCalledWith('EvalError', expect.any(EvalError));
  });

  test('it should manually capture a RangeError', () => {
    Understand.captureError(new RangeError('RangeError', 'someFile.js', 10));

    expect(mockHandle).toBeCalled();
    expect(mockHandle).toBeCalledWith('RangeError', expect.any(Error));
  });

  test('it should manually capture a ReferenceError', () => {
    Understand.captureError(
      new ReferenceError('ReferenceError', 'someFile.js', 10)
    );

    expect(mockHandle).toBeCalled();
    expect(mockHandle).toBeCalledWith('ReferenceError', expect.any(Error));
  });

  test('it should manually capture a SyntaxError', () => {
    Understand.captureError(new SyntaxError('SyntaxError', 'someFile.js', 10));

    expect(mockHandle).toBeCalled();
    expect(mockHandle).toBeCalledWith('SyntaxError', expect.any(Error));
  });

  test('it should manually capture a TypeError', () => {
    Understand.captureError(new TypeError('TypeError', 'someFile.js', 10));

    expect(mockHandle).toBeCalled();
    expect(mockHandle).toBeCalledWith('TypeError', expect.any(Error));
  });

  test('it should manually capture a URIError', () => {
    Understand.captureError(new URIError('URIError', 'someFile.js', 10));

    expect(mockHandle).toBeCalled();
    expect(mockHandle).toBeCalledWith('URIError', expect.any(Error));
  });

  test('it should manually capture a string', () => {
    Understand.captureError('exception');

    expect(mockHandleMessage).toBeCalled();
    expect(mockHandleMessage).toBeCalledWith('exception', Severity.Error);
  });

  test('it should assign a default `info` level when capturing a message', () => {
    Understand.captureMessage('my message');

    expect(mockHandleMessage).toBeCalled();
    expect(mockHandleMessage).toBeCalledWith('my message', Severity.Info);
  });
});

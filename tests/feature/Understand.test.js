import Severity from 'applicationRoot/utils/Severity';
import Understand from 'applicationRoot/Understand';
import Logger from 'applicationRoot/utils/Logger';

const mockLog = jest.fn();
const mockWarn = jest.fn();

jest.mock('applicationRoot/utils/Logger', () => {
  return jest.fn().mockImplementation(() => {
    return {
      log: mockLog,
      warn: mockWarn
    };
  });
});

describe('Understand', () => {
  beforeEach(() => {
    mockLog.mockClear();
    mockWarn.mockClear();
  });

  test('initializing the component without token should fallback to console transport', () => {
    initialize();

    expect(mockWarn).toHaveBeenCalledTimes(1);
  });

  describe('API', () => {
    describe('logError', () => {
      test('it should manually capture an Error', async () => {
        initialize();

        await Understand.logError(new Error('test error'));

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            args: [],
            col: expect.any(Number),
            context: {},
            env: 'testing',
            file: expect.stringMatching(/Understand.test.js/),
            group_id: expect.any(String),
            level: Severity.Error,
            line: expect.any(Number),
            message: 'test error',
            method: 'GET',
            request_id: expect.any(String),
            session_id: expect.any(String),
            stack: expect.any(Array),
            tags: ['js_error_log'],
            url: 'http://localhost/',
            user_agent: expect.any(String)
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture an Error with metadata', async () => {
        initialize();

        await Understand.logError(new Error('test error'), {
          foo: 'bar'
        });

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            args: [],
            col: expect.any(Number),
            context: {
              foo: 'bar'
            },
            env: 'testing',
            file: expect.stringMatching(/Understand.test.js/),
            group_id: expect.any(String),
            level: Severity.Error,
            line: expect.any(Number),
            message: 'test error',
            method: 'GET',
            request_id: expect.any(String),
            session_id: expect.any(String),
            stack: expect.any(Array),
            tags: ['js_error_log'],
            url: 'http://localhost/',
            user_agent: expect.any(String)
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture an Error with context information', async () => {
        initialize({
          context: {
            request_id: '08394443-31d5-4d65-8392-a29d733c498d',
            session_id: '7b52009b64fd0a2a49e6d8a939753077792b0554',
            user_id: 12,
            client_ip: '141.93.46.10'
          }
        });

        await Understand.logError(new Error('test error'));

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            args: [],
            client_ip: '141.93.46.10',
            col: expect.any(Number),
            context: {},
            env: 'testing',
            file: expect.stringMatching(/Understand.test.js/),
            group_id: expect.any(String),
            level: Severity.Error,
            line: expect.any(Number),
            message: 'test error',
            method: 'GET',
            request_id: '08394443-31d5-4d65-8392-a29d733c498d',
            session_id: '7b52009b64fd0a2a49e6d8a939753077792b0554',
            stack: expect.any(Array),
            tags: ['js_error_log'],
            url: 'http://localhost/',
            user_agent: expect.any(String),
            user_id: 12
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture an ErrorEvent', async () => {
        initialize();

        const errorEvent = new ErrorEvent('error event', {
          error: new Error('error event'),
          message: 'error message',
          lineno: 42,
          filename: 'index.html'
        });

        await Understand.logError(errorEvent);

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            args: [],
            col: expect.any(Number),
            context: {},
            env: 'testing',
            file: expect.stringMatching(/Understand.test.js/),
            group_id: expect.any(String),
            level: Severity.Error,
            line: expect.any(Number),
            message: 'error message',
            method: 'GET',
            request_id: expect.any(String),
            session_id: expect.any(String),
            stack: expect.any(Array),
            tags: ['js_error_log'],
            url: 'http://localhost/',
            user_agent: expect.any(String)
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture a DOMException', async () => {
        initialize();

        await Understand.logError(
          new DOMException('dom exception', 'DOM Exception')
        );

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            context: {},
            env: 'testing',
            level: Severity.Error,
            message: 'DOM Exception: dom exception',
            method: 'GET',
            request_id: expect.any(String),
            session_id: expect.any(String),
            tags: ['js_error_log'],
            url: 'http://localhost/',
            user_agent: expect.any(String)
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture an EvalError', async () => {
        initialize();

        await Understand.logError(
          new EvalError('EvalError', 'someFile.js', 10)
        );

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            env: 'testing',
            group_id: expect.any(String),
            level: Severity.Error,
            message: 'EvalError'
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture a RangeError', async () => {
        initialize();

        await Understand.logError(
          new RangeError('RangeError', 'someFile.js', 10)
        );

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            env: 'testing',
            group_id: expect.any(String),
            level: Severity.Error,
            message: 'RangeError'
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture a ReferenceError', async () => {
        initialize();

        await Understand.logError(
          new ReferenceError('ReferenceError', 'someFile.js', 10)
        );

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            env: 'testing',
            group_id: expect.any(String),
            level: Severity.Error,
            message: 'ReferenceError'
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture a SyntaxError', async () => {
        initialize();

        await Understand.logError(
          new SyntaxError('SyntaxError', 'someFile.js', 10)
        );

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            env: 'testing',
            group_id: expect.any(String),
            level: Severity.Error,
            message: 'SyntaxError'
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture a TypeError', async () => {
        initialize();

        await Understand.logError(
          new TypeError('TypeError', 'someFile.js', 10)
        );

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            env: 'testing',
            group_id: expect.any(String),
            level: Severity.Error,
            message: 'TypeError'
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture a URIError', async () => {
        initialize();

        await Understand.logError(new URIError('URIError', 'someFile.js', 10));

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            group_id: expect.any(String),
            level: Severity.Error,
            message: 'URIError'
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture a string as an Error', () => {
        initialize();

        Understand.logError('exception');

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            context: {},
            env: 'testing',
            level: Severity.Error,
            message: 'exception',
            method: 'GET',
            request_id: expect.any(String),
            session_id: expect.any(String),
            tags: ['js_error_log'],
            url: 'http://localhost/',
            user_agent: expect.any(String)
          }),
          expect.any(Map)
        );
      });

      test('it should filter an Error if filteredErrors is set', async () => {
        Understand.init({
          env: 'testing',
          disableSourceMaps: true,
          ignoredErrors: [/ResizeObserver/]
        });

        await Understand.logError(
          new Error('ResizeObserver loop limit exceeded')
        );

        expect(mockLog).not.toHaveBeenCalled();
      });

      test('it should filter an Error if blacklistedUrls is set', async () => {
        Understand.init({
          env: 'testing',
          disableSourceMaps: true,
          blacklistedUrls: [/http:\/\/*/]
        });

        await Understand.logError(new Error('test error'));

        expect(mockLog).not.toHaveBeenCalled();
      });

      test('it should filter the error using beforeSend', async () => {
        Understand.init({
          env: 'testing',
          disableSourceMaps: true,
          beforeSend: event => {
            return null;
          }
        });

        await Understand.logError(new Error('test error'));

        expect(mockLog).not.toHaveBeenCalled();
      });
    });

    describe('logMessage', () => {
      test('it should manually capture a message', async () => {
        Understand.init({
          env: 'testing',
          disableSourceMaps: true
        });

        await Understand.logMessage('test message');

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            context: {},
            env: 'testing',
            level: Severity.Info,
            message: 'test message',
            method: 'GET',
            request_id: expect.any(String),
            session_id: expect.any(String),
            tags: ['js_log'],
            url: 'http://localhost/',
            user_agent: expect.any(String)
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture a message with metadata', async () => {
        Understand.init({
          env: 'testing',
          disableSourceMaps: true
        });

        await Understand.logMessage('test message', Severity.Info, {
          foo: 'bar'
        });

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            context: {
              foo: 'bar'
            },
            env: 'testing',
            level: Severity.Info,
            message: 'test message',
            method: 'GET',
            request_id: expect.any(String),
            session_id: expect.any(String),
            tags: ['js_log'],
            url: 'http://localhost/',
            user_agent: expect.any(String)
          }),
          expect.any(Map)
        );
      });

      test('it should manually capture a message with context information', async () => {
        Understand.init({
          env: 'testing',
          disableSourceMaps: true,
          context: {
            request_id: '08394443-31d5-4d65-8392-a29d733c498d',
            session_id: '7b52009b64fd0a2a49e6d8a939753077792b0554',
            user_id: 12,
            client_ip: '141.93.46.10'
          }
        });

        await Understand.logMessage('test message');

        expect(mockLog).toBeCalledWith(
          expect.objectContaining({
            client_ip: '141.93.46.10',
            context: {},
            env: 'testing',
            level: Severity.Info,
            message: 'test message',
            method: 'GET',
            request_id: '08394443-31d5-4d65-8392-a29d733c498d',
            session_id: '7b52009b64fd0a2a49e6d8a939753077792b0554',
            tags: ['js_log'],
            url: 'http://localhost/',
            user_agent: expect.any(String),
            user_id: 12
          }),
          expect.any(Map)
        );
      });

      test('it should not filter a message if filteredErrors is set', async () => {
        Understand.init({
          env: 'testing',
          disableSourceMaps: true,
          ignoredErrors: [/ResizeObserver/]
        });

        await Understand.logMessage('ResizeObserver loop limit exceeded');

        expect(mockLog).toHaveBeenCalledTimes(1);
      });

      test('it should not filter a message if blacklistedUrls is set', async () => {
        Understand.init({
          env: 'testing',
          disableSourceMaps: true,
          blacklistedUrls: [/http:\/\/*/]
        });

        await Understand.logMessage('test message');

        expect(mockLog).toHaveBeenCalledTimes(1);
      });

      test('it should filter a message using beforeSend', async () => {
        Understand.init({
          env: 'testing',
          disableSourceMaps: true,
          beforeSend: event => {
            return null;
          }
        });

        await Understand.logMessage('test message');

        expect(mockLog).not.toHaveBeenCalled();
      });
    });
  });
});

function initialize(overrides = {}) {
  Understand.init(
    Object.assign(
      {
        env: 'testing',
        disableSourceMaps: true
      },
      overrides
    )
  );
}

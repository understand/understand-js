import Context from 'applicationRoot/Context';
import Severity from 'applicationRoot/utils/Severity';

let context;
let event;

describe('Context', () => {
  beforeEach(() => {
    sessionStorage.clear();

    context = new Context();

    event = {};
  });

  describe.only('session', () => {
    test('it should add session id provided by the user via constructor', () => {
      context = new Context({
        session_id: '123456'
      });

      expect(context.getSessionId()).toEqual('123456');
    });

    test('it should add session id provided by the user via setter', () => {
      const session_id = '123456';

      context.setSessionId(session_id);

      expect(context.getSessionId()).toEqual(session_id);
    });

    test('it should throw an error when setting an invalid value as session id', () => {
      [null, undefined, NaN, '', 0].forEach(val => {
        expect(() => {
          context.setSessionId(val)
        }).toThrow();
      });
    });

    test('it should apply the session_id to the event when applying context', () => {
      const session_id = '123456';

      context.setSessionId(session_id);

      expect(context.applyToEvent(event)).toMatchObject({
        session_id
      });
    });

    test('it should return a default session id value if not provided by the user', () => {
      const session_id = context.getSessionId();

      expect(typeof session_id).toEqual('string');
      expect(session_id.length).toEqual(40);
      expect(session_id).toEqual(context.getSessionId());
    });

    test('it should store the default session id value in session storage', () => {
      const session_id = context.getSessionId();

      expect(sessionStorage.setItem).toHaveBeenCalledTimes(1);
      expect(Object.keys(sessionStorage.__STORE__).length).toBe(1);
      expect(JSON.parse(sessionStorage.getItem('understand_session_id')).session_id).toEqual(session_id);
    });

    test('it should refresh the session id value stored in session storage if it is older than 2 hours', () => {
      const session_id = context.getSessionId();

      sessionStorage.__STORE__['understand_session_id'] = JSON.stringify({
        expire_at: new Date(new Date().getTime() - (1000 * 60 * 60 * 2)),
        session_id
      });

      expect(context.getSessionId()).not.toEqual(session_id);
    });

    test('it should add request id provided by the user via constructor', () => {
      context = new Context({
        request_id: '08394443-31d5-4d65-8392-a29d733c498d'
      });

      expect(context.getRequestId()).toEqual('08394443-31d5-4d65-8392-a29d733c498d');
    });

    test('it should add request id provided by the user via setter', () => {
      const request_id = '08394443-31d5-4d65-8392-a29d733c498d';

      context.setSessionId(request_id);

      expect(context.getSessionId()).toEqual(request_id);
    });

    test('it should throw an error when setting an invalid value as request id', () => {
      [null, undefined, NaN, '', 0].forEach(val => {
        expect(() => {
          context.setRequestId(val)
        }).toThrow();
      });
    });

     test('it should return a default request id value if not provided by the user', () => {
      const request_id = context.getRequestId();

      expect(typeof request_id).toEqual('string');
      expect(request_id.length).toEqual(36); // uuid v4

      expect(request_id).not.toEqual(context.getRequestId());
    });
  });

  describe('user', () => {
    test('it should add user id provided by the user via constructor', () => {
      context = new Context({
        user_id: 1
      });

      expect(context.user.user_id).toEqual(1);
    });

    test('it should add user id provided by the user via setter', () => {
      const user_id = 1;

      context.setUserId(user_id);

      expect(context.user.user_id).toEqual(user_id);
    });

    test('it should apply `user_id` to the event when applying context', () => {
      const user_id = 1;

      context.setUserId(user_id);

      expect(context.applyToEvent(event)).toMatchObject({
        user_id
      });
    });

    test('it should clear the session id value in local storage if session id is not provided', () => {
      const user_id = 1;

      context.setUserId(user_id);

      expect(sessionStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(Object.keys(sessionStorage.__STORE__).length).toBe(0);
    });

    test('it should not clear the session id value in local storage if session id is already provided', () => {
      const user_id = 1;

      context.setSessionId('123456');
      context.setUserId(user_id);

      expect(sessionStorage.removeItem).not.toHaveBeenCalled();
      expect(Object.keys(sessionStorage.__STORE__).length).toBe(0);
    });

    test('it should throw an error when setting an invalid value as user id', () => {
      [null, undefined, NaN, '', 0].forEach(val => {
        expect(() => {
          context.setUserId(val)
        }).toThrow();
      });
    });

    test('it should add client ip provided by the user via constructor', () => {
      context = new Context({
        client_ip: '192.168.10.10'
      });

      expect(context.user.client_ip).toEqual('192.168.10.10');
    });

    test('it should add client ip provided by the user via setter', () => {
      const client_ip = '192.168.10.10';

      context.setClientIp(client_ip);

      expect(context.user.client_ip).toEqual(client_ip);
    });

    test('it should apply `client_ip` to the event when applying context', () => {
      const client_ip = '192.168.10.10';

      context.setClientIp(client_ip);

      expect(context.applyToEvent(event)).toMatchObject({
        client_ip
      });
    });

    test('it should throw an error when setting an invalid value as client ip', () => {
      [null, undefined, NaN, '', 0].forEach(val => {
        expect(() => {
          context.setClientIp(val)
        }).toThrow();
      });
    });
  });

  describe('tags', () => {
    test('it should add tags', () => {
      const tags = ['one', 'two', 'three'];

      context.setTags(tags);

      expect(context.tags).toEqual(tags);
    });

    test('it should add tags when applying context to event', () => {
      const tags = ['one', 'two', 'three'];

      context.setTags(tags);

      expect(context.applyToEvent(event)).toMatchObject({
        tags
      });
    });

    test('it should add a single tag', () => {
      const tags = ['one', 'two', 'three'];

      context.setTags(tags);

      context.setTag('four');

      expect(context.tags).toEqual(['one', 'two', 'three', 'four']);
    });

    test('it should add only valid primitive values to tags when applying context to event', () => {
      const tags = [null, undefined, NaN, '', 0];

      context.setTags(tags);

      expect(context.applyToEvent(event)).toMatchObject({
        tags: []
      });
    });

    test('it should remove duplicate tags when applying context to event', () => {
      const tags = ['one', 'two', 'three', 'two', 'one'];

      context.setTags(tags);

      expect(context.applyToEvent(event)).toMatchObject({
        tags: ['one', 'two', 'three']
      });
    });

    test('it should add `js_log` default tag when severity level of the event is `debug`, `log` or `info`', () => {
      [Severity.Debug, Severity.Log, Severity.Info].forEach(severity => {
        event = {
          level: severity
        };

        const tags = ['one', 'two', 'three'];

        context.setTags(tags);

        const enhancedEvent = context.applyToEvent(event);

        expect(enhancedEvent.tags).toEqual(expect.arrayContaining(tags));

        expect(enhancedEvent.tags).toContain('js_log');
      });
    });

    test('it should add `js_error_log` default tag when severity level of the event is `fatal`, `error`, `warning` or `critical`', () => {
      [
        Severity.Fatal,
        Severity.Error,
        Severity.Warning,
        Severity.Critical
      ].forEach(severity => {
        event = {
          level: severity
        };

        const tags = ['one', 'two', 'three'];

        context.setTags(tags);

        const enhancedEvent = context.applyToEvent(event);

        expect(enhancedEvent.tags).toEqual(expect.arrayContaining(tags));

        expect(enhancedEvent.tags).toContain('js_error_log');
      });
    });

    test('it should add `js_log` default tags also when tags are not defined on Context', () => {
      event = {
        level: Severity.Debug
      };

      const enhancedEvent = context.applyToEvent(event);

      expect(enhancedEvent.tags).toHaveLength(1);
      expect(enhancedEvent.tags).toContain('js_log');
    });
  });

  test('it should initialize context via JS object', () => {
    context = new Context({
      'session_id': '123456',
      'request_id': '08394443-31d5-4d65-8392-a29d733c498d',
      'user_id': 1,
      'client_ip': '192.168.10.10',
      'tags': ['one', 'two', 'three']
    });

    expect(context.session).toMatchObject({
      'session_id': '123456',
      'request_id': '08394443-31d5-4d65-8392-a29d733c498d'
    });

    expect(context.user).toMatchObject({
      'user_id': 1,
      'client_ip': '192.168.10.10'
    });

    expect(context.tags).toEqual(['one', 'two', 'three']);
  });

  test('it should clear context', () => {
    context.setSessionId('123456');
    context.setTags(['one', 'two', 'three']);
    context.setUserId(1);
    context.setClientIp('192.168.10.10');

    context.clear();

    expect(context.session).toEqual({});
    expect(context.tags).toEqual([]);
    expect(context.user).toEqual({});

    expect(sessionStorage.removeItem).toHaveBeenCalledTimes(1);
    expect(Object.keys(sessionStorage.__STORE__).length).toBe(0);
  });
});

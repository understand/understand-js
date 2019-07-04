import Context from 'applicationRoot/Context';
import Severity from 'applicationRoot/utils/Severity';

let context;
let event;

describe('Context', () => {
  beforeEach(() => {
    context = new Context();

    event = {};
  });

  describe('session', () => {
    test('it should add session details', () => {
      const session = { id: '123456' };

      context.setSession(session);

      expect(context.session).toEqual(session);
    });

    test('it should map `id` to `session_id` when applying context to event', () => {
      const session = { id: '123456' };

      context.setSession(session);

      expect(context.applyToEvent(event)).toEqual({
        session_id: '123456'
      });
    });

    test('it should not add `session_id` to event if it is not a valid primitive value', () => {
      [null, undefined, NaN, '', 0].forEach(val => {
        event = {};
        let session = { id: val };

        context.setSession(session);

        expect(context.applyToEvent(event)).toEqual({});
      });
    });
  });

  describe('user', () => {
    test('it should add user details', () => {
      const user = {
        id: 1,
        ip_address: '192.168.10.10'
      };

      context.setUser(user);

      expect(context.user).toEqual(user);
    });

    test('it should map `id` to `user_id` when applying context to event', () => {
      const user = {
        id: 1
      };

      context.setUser(user);

      expect(context.applyToEvent(event)).toEqual({
        user_id: 1
      });
    });

    test('it should map `ip_address` to `client_ip` when applying context to event', () => {
      const user = {
        ip_address: '192.168.10.10'
      };

      context.setUser(user);

      expect(context.applyToEvent(event)).toEqual({
        client_ip: '192.168.10.10'
      });
    });

    test('it should not add `user_id` or `client_ip` to event if it is not a valid primitive value', () => {
      [null, undefined, NaN, '', 0].forEach(val => {
        event = {};
        let user = {
          id: val,
          ip_address: val
        };

        context.setUser(user);

        expect(context.applyToEvent(event)).toEqual({});
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

      expect(context.applyToEvent(event)).toEqual({
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

      expect(context.applyToEvent(event)).toEqual({
        tags: []
      });
    });

    test('it should remove duplicate tags when applying context to event', () => {
      const tags = ['one', 'two', 'three', 'two', 'one'];

      context.setTags(tags);

      expect(context.applyToEvent(event)).toEqual({
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

  test('it should clear context', () => {
    const session = { id: '123456' };
    const tags = ['one', 'two', 'three'];
    const user = { id: 1, ip_address: '192.168.10.10' };

    context.setSession(session);
    context.setTags(tags);
    context.setUser(user);

    context.clear();

    expect(context.session).toEqual({});
    expect(context.tags).toEqual([]);
    expect(context.user).toEqual({});
  });
});

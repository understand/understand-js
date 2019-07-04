import BaseClient from 'applicationRoot/client/BaseClient';
import ConsoleTransport from 'applicationRoot/client/transport/ConsoleTransport';

const payload = {
  message: 'Test event',
  level: 'test'
};

const mockSendEvent = jest.fn(() => {
  return new Promise((resolve, reject) => resolve());
});

jest.mock('applicationRoot/client/transport/ConsoleTransport', () => {
  return jest.fn().mockImplementation(() => {
    return {
      sendEvent: mockSendEvent
    };
  });
});

describe('BaseClient', () => {
  beforeEach(() => {
    ConsoleTransport.mockClear();
    mockSendEvent.mockClear();
  });

  test('it should set ConsoleTransport as default transport if token is not provided', () => {
    const client = new BaseClient({});

    expect(client.transport instanceof ConsoleTransport);
    expect(client.getTransport() instanceof ConsoleTransport);
  });

  test('it should send an event through ConsoleTransport', () => {
    const client = new BaseClient({});

    return client.sendEvent(payload).then(() => {
      expect(ConsoleTransport.mock.calls.length).toEqual(1);
      expect(mockSendEvent.mock.calls[0][0]).toEqual(payload);
    });
  });

  test('it should update the event through the `beforeSend` callback', () => {
    const client = new BaseClient({
      beforeSend: function(event) {
        event.env = 'testing';

        return event;
      }
    });

    return client.sendEvent(payload).then(() => {
      expect(mockSendEvent.mock.calls[0][0]).toEqual(
        Object.assign({}, payload, { env: 'testing' })
      );
    });
  });

  test('it should not send an event if `beforeSend` callback returns null', () => {
    const client = new BaseClient({
      beforeSend: function(event) {
        return;
      }
    });

    return client.sendEvent(payload).then(() => {
      expect(mockSendEvent).toHaveBeenCalledTimes(0);
    });
  });

  test('it should not send duplicates of the same event', () => {
    const client = new BaseClient({});
    const event = {
      class: 'class',
      file: 'file',
      line: 1,
      group_id: '123456'
    };

    // this fakes waterfall calls
    return Promise.all([
      client.sendEvent(event),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          client.sendEvent(event).then(resolve());
        }, 10);
      }),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          client.sendEvent(event).then(resolve());
        }, 20);
      }),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          client.sendEvent(event).then(resolve());
        }, 30);
      })
    ]).then(() => {
      expect(mockSendEvent).toHaveBeenCalledTimes(1);
    });
  });
});

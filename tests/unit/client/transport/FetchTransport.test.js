import FetchTransport from 'applicationRoot/client/transport/FetchTransport';

const url = 'http://localhost/123-456';
const payload = {
  message: 'Test event',
  level: 'test'
};

let transport;

describe('FetchTransport', () => {
  beforeEach(() => {
    transport = new FetchTransport('123-456');
  });

  test('inherits getEnpoint() implementation', () => {
    expect(transport.url).toBe(url);
  });

  test('sends a request to Understand servers', () => {
    const response = { status: 200 };

    const mockedFetch = jest.fn(() => Promise.resolve(response));

    window.fetch = mockedFetch;

    return transport.sendEvent(payload).then(res => {
      expect(mockedFetch.mock.calls.length).toBe(1);
      expect(mockedFetch.mock.calls[0][0]).toBe(url);
      expect(mockedFetch.mock.calls[0][1]).toEqual({
        body: JSON.stringify(payload),
        method: 'POST',
        referrerPolicy: ''
      });
    });
  });

  test('rejects with non-200 status code', () => {
    const response = { status: 403 };

    const mockedFetch = jest.fn(() => Promise.reject(response));

    return transport.sendEvent(payload).catch(res => {
      expect(res.status).equal(403);
      expect(mockedFetch.mock.calls.length).toBe(1);
      expect(mockedFetch.mock.calls[0][1]).toEqual({
        body: JSON.stringify(payload),
        method: 'POST',
        referrerPolicy: ''
      });
    });
  });
});

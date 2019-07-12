import mock from 'xhr-mock';
import XHRTransport from 'applicationRoot/client/transport/XHRTransport';

const url = 'http://localhost/123-456';
const payload = {
  message: 'Test event',
  level: 'test'
};

let transport;

describe('XHRTransport', () => {
  beforeEach(() => {
    mock.setup();

    transport = new XHRTransport('123-456');
  });

  afterEach(() => mock.teardown());

  test('inherits composeEndpointUrl() implementation', () => {
    expect(transport.url).toBe(url);
  });

  test('sends a request to Understand servers', () => {
    mock.post(transport.url, (req, res) => {
      expect(req.body()).toEqual(JSON.stringify(payload));

      return res.status(200);
    });

    return transport.sendEvent(payload).then(res => {
      expect(res.status).toBe(200);
    });
  });

  test('rejects with non-200 status code', () => {
    mock.post(transport.url, (req, res) => {
      expect(req.body()).toEqual(JSON.stringify(payload));

      return res.status(400);
    });

    return transport.sendEvent(payload).catch(res => {
      expect(res.status).toEqual(400);
    });
  });

  test('it should add headers to the XHR', () => {
    mock.post(transport.url, (req, res) => {
      expect(req.header('header-key')).toEqual('header-value');

      return res.status(200);
    });

    const headers = new Map([['header-key', 'header-value']]);

    return transport
      .setHeaders(headers)
      .sendEvent(payload)
      .then(res => {
        //
      });
  });
});

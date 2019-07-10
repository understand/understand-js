import BaseTransport from 'applicationRoot/client/transport/BaseTransport';

class SimpleTransport extends BaseTransport {}

describe('BaseTransport', () => {
  it('should not provide sendEvent() implementation', async () => {
    const transport = new SimpleTransport({ token: '123' });

    try {
      await transport.sendEvent({});
    } catch (e) {
      expect(e.message).toEqual(
        'Transport Class has to implement `sendEvent` method'
      );
    }
  });

  it('should set headers on the transport class', () => {
    const transport = new BaseTransport({ token: '123' });
    const headers = new Map();

    expect(transport.getHeaders()).toEqual(undefined);

    transport.setHeaders(headers);

    expect(transport.getHeaders()).toEqual(headers);
  })
});

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
});

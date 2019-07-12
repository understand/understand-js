import TransportHeadersEnhancer from 'applicationRoot/client/TransportHeadersEnhancer';

let enhancer;
let event;

describe('TransportHeadersEnhancer', () => {
  beforeEach(() => {
    enhancer = new TransportHeadersEnhancer();
    event = {
      message: 'Test event',
      level: 'info'
    };
  });

  test('it should not add Understand-Auto-Detect header if event has `client_ip` field', () => {
    event.client_ip = '192.168.1.1';

    const headers = enhancer.compute(event);

    expect(headers instanceof Map);
    expect(headers.size).toEqual(0);
  });

  test('it should add Understand-Auto-Detect header if event has no `client_ip` field', () => {
    const headers = enhancer.compute(event);

    expect(headers.size).toEqual(1);
    expect(headers.get('Understand-Auto-Detect')).toEqual('client_ip');
  });
});

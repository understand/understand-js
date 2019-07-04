import UserAgent from 'applicationRoot/processors/UserAgent';

function mockUserAgent() {
  // userAgent is dependent from jsdom version
  // so we just mock it to avoid inconsistencies
  Object.defineProperty(global.navigator, 'userAgent', {
    value: 'test agent',
    configurable: true
  });
}

describe('UserAgent', () => {
  test('it should assign `user_agent` to the event', () => {
    mockUserAgent();

    const processor = new UserAgent();

    const event = {};

    const augmentedEvent = processor.process(event);

    expect(augmentedEvent.user_agent).toEqual('test agent');
  });
});

import Location from 'applicationRoot/processors/Location';

describe('Location', () => {
  test('it should assign `method` to the event', () => {
    const processor = new Location();

    const event = {};

    const augmentedEvent = processor.process(event);

    expect(augmentedEvent.method).toEqual('GET');
  });

  test('it should assign `url` to the event', () => {
    // mocking window.location.href
    // @see https://github.com/facebook/jest/issues/890#issuecomment-415202799
    window.history.pushState({}, 'Test Title', '/test.html?query=true');

    const processor = new Location();

    const event = {};

    const augmentedEvent = processor.process(event);

    // in jsdom environment window.location.url is localhost
    expect(augmentedEvent.url).toEqual('http://localhost/test.html?query=true');
  });
});

import Metadata from 'applicationRoot/Metadata';

let event;

describe('Metadata', () => {
  beforeEach(() => {
    event = {};
  });

  test('it should apply the metadata to the event in the context key', () => {
    const obj = {
      custom: 1,
      context: 'test'
    };

    expect(Metadata.applyToEvent(event, obj)).toMatchObject({
      context: obj
    });
  });

  test('it should prevent circular reference to throw error when applying metadata', () => {
    const circular = {};
    circular.myself = circular;

    expect(Metadata.applyToEvent(event, circular)).toMatchObject({
      context: {}
    });
  });
});

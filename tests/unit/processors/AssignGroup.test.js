import sha1 from 'js-sha1';
import AssignGroup from 'applicationRoot/processors/AssignGroup';

describe('AssignGroup', () => {
  test('it should assign `group_id` to the event', () => {
    const processor = new AssignGroup();

    const event = {
      class: 'class',
      file: 'file',
      line: 1
    };

    const augmentedEvent = processor.process(event);

    expect(augmentedEvent.group_id).toEqual(
      sha1(`${event.class}#${event.file}#${event.line}`)
    );
  });
});

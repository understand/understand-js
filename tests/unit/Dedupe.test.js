import Dedupe from 'applicationRoot/Dedupe';

let dedupe;

describe('Dedupe', () => {
  beforeEach(() => {
    dedupe = new Dedupe();
  });

  test('two events without group_id should be different', () => {
    const eventA = {
      class: 'classA',
      file: 'fileA',
      line: 1
    };

    const eventB = {
      class: 'classB',
      file: 'fileB',
      line: 2
    };

    expect(dedupe.isSameEvent(eventA, eventB)).toBe(false);
  });

  test('one event with group_id should be different from same event without group_id', () => {
    const eventA = {
      class: 'class',
      file: 'file',
      line: 1,
      group_id: '123456'
    };

    const eventB = {
      class: 'class',
      file: 'file',
      line: 1
    };

    expect(dedupe.isSameEvent(eventA, eventB)).toBe(false);
  });

  test('events with same group_id should be equal', () => {
    const eventA = {
      class: 'classA',
      file: 'fileA',
      line: 1,
      group_id: '123456'
    };

    const eventB = {
      class: 'classB',
      file: 'fileB',
      line: 2,
      group_id: '123456'
    };

    expect(dedupe.isSameEvent(eventA, eventB)).toBe(true);
  });

  test('it is not a duplicate if previous event is not defined', () => {
    const event = {
      class: 'class',
      file: 'file',
      line: 1
    };

    expect(dedupe.isDuplicate(event)).toBe(false);
  });

  test('it is a duplicate if previous event is defined and equal', () => {
    const event = {
      class: 'class',
      file: 'file',
      line: 1,
      group_id: '123456'
    };

    dedupe.setLastEvent(event);

    expect(dedupe.isDuplicate(event)).toBe(true);
  });
});

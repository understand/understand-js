import PromiseBuffer from 'applicationRoot/client/transport/PromiseBuffer';
import UnderstandError from 'applicationRoot/errors/UnderstandError';

describe('PromiseBuffer', () => {
  test('it should create a new empty instance', () => {
    const buffer = new PromiseBuffer(10);

    expect(buffer.length()).toEqual(0);
    expect(buffer.isReady()).toEqual(true);
  });

  test('it should throw an exception when adding more promises to the queue', () => {
    const buffer = new PromiseBuffer(1);

    const task = new Promise((resolve, reject) => {});

    buffer.add(task);

    const task1 = new Promise((resolve, reject) => {});

    expect(buffer.add(task1)).rejects.toBeInstanceOf(UnderstandError);
  });

  test('it should remove a task from the queue', () => {
    const buffer = new PromiseBuffer(1);

    const task = new Promise((resolve, reject) => {});

    buffer.add(task);

    buffer.remove(task);

    expect(buffer.length()).toEqual(0);
  });

  test('it should successfully drain the queue if no timeout is specified', () => {
    const buffer = new PromiseBuffer(2);

    const task = new Promise((resolve, reject) => {
      setTimeout(function() {
        resolve();
      }, 20);
    });

    buffer.add(task);

    const task1 = new Promise((resolve, reject) => {
      setTimeout(function() {
        resolve();
      }, 10);
    });

    buffer.add(task1);

    return buffer.drain().then(res => {
      expect(res).toBe(true);
      expect(buffer.length()).toBe(0);
    });
  });

  test('it should not drain the queue if provided timeout is higher than the resolve', () => {
    const buffer = new PromiseBuffer(2);

    const task = new Promise((resolve, reject) => {
      setTimeout(function() {
        resolve();
      }, 20);
    });

    buffer.add(task);

    const task1 = new Promise((resolve, reject) => {
      setTimeout(function() {
        resolve();
      }, 10);
    });

    buffer.add(task1);

    return buffer.drain(15).then(res => {
      expect(res).toBe(false);
      expect(buffer.length()).toBe(1);
    });
  });
});

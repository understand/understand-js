import UnderstandError from 'applicationRoot/errors/UnderstandError';

export default class PromiseBuffer {
  /**
   * @param  {number} limit
   * @return {void}
   */
  constructor(limit) {
    this.limit = limit;
    this.buffer = [];
  }

  /**
   * Determines if the buffer is ready to take more requests
   * @return {Boolean}
   */
  isReady() {
    return this.limit === undefined || this.length() < this.limit;
  }

  /**
   * Returns the number of unresolved promises in the queue.
   * @return {number}
   */
  length() {
    return this.buffer.length;
  }

  /**
   * Add a promise to the queue.
   *
   * @param {Promise} task
   * @returns The original promise.
   */
  add(task) {
    if (!this.isReady()) {
      return Promise.reject(
        new UnderstandError('Not adding Promise due to buffer limit reached.')
      );
    }

    if (this.buffer.indexOf(task) === -1) {
      this.buffer.push(task);
    }

    task
      .then(() => this.remove(task))
      .catch(() =>
        this.remove(task).catch(() => {
          // We have to add this catch here otherwise we have an unhandledPromiseRejection
          // because it's a new Promise chain.
        })
      );

    return task;
  }

  /**
   * Remove a promise to the queue.
   *
   * @param {Promise} task
   * @returns Removed promise.
   */
  remove(task) {
    return this.buffer.splice(this.buffer.indexOf(task), 1)[0];
  }

  /**
   * This will drain the whole queue, returns true if queue is empty or drained.
   * If timeout is provided and the queue takes longer to drain, the promise still resolves but with false.
   *
   * @param timeout Number in ms to wait until it resolves with false.
   */
  drain(timeout) {
    return new Promise(resolve => {
      const capturedSetTimeout = setTimeout(() => {
        if (timeout && timeout > 0) {
          resolve(false);
        }
      }, timeout);

      Promise.all(this.buffer)
        .then(() => {
          clearTimeout(capturedSetTimeout);
          resolve(true);
        })
        .catch(() => {
          resolve(true);
        });
    });
  }
}

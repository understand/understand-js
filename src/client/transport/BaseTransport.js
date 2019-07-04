import API from 'applicationRoot/Api';
import PromiseBuffer from './PromiseBuffer';
import UnderstandError from 'applicationRoot/errors/UnderstandError';
import { getGlobalObject } from 'applicationRoot/utils/helpers';

export default class BaseTransport {
  /**
   * @param  {Object} options
   * @return {void}
   */
  constructor(token) {
    this.global = getGlobalObject();

    this.buffer = new PromiseBuffer(30);

    if (token) {
      this.url = new API(token).getEndpoint();
    }
  }

  /**
   * Send event
   * @param  {Object} event
   * @return {void}
   */
  // eslint-disable-next-line no-unused-vars
  sendEvent(event) {
    throw new UnderstandError(
      'Transport Class has to implement `sendEvent` method'
    );
  }

  /**
   * Close transport
   * @param  {number} timeout
   * @return {Promise}
   */
  close(timeout = null) {
    return this.buffer.drain(timeout);
  }
}

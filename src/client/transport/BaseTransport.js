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

    this.headers = undefined;

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
   * Set the headers for transport
   * @param {Map} headers
   */
  setHeaders(headers) {
    this.headers = headers;

    return this;
  }

  /**
   * Get transport headers
   * @return {Map}
   */
  getHeaders() {
    return this.headers;
  }

  /**
   * Close transport
   * @param  {number} timeout
   * @return {Promise}
   */
  close(timeout = null) {
    this.headers = undefined;

    return this.buffer.drain(timeout);
  }
}

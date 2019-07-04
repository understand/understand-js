import BaseTransport from './BaseTransport';
import { supportsReferrerPolicy } from 'applicationRoot/utils/helpers';

export default class FetchTransport extends BaseTransport {
  /**
   * @param  {Object} options
   * @return {void}
   */
  constructor(token) {
    super(token);
  }

  /**
   * Send event
   * @param  {Object} event
   * @return {Promise}
   */
  sendEvent(event) {
    const defaultOptions = {
      body: JSON.stringify(event),
      method: 'POST',
      referrerPolicy: supportsReferrerPolicy() ? 'origin' : ''
    };

    return this.buffer.add(
      this.global.fetch(this.url, defaultOptions).then(response => ({
        status: response.status
      }))
    );
  }
}

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

    if (this.headers) {
      const fetchHeaders = new Headers();

      // eslint-disable-next-line no-unused-vars
      this.headers.forEach(function(value, key, map) {
        fetchHeaders.append(key, value);
      });

      defaultOptions.headers = fetchHeaders;
    }

    return this.buffer.add(
      this.global.fetch(this.url, defaultOptions).then(response => ({
        status: response.status
      }))
    );
  }
}

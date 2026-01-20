import BaseTransport from './BaseTransport';
import { getGlobalObject } from 'applicationRoot/utils/helpers';

export default class XHRTransport extends BaseTransport {
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
    return this.buffer.add(
      new Promise((resolve, reject) => {
        const global = getGlobalObject();

        const isBrowserXHR =
          typeof global !== 'undefined' &&
          typeof global.XMLHttpRequest === 'function';

        // Browser implementation
        if (isBrowserXHR) {
          const request = new global.XMLHttpRequest();

          request.onreadystatechange = () => {
            if (request.readyState !== 4) return;

            if (request.status === 200) {
              resolve({ status: request.status });
            } else {
              reject(request);
            }
          };

          request.open('POST', this.url, true);

          if (this.headers) {
            this.headers.forEach(function (value, key) {
              request.setRequestHeader(key, value);
            });
          }

          request.send(JSON.stringify(event));
          return;
        }

        // Node.js implementation
        if (typeof fetch === 'function') {
          const headers = {};

          if (this.headers) {
            this.headers.forEach(function (value, key) {
              headers[key] = value;
            });
          }

          fetch(this.url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(event)
          })
            .then(response => {
              if (response.ok) {
                resolve({ status: response.status });
              } else {
                reject(response);
              }
            })
            .catch(reject);

          return;
        }

        // Unsupported runtime
        reject(new Error('No supported HTTP client found'));
      })
    );
  }
}

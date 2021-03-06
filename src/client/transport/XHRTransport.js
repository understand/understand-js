import BaseTransport from './BaseTransport';

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
        const request = new XMLHttpRequest();

        request.onreadystatechange = () => {
          if (request.readyState !== 4) {
            return;
          }

          if (request.status === 200) {
            resolve({
              status: request.status
            });
          }

          reject(request);
        };
        request.open('POST', this.url);

        if (this.headers) {
          // eslint-disable-next-line no-unused-vars
          this.headers.forEach(function(value, key, map) {
            request.setRequestHeader(key, value);
          });
        }

        request.send(JSON.stringify(event));
      })
    );
  }
}

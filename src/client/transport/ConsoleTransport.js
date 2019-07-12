import BaseTransport from './BaseTransport';
import Logger from 'applicationRoot/utils/Logger';

export default class ConsoleTransport extends BaseTransport {
  /**
   * @param  {string} token
   * @return {void}
   */
  constructor(token) {
    super(token);

    this.logger = new Logger();
  }

  /**
   * Send event
   * @param  {Object} event
   * @return {Promise}
   */
  sendEvent(event) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      this.logger.log(event, this.headers);

      resolve();
    });
  }
}

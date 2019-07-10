import Dedupe from 'applicationRoot/Dedupe';
import Logger from 'applicationRoot/utils/Logger';
import ConsoleTransport from './transport/ConsoleTransport';
import TransportHeadersEnhancer from './TransportHeadersEnhancer';
import { isFunction } from 'applicationRoot/utils/helpers';

export default class BaseClient {
  /**
   * @param  {Object} options
   * @return {void}
   */
  constructor(options) {
    this.options = options;
    this.logger = new Logger();
    this.dedupe = new Dedupe();
    this.headers = new TransportHeadersEnhancer();

    if (!this.options.token) {
      this.logger.warn('No token provided, Client will not do anything.');
    }

    this.transport = this.setupTransport();
  }

  /**
   * Sets up the transport so it can be used later to send requests.
   * @return {Transport}
   */
  setupTransport() {
    return new ConsoleTransport();
  }

  /**
   * Send an event using transport
   * @param  {Object} event
   * @return {Promise}
   */
  sendEvent(event) {
    if (this.dedupe.isDuplicate(event)) {
      return Promise.resolve();
    }

    if (this.options.beforeSend && isFunction(this.options.beforeSend)) {
      const returnVal = this.options.beforeSend(event);

      if (!returnVal) {
        return Promise.resolve(returnVal);
      }

      event = returnVal;
    }

    return this.transport
      .setHeaders(this.headers.compute(event))
      .sendEvent(event)
      .then(() => {
        this.dedupe.setLastEvent(event);
      })
      .catch(e => {
        this.logger.error(e);
      });
  }

  /**
   * Get the Transport instance
   * @return {Transport}
   */
  getTransport() {
    return this.transport;
  }
}

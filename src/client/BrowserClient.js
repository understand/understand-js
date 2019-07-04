import BaseClient from './BaseClient';
import { supportsFetch } from 'applicationRoot/utils/helpers';
import FetchTransport from './transport/FetchTransport';
import XHRTransport from './transport/XHRTransport';

export default class BrowserClient extends BaseClient {
  /**
   * @param  {Object} options
   * @return {void}
   */
  constructor(options) {
    super(options);
  }

  /**
   * @inheritDoc
   */
  setupTransport() {
    if (!this.options.token) {
      // We return the console transport here in case there is no token.
      return super.setupTransport.call(this);
    }

    if (supportsFetch()) {
      return new FetchTransport(this.options.token);
    }

    return new XHRTransport(this.options.token);
  }
}

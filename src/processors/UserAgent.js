import BaseProcessor from './BaseProcessor';
import { getGlobalObject } from 'applicationRoot/utils/helpers';

export default class UserAgent extends BaseProcessor {
  /**
   * Augment the event
   * @param  {Object} event
   * @return {Object}
   */
  process(event) {
    const global = getGlobalObject();
    let userAgent = 'Node.js';

    if (global.navigator && global.navigator.userAgent) {
      userAgent = global.navigator.userAgent;
    }

    return Object.assign({}, event, {
      user_agent: userAgent
    });
  }
}

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

    if (!global.navigator || !global.location) {
      return event;
    }

    return Object.assign({}, event, {
      user_agent: global.navigator.userAgent
    });
  }
}

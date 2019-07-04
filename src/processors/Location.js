import BaseProcessor from './BaseProcessor';
import { getGlobalObject } from 'applicationRoot/utils/helpers';

export default class Location extends BaseProcessor {
  /**
   * Augment the event
   * @param  {Object} event
   * @return {Object}
   */
  process(event) {
    const global = getGlobalObject();

    if (!global.location) {
      return event;
    }

    return Object.assign({}, event, {
      method: 'GET',
      url: global.location.href
    });
  }
}

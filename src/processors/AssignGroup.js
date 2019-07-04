import sha1 from 'js-sha1';
import BaseProcessor from './BaseProcessor';

export default class AssignGroup extends BaseProcessor {
  /**
   * Augment the event
   * @param  {Object} event
   * @return {Object}
   */
  process(event) {
    return Object.assign({}, event, {
      group_id: sha1(`${event.class}#${event.file}#${event.line}`)
    });
  }
}

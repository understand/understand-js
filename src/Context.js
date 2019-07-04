import { isString, isPrimitive } from 'applicationRoot/utils/helpers';
import DEFAULT_TAGS from 'applicationRoot/utils/DefaultTags';

/**
 * Holds additional event information.
 */
export default class Context {
  /**
   * Create a new instance of Context
   * @return {void}
   */
  constructor() {
    this.session = {};
    this.tags = [];
    this.user = {};
  }

  /**
   * Set the user in the context
   * @param {Object} user
   */
  setUser(user) {
    this.user = user;

    return this;
  }

  /**
   * Set the session in the context
   * @param {Object} session
   */
  setSession(session) {
    this.session = session;

    return this;
  }

  /**
   * Set tags in the context
   * @param {Array} tags
   */
  setTags(tags) {
    this.tags = tags;

    return this;
  }

  /**
   * Add a tag in the context
   * @param {Array} tag
   */
  setTag(tag) {
    this.tags.push(tag);

    return this;
  }

  /**
   * Clear the Context
   * @return {void}
   */
  clear() {
    this.session = {};
    this.tags = [];
    this.user = {};

    return this;
  }

  /**
   * Applies the current context and fingerprint to the event.
   * @param {event} Event
   * @return {event}
   */
  applyToEvent(event) {
    if (this.session) {
      if (this.session.id && isPrimitive(this.session.id)) {
        event.session_id = this.session.id;
      }

      if (this.session.request_id && isPrimitive(this.session.request_id)) {
        event.request_id = this.session.request_id;
      }
    }

    if (this.tags && this.tags.length) {
      event.tags = this.tags
        .filter(isPrimitive)
        .filter(Boolean)
        .filter((item, pos, self) => self.indexOf(item) == pos);
    }

    if (event.level) {
      event.tags = (event.tags || []).concat([DEFAULT_TAGS[event.level]]);
    }

    if (this.user && Object.keys(this.user).length) {
      if (this.user.id && isPrimitive(this.user.id)) {
        event.user_id = this.user.id;
      }

      if (this.user.ip_address && isString(this.user.ip_address)) {
        event.client_ip = this.user.ip_address;
      }
    }

    return event;
  }
}

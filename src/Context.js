import sha1 from 'js-sha1';
import uuidv4 from 'uuid/v4';
import { getGlobalObject, isPrimitive } from 'applicationRoot/utils/helpers';

import DEFAULT_TAGS from 'applicationRoot/utils/DefaultTags';

const SESSION_STORAGE_KEY = 'understand_session_id';
const SESSION_STORAGE_LIFETIME = 60 * 60 * 2;

/**
 * Holds additional event information.
 */
export default class Context {
  /**
   * Create a new instance of Context
   * @param  {Object} options
   * @return {void}
   */
  constructor(options = {}) {
    this.session = {};
    this.tags = [];
    this.user = {};

    this.fromOptions(options);
  }

  /**
   * Set context from JS object.
   * @param  {Object} obj
   * @return {void}
   */
  fromOptions(obj) {
    if (obj.hasOwnProperty('session_id')) this.setSessionId(obj.session_id);
    if (obj.hasOwnProperty('request_id')) this.setRequestId(obj.request_id);

    if (obj.hasOwnProperty('user_id')) this.setUserId(obj.user_id);
    if (obj.hasOwnProperty('client_ip')) this.setClientIp(obj.client_ip);

    if (obj.hasOwnProperty('tags')) this.setTags(obj.tags);
  }

  /**
   * Set the user id in the context
   * @param {string} id
   * @return {this}
   */
  setUserId(user_id) {
    if (user_id !== null && (!user_id || !isPrimitive(user_id))) {
      throw new Error('Invalid value for user id');
    }

    this.user.user_id = user_id;

    if (!this.session.session_id) {
      const global = getGlobalObject();
      global.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }

    return this;
  }

  /**
   * Get the user id
   * @return {string|undefined}
   */
  getUserId() {
    return this.user.user_id;
  }

  /**
   * Set the user ip address in the context
   * @param {string} client_ip
   * @return {this}
   */
  setClientIp(client_ip) {
    if (client_ip !== null && (!client_ip || !isPrimitive(client_ip))) {
      throw new Error('Invalid value for client ip');
    }

    this.user.client_ip = client_ip;

    return this;
  }

  /**
   * Get the client ip
   * @return {string|undefined}
   */
  getClientIp() {
    return this.user.client_ip || null;
  }

  /**
   * Set the session id in the context
   * @param {string} session
   * @return {void}
   */
  setSessionId(session_id) {
    if (session_id !== null && (!session_id || !isPrimitive(session_id))) {
      throw new Error('Invalid value for session id');
    }

    this.session.session_id = session_id;

    return this;
  }

  /**
   * Get the session id from the context
   * @return {string}
   */
  getSessionId() {
    if (this.session.session_id) return this.session.session_id;

    const global = getGlobalObject();

    if (global.sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      const item = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));

      if (Date.parse(item.expires_at) > new Date()) {
        return item.session_id;
      }
    }

    const expires_at = new Date(
      new Date().getTime() + 1000 * SESSION_STORAGE_LIFETIME
    );
    const session_id = sha1(
      [...Array(10)]
        // eslint-disable-next-line no-unused-vars
        .map(_ => ((Math.random() * 36) | 0).toString(36))
        .join('') + this.user.user_id
    );

    global.sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ expires_at, session_id })
    );

    return session_id;
  }

  /**
   * Set the request id in the context
   * @param {string} request_id
   * @return {void}
   */
  setRequestId(request_id) {
    if (request_id !== null && (!request_id || !isPrimitive(request_id))) {
      throw new Error('Invalid value for request id');
    }

    this.session.request_id = request_id;

    return this;
  }

  getRequestId() {
    if (this.session.request_id) return this.session.request_id;

    return uuidv4();
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

    const global = getGlobalObject();
    global.sessionStorage.removeItem(SESSION_STORAGE_KEY);

    return this;
  }

  /**
   * Applies the current context and fingerprint to the event.
   * @param {event} Event
   * @return {event}
   */
  applyToEvent(event) {
    event.session_id = this.getSessionId();
    event.request_id = this.getRequestId();

    if (this.tags && this.tags.length) {
      event.tags = this.tags
        .filter(isPrimitive)
        .filter(Boolean)
        .filter((item, pos, self) => self.indexOf(item) == pos);
    }

    if (event.level) {
      event.tags = (event.tags || []).concat([DEFAULT_TAGS[event.level]]);
    }

    if (this.user && this.user.user_id) {
      event.user_id = this.user.user_id;
    }

    if (this.user && this.user.client_ip) {
      event.client_ip = this.user.client_ip;
    }

    return event;
  }
}

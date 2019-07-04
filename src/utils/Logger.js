const PREFIX = 'Understand';

import { getGlobalObject, safeConsole } from './helpers';

export default class Logger {
  /**
   * New Logger instance
   * @return {void}
   */
  constructor() {
    if (!this.instance) {
      this.instance = this;
    }

    this.enabled = true;
  }

  /**
   * Disable logger
   * @return {void}
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Enable logger
   * @return {void}
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Log in console
   * @param  {...[type]} args
   */
  log(...args) {
    if (!this.enabled) {
      return;
    }

    const global = getGlobalObject();

    safeConsole(() => {
      global.console.log(`${PREFIX} [Log]:`, ...args);
    });
  }

  /**
   * Warn in console
   * @param  {...[type]} args
   */
  warn(...args) {
    if (!this.enabled) {
      return;
    }

    const global = getGlobalObject();

    safeConsole(() => {
      global.console.warn(`${PREFIX} [Warn]:`, ...args);
    });
  }

  /**
   * Error in console
   * @param  {...[type]} args
   */
  error(...args) {
    if (!this.enabled) {
      return;
    }

    const global = getGlobalObject();

    safeConsole(function() {
      global.console.error(`${PREFIX} [Error]:`, ...args);
    });
  }
}

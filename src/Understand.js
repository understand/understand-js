'use strict';

import Handler from './Handler';
import Logger from './utils/Logger';
import {
  enabled,
  getGlobalObject,
  isError,
  isErrorEvent,
  isDOMError,
  isDOMException,
  isPlainObject,
  safeStringify
} from './utils/helpers';
import Severity from './utils/Severity';
import StackFrame from 'stackframe';

class Understand {
  /**
   * Init the main class
   * @param  {object} options
   * @return this
   */
  init(options) {
    this.options = options;

    this.handler = new Handler(options);

    this.logger = new Logger();

    return this;
  }

  /**
   * Install global error handlers
   * @param  {Object} options
   * @return {void}
   */
  catchErrors(options = {}) {
    if (!this.checkInitialized()) {
      return;
    }

    const global = getGlobalObject();

    if (enabled(options.enableWindowError)) {
      /**
       * Trace window onerror event
       * @param {string} message Error message.
       * @param {string} url URL of script that generated the exception.
       * @param {(number|string)} lineNo The line number at which the error occurred.
       * @param {(number|string)} columnNo The column number at which the error occurred.
       * @param {Error} error The actual Error object.
       * @see  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
       *
       * Note that in IE9 and earlier, Error objects don't have enough information to extract much of anything.
       * In IE 10, Errors are given a stack once they're thrown.
       *
       */
      global.onerror = (message, url, lineNo, columnNo, error) => {
        if (error) {
          this.logError(error);
        } else {
          const stackFrame = new StackFrame({
            args: [],
            fileName: url,
            lineNumber: lineNo,
            columnNumber: columnNo,
            isEval: true,
            isNative: false
          });

          this.handler.handleMessage(message, Severity.Error, [stackFrame]);
        }
      };
    }

    if (enabled(options.enableUnhandledRejection)) {
      /**
       * Ensures all unhandled rejections are recorded.
       * @param {PromiseRejectionEvent} e event.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onunhandledrejection
       * @see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
       */
      global.onunhandledrejection = e => {
        const err = (e && (e.detail ? e.detail.reason : e.reason)) || e;

        this.logError(err);
      };
    }
  }

  /**
   * Manually capture an error.
   * @param  {Any} e
   * @param  {Object} metadata
   * @return {void}
   */
  logError(e, metadata = {}) {
    if (!this.checkInitialized()) {
      return;
    }

    // If it is an ErrorEvent with `error` property, extract it to get actual Error
    // https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent
    if (isErrorEvent(e) && e.error) {
      return this.handler.handle(e.message, e.error, metadata);
    }
    // If it is a DOMError or DOMException (which are legacy APIs, but still supported in some browsers)
    // then we just extract the name and message, as they don't provide anything else
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMError
    // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
    else if (isDOMError(e) || isDOMException(e)) {
      const domEx = e;
      const name =
        domEx.name || (isDOMError(domEx) ? 'DOMError' : 'DOMException');
      const message = domEx.message ? `${name}: ${domEx.message}` : name;

      return this.handler.handleMessage(message, Severity.Error, [], metadata);
    }
    // we have a real Error object
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
    else if (isError(e)) {
      return this.handler.handle(e.message, e, metadata);
    } else if (isPlainObject(e)) {
      const err = safeStringify(e);

      return this.handler.handleMessage(err, Severity.Error, [], metadata);
    }
    // If none of previous checks were valid, then it means that
    // it's not a DOMError/DOMException
    // it's not a plain Object
    // it's not a valid ErrorEvent (one with an error property)
    // it's not an Error
    // So bail out and capture it as a simple message:
    else {
      return this.handler.handleMessage(e, Severity.Error, [], metadata);
    }
  }

  /**
   * Capture a message
   * @param  {string} message The message to capture
   * @param  {string} level
   * @param  {Object} metadata
   * @return {void}
   */
  logMessage(message, level = Severity.Info, metadata = {}) {
    if (!this.checkInitialized()) {
      return;
    }

    return this.handler.withoutFilters(() => {
      return this.handler.handleMessage(message, level, [], metadata);
    });
  }

  /**
   * Manipulate the context for the events
   * @param  {Function} callback
   * @return {void}
   */
  withContext(callback) {
    if (!this.checkInitialized()) {
      return;
    }

    return callback(this.handler.getContext());
  }

  /**
   * Close the handler to avoid submitting events
   * @return {void}
   */
  close() {
    if (!this.checkInitialized()) {
      return;
    }

    this.handler.close();
  }

  /**
   * Check if the component is initialized.
   * @return {Boolean}
   */
  checkInitialized() {
    if (this.handler) {
      return true;
    }

    this.logger.warn(
      'Understand has not been initialized! Please call init() before submitting errors.'
    );

    return false;
  }
}

// export new instance
export default new Understand();

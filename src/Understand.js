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

const logger = new Logger();

class Understand {
  /**
   * Init the main class
   * @param  {object} options
   * @return this
   */
  init(options) {
    this.options = options;

    this.handler = new Handler(options);

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

    // Capture console error
    if (enabled(options.enableConsoleError)) {
      const globalObj = getGlobalObject();
      const self = this;

      if (globalObj.console) {
        const originalError = globalObj.console.error || function() {};

        globalObj.console.error = function(...args) {
          originalError.apply(globalObj.console, args);

          try {
            // Convert all arguments to a single string
            const message = args
              .map(a =>
                a instanceof Error ? a.stack || a.message : JSON.stringify(a)
              )
              .join(' ');

            // Send to Understand handler
            const err = new Error(message);
            self.handler.handle(err.message, err, { source: 'console.error' });
          } catch (err) {
            originalError('Understand console hook failed:', err);
          }
        };
      }
    }
  }

  /**
   * Install global console log handlers
   * @param  {Object} options
   * @return {void}
   */
  patchConsoleLogs(options = {}) {
    if (!this.checkInitialized()) {
      return;
    }

    // Capture console messages log, warn, info, debug
    if (
      enabled(options.enableConsoleLog) ||
      enabled(options.enableConsoleWarn) ||
      enabled(options.enableConsoleInfo) ||
      enabled(options.enableConsoleDebug)
    ) {
      const globalObj = getGlobalObject();
      const self = this;

      // Detect and use Angular's Zone.js console if available
      const zoneConsole =
        globalObj.Zone && globalObj.Zone.__symbol__
          ? globalObj[globalObj.Zone.__symbol__('console')] || globalObj.console
          : globalObj.console;

      const consoleObj = zoneConsole || globalObj.console;

      if (consoleObj) {
        const patchConsoleMethod = (methodName, type, sourceName) => {
          const originalMethod = consoleObj[methodName] || function() {};

          consoleObj[methodName] = function() {
            const args = Array.prototype.slice.call(arguments);

            // Keep original behavior
            originalMethod.apply(consoleObj, args);

            try {
              const message = args
                .map(a => {
                  if (a instanceof Error) return a.stack || a.message;
                  try {
                    return typeof a === 'object'
                      ? JSON.stringify(a)
                      : String(a);
                  } catch (err) {
                    return String(a);
                  }
                })
                .join(' ');

              // Log to Understand
              self.logMessage(message, type, { source: sourceName });
            } catch (err) {
              originalMethod('Understand console hook failed:', err);
            }
          };
        };

        if (enabled(options.enableConsoleLog))
          patchConsoleMethod('log', Severity.Log, 'console.log');
        if (enabled(options.enableConsoleWarn))
          patchConsoleMethod('warn', Severity.Warning, 'console.warn');
        if (enabled(options.enableConsoleInfo))
          patchConsoleMethod('info', Severity.Info, 'console.info');
        if (enabled(options.enableConsoleDebug))
          patchConsoleMethod('debug', Severity.Debug, 'console.debug');
      }
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

    logger.warn(
      'Understand has not been initialized! Please call init() before submitting errors.'
    );

    return false;
  }
}

// export new instance
export default new Understand();

import AssignGroup from './processors/AssignGroup';
import BrowserClient from './client/BrowserClient';
import CodeEnhancer from './CodeEnhancer';
import Location from './processors/Location';
import UserAgent from './processors/UserAgent';
import Context from './Context';
import Logger from './utils/Logger';
import Severity from './utils/Severity';

import StackTrace from 'stacktrace-js';

export default class Handler {
  /**
   * Initializes this client instance.
   *
   * @param options Options for the client.
   */
  constructor(options) {
    this.closed = false;
    this.options = options;
    this.disableSourceMaps = options.disableSourceMaps || false;
    this.client = new BrowserClient(options);
    this.logger = new Logger();
    this.context = new Context(options.context);
    this.enhancer = new CodeEnhancer();

    this.processors = [new Location(), new UserAgent()];

    this.groupProcessor = new AssignGroup();
  }

  /**
   * Handle a new error
   * @param  {String} message
   * @param  {Error}  error
   * @return {Promise}
   */
  handle(message, error) {
    if (this.closed) {
      return;
    }

    // we set offline to true in order to prevent all network requests
    // so we can manually enhance the code using source maps using
    // StackTraceGPS sourceCache property.
    return StackTrace.fromError(error, { offline: true })
      .then(stackframes => {
        if (this.disableSourceMaps) {
          const event = this.buildEvent(message, Severity.Error, stackframes);

          return this.client.sendEvent(event);
        }

        return Promise.all(
          stackframes.map(stackframe => this.enhancer.enhance(stackframe))
        ).then(enhancedFrames => {
          const event = this.buildEvent(
            message,
            Severity.Error,
            enhancedFrames
          );

          return this.client.sendEvent(event);
        });
      })
      .catch(e => {
        this.logger.error(e);
      });
  }

  /**
   * Build the structure of the event
   * @param  {String} message
   * @param  {String} level
   * @param  {Array}  stackFrames
   * @return {Object}
   */
  buildEvent(message, level = Severity.Error, stackFrames = []) {
    const frame = stackFrames[0];

    let event = {
      message,
      level
    };

    if (frame) {
      event.file = frame.getFileName();
      event.line = frame.getLineNumber();
      event.col = frame.getColumnNumber();
      event.args = frame.getArgs() || [];
      event.stack = stackFrames.map(frame => {
        return {
          function: frame.getFunctionName(),
          type: 'method',
          file: frame.getFileName(),
          line: frame.getLineNumber(),
          column: frame.getColumnNumber(),
          code: frame.code
        };
      });

      if (
        [
          Severity.Fatal,
          Severity.Error,
          Severity.Warning,
          Severity.Critical
        ].indexOf(level) !== -1
      ) {
        event = this.groupProcessor.process(event);
      }
    }

    event.env = this.options.env || 'production';

    for (let processor of this.processors) {
      event = processor.process(event);
    }

    event = this.context.applyToEvent(event);

    return event;
  }

  /**
   * Handle a new message
   * @param  {string} message
   * @param  {string} level
   * @param  {Array}  stackFrames
   * @return {Promise}
   */
  handleMessage(message, level, stackFrames = []) {
    if (this.closed) {
      return;
    }

    const event = this.buildEvent(message, level, stackFrames);

    return this.client.sendEvent(event);
  }

  /**
   * Return the context
   * @return {Object}
   */
  getContext() {
    return this.context;
  }

  /**
   * Close the Handler
   * @return {void}
   */
  close() {
    this.closed = true;
  }
}

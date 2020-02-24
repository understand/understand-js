import Logger from './utils/Logger';
import { matchesPattern } from './utils/helpers';

const SCRIPT_ERRORS = [
  /^Script error\.?$/,
  /^Javascript error: Script error\.? on line 0$/
];

export default class Filters {
  /**
   * Create a new instance of Filters
   * @param  {Object} options
   * @return {void}
   */
  constructor(options) {
    this.options = this.mergeOptions(options);

    this.logger = new Logger();
  }

  /**
   * Merge options
   * @param  {Object} options
   * @return {Object}
   */
  mergeOptions(options) {
    return {
      ignoreScriptErrors:
        typeof options.ignoreScriptErrors !== 'undefined'
          ? options.ignoreScriptErrors
          : true,
      ignoredErrors: [...(options.ignoredErrors || [])],
      blacklistedUrls: [...(options.blacklistedUrls || [])]
    };
  }

  /**
   * Get the filter options.
   * @return {Object}
   */
  getOptions() {
    return this.options;
  }

  /**
   * Set the filter options.
   * @param {Object} options
   */
  setOptions(options) {
    this.options = this.mergeOptions(options);
  }

  /**
   * Determine if an event should be ignored.
   * @param  {Event} event
   * @return {Boolean}
   */
  ignoreEvent(event) {
    if (
      this.options.ignoreScriptErrors &&
      this.matches(event.message, SCRIPT_ERRORS)
    ) {
      this.logger.warn(
        `Event \`${
          event.message
        }\` dropped due to being matched by \`ignoreScriptError\` option.`
      );

      return true;
    }

    if (this.isIgnored(event)) {
      this.logger.warn(
        `Event \`${
          event.message
        }\` dropped due to being matched by \`ignoredErrors\` option.`
      );

      return true;
    }

    if (this.isBlacklisted(event)) {
      this.logger.warn(
        `Event \`${
          event.message
        }\` dropped due to being matched by \`blacklistedUrls\` option.\nUrl: ${
          event.url
        }`
      );

      return true;
    }

    return false;
  }

  /**
   * Check if string matches at least one pattern.
   * @param  {String} str
   * @param  {Array}  regexs
   * @return {Boolean}
   */
  matches(str, regexs = []) {
    return regexs.some(regex => matchesPattern(str, regex));
  }

  /**
   * Determine if event is ignored.
   * @param  {Event}  event
   * @return {Boolean}
   */
  isIgnored(event) {
    if (!this.options.ignoredErrors || !this.options.ignoredErrors.length) {
      return false;
    }

    return this.matches(event.message, this.options.ignoredErrors);
  }

  /**
   * Determine if event is blacklisted.
   * @param  {Event}  event
   * @return {Boolean}
   */
  isBlacklisted(event) {
    if (!this.options.blacklistedUrls || !this.options.blacklistedUrls.length) {
      return false;
    }

    return this.matches(event.url, this.options.blacklistedUrls);
  }

  /**
   * Clear the options to default values.
   * @return {void}
   */
  clear() {
    this.options = this.mergeOptions({});
  }
}

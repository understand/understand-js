/**
 * Determine if value is enabled.
 *
 * @param  {any} val
 * @return {booleam} Answer to the given question.
 */
export function enabled(val) {
  return val === undefined || val === true;
}

/**
 * Safely get global scope object
 *
 * @returns Global scope object
 */
export function getGlobalObject() {
  return typeof window !== 'undefined'
    ? window
    : typeof self !== 'undefined'
    ? self
    : {};
}

/**
 * Tells whether current environment supports Fetch API
 *
 * @returns {boolean} Answer to the given question.
 */
export function supportsFetch() {
  if (!('fetch' in getGlobalObject())) {
    return false;
  }

  try {
    new Headers();
    new Request('');
    new Response();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Tells whether current environment supports Referrer Policy API
 *
 * @returns boolean Answer to the given question.
 */
export function supportsReferrerPolicy() {
  // Despite all stars in the sky saying that Edge supports old draft syntax, aka 'never', 'always', 'origin' and 'default
  // https://caniuse.com/#feat=referrer-policy
  // It doesn't. And it throw exception instead of ignoring this parameter
  if (!supportsFetch()) {
    return false;
  }

  try {
    new Request('_', {
      referrerPolicy: 'origin'
    });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Checks for console presence
 * @param  {Function} callback
 * @return {[type]}
 */
export function safeConsole(callback) {
  const global = getGlobalObject();

  if (!('console' in global)) {
    return;
  }

  return callback();
}

/**
 * Checks whether given value's type is one of a few Error or Error-like
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isError(wat) {
  switch (Object.prototype.toString.call(wat)) {
    case '[object Error]':
      return true;
    case '[object Exception]':
      return true;
    case '[object DOMException]':
      return true;
    default:
      return wat instanceof Error;
  }
}

/**
 * Checks whether given value's type is ErrorEvent
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent
 */
export function isErrorEvent(wat) {
  return Object.prototype.toString.call(wat) === '[object ErrorEvent]';
}

/**
 * Checks whether given value's type is DOMError
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isDOMError(wat) {
  return Object.prototype.toString.call(wat) === '[object DOMError]';
}

/**
 * Checks whether given value's type is DOMException
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isDOMException(wat) {
  return Object.prototype.toString.call(wat) === '[object DOMException]';
}

/**
 * Checks whether given value's is a primitive (undefined, null, number, boolean, string)
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isPrimitive(wat) {
  return wat === null || (typeof wat !== 'object' && typeof wat !== 'function');
}

/**
 * Checks whether given value's type is a string
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isString(wat) {
  return Object.prototype.toString.call(wat) === '[object String]';
}

/**
 * Checks whether given value's type is an object literal
 *
 * @param wat A value to be checked.
 * @returns A boolean representing the result.
 */
export function isPlainObject(wat) {
  return Object.prototype.toString.call(wat) === '[object Object]';
}

/**
 * Checks whether given value's type is a function
 *
 * @param  wat A value to be checked.
 * @return A boolean representing the result.
 */
export function isFunction(wat) {
  return wat && {}.toString.call(wat) === '[object Function]';
}

/**
 * Stringify safely an object by removing circular references.
 *
 * @param  {object} obj
 * @return {string}
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Issue_with_JSON.stringify()_when_serializing_circular_references
 */
export function safeStringify(obj) {
  try {
    return JSON.stringify(obj, function(key, value) {
      const seen = new WeakSet();

      return normalize(key, value, seen);
    });
  } catch (ex) {
    return '**non-serializable**';
  }
}

/**
 * Normalize object by removing circular references.
 *
 * @param  {any} key
 * @param  {any} value
 * @param  {WeakSet} seen
 * @return {any}
 */
export function normalize(key, value, seen) {
  if (typeof value === 'object' && value !== null) {
    if (seen.has(value)) {
      return;
    }
    seen.add(value);
  }

  return value;
}

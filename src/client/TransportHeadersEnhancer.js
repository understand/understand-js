export default class TransportHeaderEnhancer {
  /**
   * Compute transport headers
   * @param  {Object} event
   * @return {Map}
   */
  compute(event) {
    const headers = new Map();

    const autodetect = [];

    if (!event.hasOwnProperty('client_ip')) {
      autodetect.push('client_ip');
    }

    if (autodetect.length) {
      headers.set('Understand-Auto-Detect', autodetect.join(','));
    }

    return headers;
  }
}

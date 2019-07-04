import UnderstandError from './errors/UnderstandError';

// eslint-disable-next-line no-undef
const BASE_URL = API_ENDPOINT;

export default class API {
  /**
   * New Api instance
   * @param  {string} token
   * @return {void}
   */
  constructor(token) {
    if (!token) {
      throw new UnderstandError('Missing token');
    }

    this.token = token;
  }

  /**
   * Returns the base url of the Understand endpoint
   * @return {string}
   */
  getBaseUrl() {
    return BASE_URL;
  }

  /**
   * Return the token
   * @return {string}
   */
  getToken() {
    return this.token;
  }

  /**
   * Return the Understand endpoint
   * @return {string}
   */
  getEndpoint() {
    return this.getBaseUrl() + this.getToken();
  }
}

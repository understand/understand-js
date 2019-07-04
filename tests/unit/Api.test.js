import Api from 'applicationRoot/Api';
import UnderstandError from 'applicationRoot/errors/UnderstandError';

describe('Api', () => {
  test('it should throw exception if token is not provided', () => {
    try {
      new Api();
    } catch (e) {
      expect(e instanceof UnderstandError);
      expect(e.message).toEqual('Missing token');
    }
  });

  test('it should store the token', () => {
    const api = new Api('123-456');

    expect(api.getToken()).toEqual('123-456');
  });

  test('it has the correct base url', () => {
    const api = new Api('123-456');

    expect(api.getBaseUrl()).toEqual('http://localhost/');
  });

  test('it has correct endpoint url', () => {
    const api = new Api('123-456');

    expect(api.getEndpoint()).toEqual('http://localhost/123-456');
  });
});

import BaseProcessor from 'applicationRoot/processors/BaseProcessor';
import UnderstandError from 'applicationRoot/errors/UnderstandError';

describe('BaseProcessor', () => {
  test('it should throw exception when calling `process` on it', () => {
    const processor = new BaseProcessor();

    try {
      processor.process({});
    } catch (e) {
      expect(e instanceof UnderstandError);
    }
  });
});

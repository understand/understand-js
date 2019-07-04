import UnderstandError from 'applicationRoot/errors/UnderstandError';

export default class BaseProcessor {
  /**
   * @inheritDoc
   */
  // eslint-disable-next-line no-unused-vars
  process(event) {
    throw new UnderstandError(
      'Processor Class has to implement `process` method'
    );
  }
}

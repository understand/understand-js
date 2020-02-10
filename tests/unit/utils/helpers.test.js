import * as helpers from 'applicationRoot/utils/helpers';

describe('helpers', () => {
  describe('isRegExp', () => {
    test('it should return true if parameter is a regular expression', () => {
      expect(helpers.isRegExp(/test/)).toEqual(true);
    });

    test('it should return false if parameter is not a regular expression', () => {
      expect(helpers.isRegExp(new String('test'))).toEqual(false);
      expect(helpers.isRegExp(new Number(123))).toEqual(false);
      expect(helpers.isRegExp(new Boolean(true))).toEqual(false);
      expect(helpers.isRegExp({})).toEqual(false);
      expect(helpers.isRegExp(function() {})).toEqual(false);
    });
  });

  describe('matchesPattern', () => {
    test('it should match pattern if pattern is the same string', () => {
      expect(helpers.matchesPattern('test', 'test')).toEqual(true);
    });

    test('it should match pattern if pattern is a valid pattern', () => {
      expect(helpers.matchesPattern('test', /test/)).toEqual(true);
    });
  });
});

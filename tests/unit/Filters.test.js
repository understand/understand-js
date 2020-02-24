import Filters from 'applicationRoot/Filters';
import Handler from 'applicationRoot/Handler';
import Logger from 'applicationRoot/utils/Logger';

const mockWarn = jest.fn();

const handler = new Handler({
  token: '123456',
  env: 'test'
});

jest.mock('applicationRoot/utils/Logger', () => {
  return jest.fn().mockImplementation(() => {
    return {
      warn: mockWarn
    };
  });
});

describe('Filters', () => {
  beforeEach(() => {
    mockWarn.mockClear();
  });

  describe('constructor', () => {
    test('it provides defaults if Filters class is initialized without parameters', () => {
      const filters = new Filters({});

      expect(filters.options).toHaveProperty('ignoreScriptErrors', true);
      expect(filters.options).toHaveProperty('ignoredErrors', []);
      expect(filters.options).toHaveProperty('blacklistedUrls', []);
    });

    test('it should set the ignoreScriptErrors option', () => {
      const filters = new Filters({
        ignoreScriptErrors: false
      });

      expect(filters.options).toHaveProperty('ignoreScriptErrors', false);
    });

    test('it should set the ignoredError option', () => {
      const filters = new Filters({
        ignoredErrors: [/ResizeObserver/]
      });

      expect(filters.options).toHaveProperty('ignoredErrors', [
        /ResizeObserver/
      ]);
    });

    test('it should set the blacklistedUrls option', () => {
      const filters = new Filters({
        blacklistedUrls: [/^chrome:\/\//i]
      });

      expect(filters.options).toHaveProperty('blacklistedUrls', [
        /^chrome:\/\//i
      ]);
    });
  });

  describe('getOptions', () => {
    test('it should return the default options', () => {
      const filters = new Filters({});

      expect(filters.getOptions()).toEqual({
        ignoreScriptErrors: true,
        ignoredErrors: [],
        blacklistedUrls: []
      });
    });

    test('it should return the provided options', () => {
      const filters = new Filters({
        ignoreScriptErrors: true,
        ignoredErrors: [/ResizeObserver/],
        blacklistedUrls: [/^chrome:\/\//i]
      });

      expect(filters.getOptions()).toEqual({
        ignoreScriptErrors: true,
        ignoredErrors: [/ResizeObserver/],
        blacklistedUrls: [/^chrome:\/\//i]
      });
    });
  });

  describe('setOptions', () => {
    test('it should set the filter options', () => {
      const filters = new Filters({});

      filters.setOptions({
        ignoreScriptErrors: true,
        ignoredErrors: [/ResizeObserver/],
        blacklistedUrls: [/^chrome:\/\//i]
      });

      expect(filters.getOptions()).toEqual({
        ignoreScriptErrors: true,
        ignoredErrors: [/ResizeObserver/],
        blacklistedUrls: [/^chrome:\/\//i]
      });
    });
  });

  describe('ignoreEvent', () => {
    test('it should not ignore event in case of default options', () => {
      const filters = new Filters({});

      const event = handler.buildEvent('test');

      expect(filters.ignoreEvent(event)).toBe(false);
    });

    describe('ignoreScriptErrors', () => {
      test('it should ignore event by default if it is a Script error', () => {
        const filters = new Filters({});

        const event = handler.buildEvent('Script error.');

        expect(filters.ignoreEvent(event)).toBe(true);
        expect(mockWarn).toHaveBeenCalledTimes(1);
      });

      test('it should not ignore Script errors if they are specifically allowed', () => {
        const filters = new Filters({
          ignoreScriptErrors: false
        });

        const event = handler.buildEvent('Script error.');

        expect(filters.ignoreEvent(event)).toBe(false);
      });
    });

    describe('ignoredErrors', () => {
      test('it should not ignore event in case of empty ignoredErrors option', () => {
        const filters = new Filters({
          ignoredErrors: []
        });

        const event = handler.buildEvent('test');

        expect(filters.ignoreEvent(event)).toBe(false);
      });

      test('it should ignore event if it fully matches an ignoredError option', () => {
        const filters = new Filters({
          ignoredErrors: ['ResizeObserver loop limit exceeded']
        });

        const event = handler.buildEvent('ResizeObserver loop limit exceeded');

        expect(filters.ignoreEvent(event)).toBe(true);
        expect(mockWarn).toHaveBeenCalledTimes(1);
      });

      test('it should ignore event if it partially matches an ignoredError option', () => {
        const filters = new Filters({
          ignoredErrors: [/ResizeObserver/]
        });

        const event = handler.buildEvent('ResizeObserver loop limit exceeded');

        expect(filters.ignoreEvent(event)).toBe(true);
        expect(mockWarn).toHaveBeenCalledTimes(1);
      });

      test('it should not ignore event if it does not match all the ignoredError options', () => {
        const filters = new Filters({
          ignoredErrors: [/ResizeObserver/]
        });

        const event = handler.buildEvent('test');

        expect(filters.ignoreEvent(event)).toBe(false);
      });
    });

    describe('blacklistedUrls', () => {
      test('it should not ignore event in case of empty blacklistedUrls option', () => {
        const filters = new Filters({
          blacklistedUrls: []
        });

        const event = handler.buildEvent('test');

        expect(filters.ignoreEvent(event)).toBe(false);
      });

      test('it should ignore event if it fully matches an blacklistedUrls option', () => {
        const filters = new Filters({
          blacklistedUrls: ['http://localhost']
        });

        const event = handler.buildEvent('test');

        expect(filters.ignoreEvent(event)).toBe(true);
        expect(mockWarn).toHaveBeenCalledTimes(1);
      });

      test('it should ignore event if it partially matches an blacklistedUrls option', () => {
        const filters = new Filters({
          blacklistedUrls: [/http:\/\/*/]
        });

        const event = handler.buildEvent('test');

        expect(filters.ignoreEvent(event)).toBe(true);
        expect(mockWarn).toHaveBeenCalledTimes(1);
      });

      test('it should not ignore event if it does not match all the blacklistedUrls options', () => {
        const filters = new Filters({
          blacklistedUrls: [/https:\/\/*/]
        });

        const event = handler.buildEvent('test');

        expect(filters.ignoreEvent(event)).toBe(false);
      });
    });
  });

  describe('clear', () => {
    test('it should clear the options and provide defaults', () => {
      const filters = new Filters({
        ignoreScriptErrors: false,
        ignoredErrors: [/ResizeObserver/],
        blacklistedUrls: [/^chrome:\/\//i]
      });

      filters.clear();

      expect(filters.getOptions()).toEqual({
        ignoreScriptErrors: true,
        ignoredErrors: [],
        blacklistedUrls: []
      });
    });
  });
});

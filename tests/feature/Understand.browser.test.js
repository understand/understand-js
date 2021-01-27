/* eslint-disable */
import { JSDOM } from 'jsdom';

function jsdomExecute(window, done, execute, assertCallback) {
  window.finish = function(event) {
    try {
      assertCallback(event);
    } catch (e) {
      done(e);
    }
  };

  // use setTimeout so stack trace doesn't go all the way back to Jest test runner
  window.eval('window.setTimeout.call(window, ' + execute.toString() + ');');
}

let dom;

// need to mock session storage because we're using an opaque origin,
// bu adding a testUrl will cause external assets inclusion to fail
// @see https://github.com/jsdom/jsdom/issues/2383
const sessionStorageMock = (function() {
  let store = {};

  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    }
  };
})();

describe('Understand', () => {
  beforeEach(() => {
    return new Promise((resolve, reject) => {
      JSDOM.fromFile(__dirname + '/iframe.html', {
        runScripts: 'dangerously',
        resources: 'usable'
      }).then(res => {
        Object.defineProperty(res.window, 'sessionStorage', {
          value: sessionStorageMock
        });

        // setTimeout is used here for this reason
        // https://github.com/jsdom/jsdom#asynchronous-script-loading
        setTimeout(function() {
          if (res.window.Understand) {
            dom = res;

            resolve(res);
          } else {
            reject();
          }
        }, 1000);
      });
    });
  });

  afterEach(function() {
    dom = null;
  });

  describe('API', () => {
    test('it should manually capture the error', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          Understand.logError(new Error('test'), {
            foo: 'bar'
          });
        },
        function(event) {
          expect(event.message).toEqual('test');
          expect(event.file).toEqual(__filename);
          expect(event.level).toEqual('error');
          expect(event.stack.length).toBeTruthy();
          expect(event.context).toEqual({
            foo: 'bar'
          });

          done();
        }
      );
    });

    test('it should automatically capture the error', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          testWindowOnError('test');
        },
        function(event) {
          expect(event.message).toEqual('test');
          expect(event.level).toEqual('error');
          expect(event.stack.length).toBeTruthy();

          done();
        }
      );
    });

    test('it should manually capture a message', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          Understand.logMessage('test', 'info', {
            foo: 'bar'
          });
        },
        function(event) {
          expect(event.message).toEqual('test');
          expect(event.level).toEqual('info');
          expect(event.context).toEqual({
            foo: 'bar'
          });

          done();
        }
      );
    });

    test('it should catch a string exception as a message', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          testErrorString('test');
        },
        function(event) {
          expect(event.message).toEqual('test');
          expect(event.level).toEqual('error');
          expect(event.stack).toBeFalsy();

          done();
        }
      );
    });
  });

  describe('window.onerror', () => {
    test('should catch syntax errors', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          eval('foo{};');
        },
        function(event) {
          expect(event.message).toMatch(/Unexpected token '{'/);
          expect(event.level).toEqual('error');
          expect(event.stack.length).toBeTruthy();

          done();
        }
      );
    });

    test('should catch thrown strings as messages', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          eval('throw "boo";');
        },
        function(event) {
          expect(event.message).toMatch(/boo/);
          expect(event.level).toEqual('error');
          expect(event.stack).toBeFalsy();

          done();
        }
      );
    });

    test('should catch thrown objects as messages', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          eval('throw { foo: "bar" };');
        },
        function(event) {
          expect(event.message).toMatch(JSON.stringify({ foo: 'bar' }));
          expect(event.level).toEqual('error');
          expect(event.stack).toBeFalsy();

          done();
        }
      );
    });

    test('should capture exceptions inside setTimeout', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          setTimeout(function() {
            foo();
          });
        },
        function(event) {
          expect(event.message).toMatch(/foo is not defined/);
          expect(event.level).toEqual('error');
          expect(event.stack.length).toBeTruthy();

          done();
        }
      );
    });

    test('should capture exceptions inside setInterval', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          var exceptionInterval = setInterval(function() {
            clearInterval(exceptionInterval);
            foo();
          }, 10);
        },
        function(event) {
          expect(event.message).toMatch(/foo is not defined/);
          expect(event.level).toEqual('error');
          expect(event.stack.length).toBeTruthy();

          done();
        }
      );
    });

    test('should capture exceptions inside requestAnimationFrame', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          requestAnimationFrame(function() {
            foo();
          });
        },
        function(event) {
          expect(event.message).toMatch(/foo is not defined/);
          expect(event.level).toEqual('error');
          expect(event.stack.length).toBeTruthy();

          done();
        }
      );
    });

    test('should capture exceptions from XMLHttpRequest event handlers (e.g. onreadystatechange)', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          var xhr = new XMLHttpRequest();

          // intentionally assign event handlers *after* XMLHttpRequest.prototype.open,
          // since this is what jQuery does
          // https://github.com/jquery/jquery/blob/master/src/ajax/xhr.js#L37

          xhr.open('GET', 'example.json');
          xhr.onreadystatechange = function() {
            // replace onreadystatechange with no-op so exception doesn't
            // fire more than once as XHR changes loading state
            xhr.onreadystatechange = function() {};
            foo();
          };
          xhr.send();
        },
        function(event) {
          expect(event.message).toMatch(/foo is not defined/);
          expect(event.level).toEqual('error');
          expect(event.stack.length).toBeTruthy();

          done();
        }
      );
    });
  });

  /**
   * Apparently onunhandledrejection is implemented only on Chrome
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event
   */
  describe.skip('window.onunhandledrejection', () => {
    test('should capture unhandledrejection with error', done => {
      jsdomExecute(
        dom.window,
        done,
        function() {
          Promise.reject(new Error('test'));
        },
        function(event) {
          expect(event.message).toMatch(/test/);
          expect(event.level).toEqual('error');
          expect(event.stack.length).toBeTruthy();

          done();
        }
      );
    });

    test('should capture unhandledrejection with a string', function(done) {
      jsdomExecute(
        dom.window,
        done,
        function() {
          Promise.reject('test');
        },
        function(event) {
          expect(event.message).toMatch(/test/);
          expect(event.level).toEqual('error');
          expect(event.stack).toBeFalsy();

          done();
        }
      );
    });
  });
});

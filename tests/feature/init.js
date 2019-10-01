/* eslint-disable */
Understand.init({
  env: 'testing',
  // we disable source maps because it's
  // basically useless in JSDOM environment
  disableSourceMaps: true,
  beforeSend: function(event) {
    // we use finish function defined in test
    // to signal Jest that the test case is over
    finish(event);

    return event;
  }
});

Understand.catchErrors();

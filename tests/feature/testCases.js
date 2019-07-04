/* eslint-disable */
function testWindowOnError(message) {
  throw new Error(message);
}

function testErrorString(message) {
  try {
    throw new String(message);
  } catch (e) {
    Understand.captureError(e);
  }
}

function testErrorNumber(number) {
  throw new Number(number);
}

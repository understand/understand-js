import understand from './Understand';

const {
  init,
  catchErrors,
  patchConsoleLogs,
  captureStdout,
  logError,
  logMessage,
  withContext,
  close,
  checkInitialized
} = understand;

export {
  init,
  catchErrors,
  patchConsoleLogs,
  captureStdout,
  logError,
  logMessage,
  withContext,
  close,
  checkInitialized
};

export { SDK_NAME, SDK_VERSION } from './version';

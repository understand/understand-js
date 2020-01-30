import understand from './Understand';

const {
  init,
  catchErrors,
  logError,
  logMessage,
  withContext,
  close,
  checkInitialized
} = understand;

export { init, catchErrors, logError, logMessage, withContext, close, checkInitialized };

export { SDK_NAME, SDK_VERSION } from './version';

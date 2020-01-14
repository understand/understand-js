import understand from './Understand';

const {
  init,
  catchErrors,
  logError,
  logMessage,
  withContext,
  close
} = understand;

export { init, catchErrors, logError, logMessage, withContext, close };

export { SDK_NAME, SDK_VERSION } from './version';

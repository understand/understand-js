import understand from './Understand';

const {
  init,
  installErrorHandlers,
  captureError,
  captureMessage,
  withContext,
  close
} = understand;

export {
  init,
  installErrorHandlers,
  captureError,
  captureMessage,
  withContext,
  close
};

export { SDK_NAME, SDK_VERSION } from './version';

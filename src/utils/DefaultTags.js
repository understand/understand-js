import Severity from './Severity';

const LOG = 'js_log';
const ERROR_LOG = 'js_error_log';

export default Object.freeze({
  [Severity.Fatal]: ERROR_LOG,
  [Severity.Error]: ERROR_LOG,
  [Severity.Warning]: ERROR_LOG,
  [Severity.Log]: LOG,
  [Severity.Info]: LOG,
  [Severity.Debug]: LOG,
  [Severity.Critical]: ERROR_LOG
});

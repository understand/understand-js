import StackTraceGPS from 'stacktrace-gps';

const LINE_AROUND = 6;

export default class CodeEnhancer {
  /**
   * Create a new instance
   * @return {void}
   */
  constructor() {
    this.gps = new StackTraceGPS();
  }

  /**
   * Enhance the StackFrame object with the code fragment.
   * @param  {StackFrame} stackframe
   * @return {StackFrame}
   */
  enhance(stackframe) {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      this.gps.pinpoint(stackframe).then(
        frame => {
          const cache = this.gps.sourceCache[frame.getFileName()];

          if (cache) {
            Promise.resolve(cache).then(code => {
              const errLine = frame.getLineNumber();

              frame = Object.assign(frame, {
                code: this.extractRelevantCode(code, errLine)
              });

              resolve(frame);
            });
          } else {
            frame = Object.assign(frame, { code: [] });

            resolve(frame);
          }
        },
        // eslint-disable-next-line no-unused-vars
        err => {
          stackframe = Object.assign(stackframe, { code: [] });

          // resolve anyway
          resolve(stackframe);
        }
      );
    });
  }

  /**
   * Keep relevant lines from the original source code
   * and formats them following the Understand structure
   * @param  {String} code
   * @param  {Number} errLine
   * @return {Array}
   */
  extractRelevantCode(code, errLine) {
    return code
      .split('\n')
      .map(this.lineToObj)
      .filter(codeObj => {
        return this.isLineInInterval(codeObj.line, errLine);
      });
  }

  /**
   * Turns a line code into an Object
   * @param  {String} line
   * @param  {Number} index
   * @return {Object}
   */
  lineToObj(line, index) {
    return {
      line: index + 1,
      code: line
    };
  }

  /**
   * Determines if the line is in the interval
   * around the line that made the error
   * @param  {Number}  line
   * @param  {Number}  errLine
   * @return {Boolean}
   */
  isLineInInterval(line, errLine) {
    return line >= errLine - LINE_AROUND && line <= errLine + LINE_AROUND;
  }
}

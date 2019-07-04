import CodeEnhancer from 'applicationRoot/CodeEnhancer';
import StackFrame from 'stackframe';
import StackTraceGPS from 'stacktrace-gps';

const mockStackFrame = new StackFrame({
  functionName: 'funName',
  args: ['args'],
  fileName: 'http://localhost/file.js',
  lineNumber: 3,
  columnNumber: 1,
  isEval: true,
  isNative: false,
  source: 'ORIGINAL_STACK_LINE'
});

jest.mock('stacktrace-gps');

describe('CodeEnhancer', () => {
  beforeEach(() => {
    StackTraceGPS.mockClear();
  });

  test('it should convert a line to Understand code object representation', () => {
    const enhancer = new CodeEnhancer();

    expect(enhancer.lineToObj('test code', 2)).toMatchObject({
      line: 3,
      code: 'test code'
    });
  });

  test('it should keep 6 lines around the error line', () => {
    const enhancer = new CodeEnhancer();

    const errLine = 8;

    expect(enhancer.isLineInInterval(1, errLine)).toBe(false);

    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].forEach(line => {
      expect(enhancer.isLineInInterval(line, errLine)).toBe(true);
    });

    expect(enhancer.isLineInInterval(15, errLine)).toBe(false);
  });

  test('it should enhance StackFrame with code fragment if the original source is available', () => {
    const mockPinpoint = jest.fn(() => {
      return new Promise((resolve, reject) => resolve(mockStackFrame));
    });

    StackTraceGPS.mockImplementation(() => {
      return {
        sourceCache: {
          [mockStackFrame.getFileName()]: new Promise((resolve, reject) =>
            resolve(['line1', 'line2', 'line3'].join('\n'))
          )
        },
        pinpoint: mockPinpoint
      };
    });

    const enhancer = new CodeEnhancer();

    return enhancer.enhance(mockStackFrame).then(enhancedFrame => {
      expect(StackTraceGPS.mock.calls.length).toEqual(1);
      expect(enhancedFrame).toHaveProperty('code', [
        { line: 1, code: 'line1' },
        { line: 2, code: 'line2' },
        { line: 3, code: 'line3' }
      ]);
    });
  });

  test('it should enhance StackFrame with empty code fragment if the original source is not available', () => {
    const mockPinpoint = jest.fn(() => {
      return new Promise((resolve, reject) => resolve(mockStackFrame));
    });

    StackTraceGPS.mockImplementation(() => {
      return {
        sourceCache: {},
        pinpoint: mockPinpoint
      };
    });

    const enhancer = new CodeEnhancer();

    return enhancer.enhance(mockStackFrame).then(enhancedFrame => {
      expect(StackTraceGPS.mock.calls.length).toEqual(1);
      expect(enhancedFrame).toHaveProperty('code', []);
    });
  });
});

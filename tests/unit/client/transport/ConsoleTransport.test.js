import ConsoleTransport from 'applicationRoot/client/transport/ConsoleTransport';
import Logger from 'applicationRoot/utils/Logger';

const payload = {
  message: 'Test event',
  level: 'test'
};

jest.mock('applicationRoot/utils/Logger');

let transport;

describe('ConsoleTransport', () => {
  beforeEach(() => {
    Logger.mockClear();

    transport = new ConsoleTransport({ token: null });
  });

  test('creates an instance', () => {
    expect(Logger).toHaveBeenCalledTimes(1);
  });

  test('sends an event through console', () => {
    const mockLoggerInstance = Logger.mock.instances[0];
    const mockLog = mockLoggerInstance.log;

    return transport.sendEvent(payload).then(() => {
      expect(mockLog).toHaveBeenCalledTimes(1);
      expect(mockLog).toHaveBeenCalledWith(payload);
    });
  });
});

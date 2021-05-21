import { Broker } from '../src';
import WebSocket from 'ws';

function getMockWs(): WebSocket {
  return {
    send: jest.fn(),
  } as unknown as WebSocket;
}

describe('Broker', () => {

  test('SubAndPub_OneChannel_MsgPublished', () => {
    const broker = new Broker();
    const mockWs = getMockWs();
    broker.subscribe('wsId', 'chan', mockWs);

    broker.publish('chan', 'foo');

    expect(mockWs.send).toHaveBeenCalledWith('foo');
  });

  test('SubAndPub_TwoChannels_MsgsPublished', () => {
    const broker = new Broker();
    const mockWs = getMockWs();
    broker.subscribe('wsId', 'chan_1', mockWs);
    broker.subscribe('wsId', 'chan_2', mockWs);

    broker.publish('chan_1', 'foo');
    broker.publish('chan_2', 'bar');

    expect(mockWs.send).toHaveBeenCalledWith('foo');
    expect(mockWs.send).toHaveBeenCalledWith('bar');
    expect(mockWs.send).toHaveBeenCalledTimes(2);
  });

  test('UnsubscribeAllChannels_TwoChannels_NoMsgsPublished', () => {
    const broker = new Broker();
    const mockWs = getMockWs();
    broker.subscribe('wsId', 'chan_1', mockWs);
    broker.subscribe('wsId', 'chan_2', mockWs);

    broker.unsubscribeAllChannels('wsId');
    broker.publish('chan_1', 'foo');
    broker.publish('chan_2', 'bar');

    expect(mockWs.send).toHaveBeenCalledTimes(0);
  });

  test('UnsubscribeAllChannels_TwoWS_MsgPublishedToOtherWS', () => {
    const broker = new Broker();
    const mockWs_1 = getMockWs();
    const mockWs_2 = getMockWs();
    broker.subscribe('wsId_1', 'chan', mockWs_1);
    broker.subscribe('wsId_2', 'chan', mockWs_2);
    
    broker.unsubscribeAllChannels('wsId_1');
    broker.publish('chan', 'foo');

    expect(mockWs_1.send).toHaveBeenCalledTimes(0);
    expect(mockWs_2.send).toHaveBeenCalledWith('foo');
  });

});
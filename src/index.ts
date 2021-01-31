import http from 'http';
import https from 'https';
import WebSocket from 'ws';
import { connect, MessageHandler, upgrade } from './webSocket';
import { Broker } from './broker';

export interface BrokerOptions {
  getChannel?: (request: http.IncomingMessage) => Promise<string>;
  messageHandler?: MessageHandler;
}

export function createBroker(
  server: http.Server | https.Server, options?: BrokerOptions): Broker {
  const wss = new WebSocket.Server({ noServer: true });
  const broker = new Broker();

  const connectCb = connect(broker, options?.messageHandler);
  wss.on('connection', connectCb);
  const upgradeCb = upgrade(wss, options?.getChannel);
  server.on('upgrade', upgradeCb);

  return broker;
}

export { Broker } from './broker';
import http from 'http';
import https from 'https';
import WebSocket from 'ws';
import { connect, upgrade } from './webSocket';
import { Broker } from './broker';
import { App } from './app';

export interface BrokerOptions {
  initChannels?: () => Promise<string[]>; // TODO - params (req + user) that can be used to determine initChannels
}

export function createApp(
  server: http.Server | https.Server,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticate?: (request: http.IncomingMessage) => Promise<any>,
  brokerOpts?: BrokerOptions,
): App {
  const wss = new WebSocket.Server({ noServer: true });
  const broker = new Broker();
  const app = new App(broker);

  const connectCb = connect(app);
  wss.on('connection', connectCb);
  const upgradeCb = upgrade(wss, authenticate, brokerOpts?.initChannels);
  server.on('upgrade', upgradeCb);

  return app;
}

export { Broker } from './broker';
export { Message } from './app';
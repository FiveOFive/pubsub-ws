import http from 'http';
import https from 'https';
import WebSocket from 'ws';
import { connect, upgrade } from './webSocket';
import { Broker } from './broker';
import { consoleLogger, Logger } from './logger';

export function createBroker(server: http.Server | https.Server, getChannel: (request: http.IncomingMessage) => Promise<string>, logger: Logger = consoleLogger): Broker {
  const wss = new WebSocket.Server({ noServer: true });
  const broker = new Broker();

  const connectCb = connect(broker, logger);
  wss.on('connection', connectCb);
  const upgradeCb = upgrade(wss, getChannel, logger);
  server.on('upgrade', upgradeCb);

  return broker;
}

export { Broker } from './broker';
import http from 'http';
import WebSocket from 'ws';
import { connect, upgrade } from './webSocket';
import { Broker } from './broker';
import { consoleLogger, Logger } from './logger';
import * as net from 'net';

export function createBroker<T extends http.IncomingMessage>(server: PubSubServer<T>, getChannel: (request: T) => Promise<string>, logger: Logger = consoleLogger): Broker {
  const wss = new WebSocket.Server({ noServer: true });
  const broker = new Broker();

  const connectCb = connect(broker, logger);
  wss.on('connection', connectCb);
  const upgradeCb = upgrade(wss, getChannel, logger);
  server.on('upgrade', upgradeCb);

  return broker;
}

export { Broker } from './broker';

type PubSubServer<T extends http.IncomingMessage> = {
  on(event: 'upgrade', callback:(req: T, socket: net.Socket, head: Buffer) => void): PubSubServer<T>;
}
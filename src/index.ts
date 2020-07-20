import http from 'http';
import https from 'https';
import WebSocket from 'ws';
import { connect, upgrade } from './webSocket';
import { Broker } from './broker';

export function createBroker(server: http.Server | https.Server, authenticate: (request: http.IncomingMessage) => Promise<string>): Broker {
  const wss = new WebSocket.Server({ noServer: true });
  const broker = new Broker();

  const connectCb = connect(broker);
  wss.on('connection', connectCb);
  const upgradeCb = upgrade(wss, authenticate);
  server.on('upgrade', upgradeCb);

  return broker;
}

export { Broker } from './broker';
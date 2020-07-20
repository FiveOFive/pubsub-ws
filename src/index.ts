import http from 'http';
import https from 'https';
import WebSocket from 'ws';
import { connect, upgrade } from './webSocket';
import Broker from './broker';

export default function main(server: http.Server | https.Server, authenticate: (request: http.IncomingMessage) => string): void {
  const wss = new WebSocket.Server({ server });
  const broker = new Broker();

  wss.on('connection', connect(broker));
  wss.on('upgrade', upgrade(wss, authenticate));
}
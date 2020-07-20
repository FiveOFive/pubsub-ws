import http from 'http';
import * as net from 'net';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import Broker from './broker';

export function connect(broker: Broker) {
  return (ws: WebSocket, _request: http.IncomingMessage, channel: string): void => {
    const clientId = uuidv4();
    broker.subscribe(clientId, channel, ws);

    ws.on('close', () => {
      broker.unsubscribeAll(clientId);
    });
  }
}

export function upgrade(wss: WebSocket.Server, authenticate: (request: http.IncomingMessage) => Promise<string>) {
  return (request: http.IncomingMessage, socket: net.Socket, head: Buffer): void => {
    authenticate(request)
    .then(channel => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, channel);
      });
    })
    .catch(() => {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    });
  }
}
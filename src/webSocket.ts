import http from 'http';
import * as net from 'net';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { Broker } from './broker';

export function connect(broker: Broker) {
  return (ws: WebSocket, _request: http.IncomingMessage, channel: string): void => {
    const wsId = uuidv4();
    broker.subscribe(wsId, channel, ws);

    ws.on('close', () => {
      broker.unsubscribeAll(wsId);
    });
  }
}

export function upgrade(wss: WebSocket.Server, getChannel: (request: http.IncomingMessage) => Promise<string>) {
  return (request: http.IncomingMessage, socket: net.Socket, head: Buffer): void => {
    getChannel(request)
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
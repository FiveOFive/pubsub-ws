import http from 'http';
import * as net from 'net';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { Broker } from './broker';

export type MessageHandler = (broker: Broker, wsId: string, message: WebSocket.Data) => void;

export function connect(broker: Broker, messageHandler?: MessageHandler) {
  return (ws: WebSocket, _request: http.IncomingMessage, channel?: string): void => {
    const wsId = uuidv4();

    if (channel) {
      broker.subscribe(wsId, channel, ws);
    }

    ws.on('close', () => {
      broker.unsubscribeAll(wsId);
    });

    if (messageHandler) {
      ws.on('message', (message) => {
        messageHandler(broker, wsId, message);
      });
    }
  }
}

export function upgrade(wss: WebSocket.Server, getChannel?: (request: http.IncomingMessage) => Promise<string>) {
  return async (request: http.IncomingMessage, socket: net.Socket, head: Buffer): Promise<void> => {
    let channel: undefined | string = undefined;
    if (getChannel) {
      try {
        channel = await getChannel(request);
      } catch {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, channel);
    });
  }
}
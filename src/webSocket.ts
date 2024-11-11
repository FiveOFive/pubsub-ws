import http from 'http';
import * as net from 'net';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { Broker } from './broker';
import { Logger } from './logger';

export function connect(broker: Broker, logger: Logger) {
  return (ws: WebSocket, _request: http.IncomingMessage, channel: string): void => {
    const wsId = uuidv4();
    broker.subscribe(wsId, channel, ws);

    ws.on('close', () => {
      broker.unsubscribeAllChannels(wsId);
    });

    ws.on('error', (err) => {
      logger.error(err, `ws.on('error')`);
    });
  }
}

export function upgrade(wss: WebSocket.Server, getChannel: (request: http.IncomingMessage) => Promise<string>, logger: Logger) {
  return (request: http.IncomingMessage, socket: net.Socket, head: Buffer): void => {
    socket.on('error', (err) => {
      if (isEconnreset(err)) {
        // ECONNRESET occurs whenever the socket is broken, such as a page reload.
        // This is expected because clients don't stay connected indefinitely.
        logger.debug(err, `socket.on('error')`);
      } else {
        logger.error(err, `socket.on('error')`);
      }
    });

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

function isEconnreset(err: unknown): err is { code: 'ECONNRESET' } {
  return typeof err === 'object' && (err as { code: 'ECONNRESET' })?.code === 'ECONNRESET';
}
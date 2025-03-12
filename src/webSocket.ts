import http from 'http';
import * as net from 'net';
import WebSocket from 'ws';
import { Broker } from './broker';
import { Logger } from './logger';
import crypto from 'crypto';

export function connect<T extends http.IncomingMessage>(broker: Broker, logger: Logger) {
  return (ws: WebSocket, _request: T, channel: string): void => {
    const wsId = crypto.randomUUID();
    broker.subscribe(wsId, channel, ws);

    ws.on('close', () => {
      broker.unsubscribeAllChannels(wsId);
    });

    ws.on('error', (err) => {
      logger.error(err, `ws.on('error')`);
    });
  }
}

export function upgrade<T extends http.IncomingMessage>(wss: WebSocket.Server, getChannel: (request: T) => Promise<string>, logger: Logger) {
  return (request: T, socket: net.Socket, head: Buffer): void => {
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
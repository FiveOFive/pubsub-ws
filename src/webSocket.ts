import http from 'http';
import * as net from 'net';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { App } from './app';

export interface AuthenticatedWS extends WebSocket {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
  id?: string;
}

export function connect(app: App) {
  return (ws: AuthenticatedWS, _request: http.IncomingMessage, initChannels: string[]): void => {
    const wsId = uuidv4();
    ws.id = wsId;

    for (const chan of initChannels) {
      app.broker.subscribe(wsId, chan, ws);
    }

    ws.on('close', () => {
      app.broker.unsubscribeAll(wsId);
    });

    ws.on('message', (message) => {
      app.messageHandler({
        app: app,
        ws: ws,
        data: message
      }).then((response) => {
        if (response) {
          ws.send(JSON.stringify(response));
        }
      })
    });
  }
}

export function upgrade(
  wss: WebSocket.Server,
  // TODO - better design than any? parametrized types?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticate?: (request: http.IncomingMessage) => Promise<any>,
  initChannels?: () => Promise<string[]>,
) {
  return async (request: http.IncomingMessage, socket: net.Socket, head: Buffer): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: undefined | any;
    if (authenticate) {
      try {
        user = await authenticate(request);
      } catch {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
    }

    const channels: string[] = [];
    if (initChannels) {
      channels.push(...(await initChannels()));
    }
    wss.handleUpgrade(request, socket, head, (ws: AuthenticatedWS) => {
      ws.user = user;
      wss.emit('connection', ws, request, channels);
    });
  }
}
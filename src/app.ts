import { Broker } from './broker';
import WebSocket from 'ws';
import { AuthenticatedWS } from './webSocket';

export interface Message {
  app: App;
  ws: AuthenticatedWS;
  // TODO user from auth
  data: WebSocket.Data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MessageHandler = (message: Message) => Promise<void | any>;

export class App {
  broker: Broker;
  messageHandler: MessageHandler = () => Promise.resolve();

  constructor(broker: Broker) {
    this.broker = broker;
  }
}
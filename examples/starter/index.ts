/* eslint-disable @typescript-eslint/no-unused-vars */
import http from 'http';
import WebSocket from 'ws';
import { createBroker } from '../../src';

const server = http.createServer();

const broker = createBroker(server, (_request: http.IncomingMessage) => {
  return Promise.resolve('myChannel');
});

server.listen(7123);

const ws = new WebSocket('ws://localhost:7123');
ws.on('open', () => console.log('ws open'));
ws.on('message', (data) => console.log(`received message: ${data}`));

setInterval(() => {
  broker.publish('myChannel', 'test data');
}, 2000);
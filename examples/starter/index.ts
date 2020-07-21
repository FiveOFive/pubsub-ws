/* eslint-disable @typescript-eslint/no-unused-vars */
import http from 'http';
import WebSocket from 'ws';
import { createBroker } from '../../src';

const server = http.createServer();

// The second argument is the getChannel function, which is called each time a websocket upgrade request is received.
// getChannel receives the http request expects back a channel to subscribe the websocket to.
// getChannel can be used for authentication. See the authentication example.
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
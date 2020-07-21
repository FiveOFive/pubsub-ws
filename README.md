# ws-pubsub

ws-pubsub is a simple Node JS library for communicating over websockets using the publish-subscribe pattern. It is written in Typescript and uses the ws package for websockets. The author's primary use case was to push real time updates to a web UI for features such as graphs and progress bars. However, it could be used anytime pubsub over websockets is needed. 

## Terminology

* **channel** - A channel is a filter of published messages that clients can subscribe to. For example, I am interested in cats, so I subscribe to the "cats" channel and start receiving all messages published to the "cats" channel. There could also be a "dogs" channel, but I will not receive those messages, since I am only subscribed to "cats". 
* **broker** - The broker maintains the state of which websockets are subscribe to which channels. Each message is published to the broker on a channel. The broker then looks up all websockets currently subscribed to that channel and forwards the message to them. 

## Getting Started

Set up an http server for the websockets and create the ws-pubsub broker:
```javascript
import http from 'http';
import WebSocket from 'ws';
import { createBroker } from 'ws-pubsub';

// ----- Set up the websocket server and pubsub broker -----

const server = http.createServer(); // https server is also supported

// The second argument is the getChannel function, which is called each time a websocket upgrade request is received.
// getChannel receives the http request and expects back a channel. The websocket is subscribed to this channel. We can subscribe all websockets to the same channel (as in this example) or use data in the request to intelligently subscribe different websockets to different channels. The latter is shown in the authentication example, further down in the readme.
const broker = createBroker(server, (request) => {
  return Promise.resolve('myChannel');
});

server.listen(7123);

// ----- Test - connect a websocket and publish test data -----

const ws = new WebSocket('ws://localhost:7123');
ws.on('open', () => console.log('ws open'));
ws.on('message', (data) => console.log(`received message: ${data}`));

setInterval(() => {
  broker.publish('myChannel', 'test data');
}, 2000);
```

## Authentication

The getChannel function (called each time a websocket upgrade request is received) can be used to authenticate clients. Reject the returned Promise if the request is unauthenticated. Below is a typescript example using session authentication with the express-session middleware to parse a passport js session.

```typescript
import session from 'express-session';
import { createBroker } from 'ws-pubsub';

const sessionParser = session({
  // your session options here
});

const authenticateAndGetChannel = (req: any) => {
  return new Promise<string>((resolve, reject) => {
    sessionParser(req, {} as any, async () => {
      if (!req.session?.passport?.user) {
        logger.info('Unauthenticated websocket request');
        reject();
      } else {
          resolve(user); // in this example, each user subscribes to its own channel
      }
    });
  });
}
const broker = createBroker(server, authenticateAndGetChannel));
```

## More Examples
[express-shared-port](https://github.com/FiveOFive/ws-pubsub/tree/master/examples/express-shared-port) - Server websockets, APIs, and static files from the same express port. Includes an example of connecting websockets from a frontend html page.
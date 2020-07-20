import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import createBroker from '../../src';

const port = 7123;
const server = http.createServer();

const broker = createBroker(server, () => 'abc');

const app = express();
app.post('/publish/:channel', express.text(), (req: Request, res: Response) => {
  console.log(`publish on channel [${req.params.channel}] with body [${req.body}]`);
  broker.publish(req.params.channel, req.body);
  res.send();
});
app.use(express.static(path.join(__dirname, './public')));
server.on('request', app);

server.listen(port, () => {
  console.log(`Serving static content and listening for WebSocket requests on port ${port}`);
});
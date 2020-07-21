"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
function connect(broker) {
    return (ws, _request, channel) => {
        const wsId = uuid_1.v4();
        broker.subscribe(wsId, channel, ws);
        ws.on('close', () => {
            broker.unsubscribeAll(wsId);
        });
    };
}
exports.connect = connect;
function upgrade(wss, getChannel) {
    return (request, socket, head) => {
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
    };
}
exports.upgrade = upgrade;

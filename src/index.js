"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const webSocket_1 = require("./webSocket");
const broker_1 = require("./broker");
function createBroker(server, getChannel) {
    const wss = new ws_1.default.Server({ noServer: true });
    const broker = new broker_1.Broker();
    const connectCb = webSocket_1.connect(broker);
    wss.on('connection', connectCb);
    const upgradeCb = webSocket_1.upgrade(wss, getChannel);
    server.on('upgrade', upgradeCb);
    return broker;
}
exports.createBroker = createBroker;
var broker_2 = require("./broker");
exports.Broker = broker_2.Broker;

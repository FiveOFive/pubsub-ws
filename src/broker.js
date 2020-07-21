"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Broker {
    constructor() {
        this.subsByWsId = new Map();
        this.subsByChannel = new Map();
    }
    publish(channel, message) {
        let sub = this.subsByChannel.get(channel);
        while (sub) {
            sub.send(message);
            sub = sub.next;
        }
    }
    subscribe(wsId, channel, ws) {
        var _a;
        if (!this.subsByWsId.get(wsId)) {
            this.subsByWsId.set(wsId, []);
        }
        const next = this.subsByChannel.get(channel);
        const sub = new Subscription(ws, channel, undefined, next);
        if (next) {
            next.prev = sub;
        }
        (_a = this.subsByWsId.get(wsId)) === null || _a === void 0 ? void 0 : _a.push(sub);
        this.subsByChannel.set(channel, sub);
    }
    unsubscribeAll(wsId) {
        const subs = this.subsByWsId.get(wsId);
        if (subs) {
            subs.forEach(sub => {
                if (!sub.prev && !sub.next) {
                    this.subsByChannel.delete(sub.channel);
                }
                else {
                    if (sub.prev) {
                        sub.prev = sub.next;
                    }
                    if (sub.next) {
                        sub.next = sub.prev;
                    }
                }
            });
        }
        this.subsByWsId.delete(wsId);
    }
    getSubsByChannel() {
        return this.subsByChannel;
    }
    getSubsByWsId() {
        return this.subsByWsId;
    }
}
exports.Broker = Broker;
class Subscription {
    constructor(ws, channel, prev, next) {
        this.ws = ws;
        this.channel = channel;
        this.prev = prev;
        this.next = next;
    }
    send(message) {
        this.ws.send(message);
    }
}

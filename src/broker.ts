import WebSocket from 'ws';

export class Broker {
  private subsByWsId = new Map<string, Subscription[]>();
  private subsByChannel = new Map<string, Subscription>();

  publish(channel: string, message: string): void {
    let sub = this.subsByChannel.get(channel);
    while (sub) {
      sub.send(message);
      sub = sub.next;
    }
  }

  subscribe(wsId: string, channel: string, ws: WebSocket): void {
    if (!this.subsByWsId.get(wsId)) {
      this.subsByWsId.set(wsId, []);
    }

    const next = this.subsByChannel.get(channel);
    const sub = new Subscription(ws, channel, undefined, next);
    if (next) {
      next.prev = sub;
    }
    this.subsByWsId.get(wsId)?.push(sub);
    this.subsByChannel.set(channel, sub);
  }

  unsubscribeAll(wsId: string): void {
    const subs = this.subsByWsId.get(wsId);
    if (subs) {
      subs.forEach(sub => {
        if (!sub.prev && ! sub.next) {
          this.subsByChannel.delete(sub.channel);
        } else {
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

  getSubsByChannel(): Map<string, Subscription> {
    return this.subsByChannel;
  }

  getSubsByWsId(): Map<string, Subscription[]> {
    return this.subsByWsId;
  }
}

class Subscription {
  ws: WebSocket;
  channel: string;
  prev: Subscription | undefined;
  next: Subscription | undefined;

  constructor(ws: WebSocket, channel: string, prev: Subscription | undefined, next: Subscription | undefined) {
    this.ws = ws;
    this.channel = channel;
    this.prev = prev;
    this.next = next;
  }

  send(message: string) {
    this.ws.send(message);
  }
}
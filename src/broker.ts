import WebSocket from 'ws';

export default class Broker {
  private subsByClientId = new Map<string, Subscription[]>();
  private subsByChannel = new Map<string, Subscription>();

  publish(channel: string, message: string): void {
    let sub = this.subsByChannel.get(channel);
    while (sub) {
      sub.send(message);
      sub = sub.next;
    }
  }

  subscribe(clientId: string, channel: string, ws: WebSocket): void {
    if (!this.subsByClientId.get(clientId)) {
      this.subsByClientId.set(clientId, []);
    }

    const next = this.subsByChannel.get(channel);
    const sub = new Subscription(ws, channel, undefined, next?.next);
    if (next) {
      next.prev = sub;
    }
    this.subsByClientId.get(clientId)?.push(sub);
  }

  unsubscribeAll(clientId: string): void {
    const subs = this.subsByClientId.get(clientId);
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
    this.subsByClientId.delete(clientId);
  }

  getSubsByChannel(): Map<string, Subscription> {
    return this.subsByChannel;
  }

  getSubsByClientId(): Map<string, Subscription[]> {
    return this.subsByClientId;
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
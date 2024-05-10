import { events } from "~packages";

import type { IExpiringMap, NExpiringMap } from "~types";

export class ExpiringMap<K, V> extends Map<K, V> implements IExpiringMap<K, V> {
  private valueTimeout: number = 0;
  private readonly interval: number = 0;
  private readonly emitter: NodeJS.EventEmitter = new events.EventEmitter();
  private readonly timer: NodeJS.Timeout;

  private updateTimeOnGet = true;
  private deletionTimes = new Map<K, number>();

  constructor(options: NExpiringMap.Options = {}) {
    super();
    Object.assign(this, options);
    if (this.valueTimeout <= 0) {
      this.valueTimeout = 60 * 1000;
    }
    if (this.interval <= 0) {
      this.interval = this.valueTimeout * 2;
    }
    this.timer = setInterval(() => this.purge(), this.interval);
    this.timer.unref();
  }

  set(key: K, value: V) {
    this.emitter.emit("set", key, value);
    this.updateTime(key);
    return super.set(key, value);
  }

  get(key: K) {
    if (this.updateTimeOnGet) {
      this.updateTime(key);
    }
    return super.get(key);
  }

  destroy() {
    clearInterval(this.timer);
    this.clear();
  }

  delete(key: K): boolean {
    this.emitter.emit("delete", key);
    this.deletionTimes.delete(key);
    return super.delete(key);
  }

  on(event: "timeout", listener: (key: K, val?: V) => void): void;
  on(event: "delete", listener: (key: K) => void): void;
  on(event: string | symbol, listener: (...args: any[]) => void): void {
    this.emitter.on(event, listener);
  }

  once(event: string | symbol, listener: (...args: any[]) => void): void {
    this.emitter.once(event, listener);
  }

  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): void {
    this.emitter.removeListener(event, listener);
  }

  private purge() {
    const now = Date.now();
    this.deletionTimes.forEach((deleteTime, key) => {
      if (now > deleteTime) {
        const val = this.get(key);
        if (this.delete(key)) {
          this.emitter.emit("timeout", key, val);
        }
      }
    });
  }

  private updateTime(key: K) {
    this.deletionTimes.set(key, Date.now() + this.valueTimeout);
  }
}

import { injectable, events } from "~packages";

import type { Events, IAbstractConnector, NAbstractConnector } from "~types";

@injectable()
export abstract class AbstractConnector implements IAbstractConnector {
  protected readonly _emitter: Events.EventEmitter = new events.EventEmitter();
  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  public once(
    event: NAbstractConnector.Event,
    listener: NAbstractConnector.Listener
  ): void {
    this._emitter.once(event, listener);
  }

  public on(
    event: NAbstractConnector.Event,
    listener: NAbstractConnector.Listener
  ): void {
    this._emitter.on(event, listener);
  }

  public off(
    event: NAbstractConnector.Event,
    listener: NAbstractConnector.Listener
  ): void {
    this._emitter.off(event, listener);
  }

  public emit<T>(
    event: NAbstractConnector.Event,
    data?: NAbstractConnector.Data<T>
  ): void {
    this._emitter.emit(event, data);
  }
}

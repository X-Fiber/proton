import { injectable } from "~packages";
import { AbstractService } from "../services";

import type {
  AnyFn,
  ILifecycleService,
  NAbstractConnector,
  NLifecycleProvider,
} from "~types";

@injectable()
export class LifecycleService
  extends AbstractService
  implements ILifecycleService
{
  protected readonly _SERVICE_NAME = LifecycleService.name;
  protected readonly _loggerService = undefined;
  protected readonly _discoveryService = undefined;
  protected readonly _lifecycleService = this;

  public async init(): Promise<boolean> {
    return true;
  }

  public async destroy(): Promise<void> {
    this._emitter.removeAllListeners();
  }

  public emit<T = any>(event: NLifecycleProvider.Events, data?: T): void {
    this._emitter.emit(event, data);
  }

  public on(events: NAbstractConnector.Events, listener: AnyFn): void {
    this._emitter.on(events, listener);
  }

  public once(events: NAbstractConnector.Events, listener: AnyFn): void {
    this._emitter.once(events, listener);
  }

  public off(events: NAbstractConnector.Events, listener: AnyFn): void {
    this._emitter.off(events, listener);
  }
}

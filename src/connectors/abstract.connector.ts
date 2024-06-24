import { injectable, events } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { ErrorCodes } from "~common";

import {
  AnyFn,
  Events,
  IAbstractConnector,
  ICoreError,
  IExceptionProvider,
  NAbstractConnector,
  NExceptionProvider,
} from "~types";

@injectable()
export abstract class AbstractConnector implements IAbstractConnector {
  protected abstract readonly _CONNECTOR_NAME: string;
  protected readonly _emitter: Events.EventEmitter = new events.EventEmitter();
  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  protected _emit<C extends string = string>(
    event: NAbstractConnector.Events<C>,
    data?: NAbstractConnector.Data
  ): void {
    this._emitter.emit(event, data);
  }

  public on(events: NAbstractConnector.Events, listener: AnyFn): void {
    this._emitter.on(events, listener);
  }
  public once(events: NAbstractConnector.Events, listener: AnyFn): void {
    this._emitter.on(events, listener);
  }

  public off(events: NAbstractConnector.Events, listener: AnyFn): void {
    this._emitter.on(events, listener);
  }

  protected _catchError(e: any, tag: NExceptionProvider.ErrorTag): ICoreError {
    return container
      .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
      .throwError(e, {
        tag: tag,
        namespace: this._CONNECTOR_NAME,
        code: ErrorCodes.conn.CATCH_ERROR,
        errorType: "FATAL",
      });
  }
}

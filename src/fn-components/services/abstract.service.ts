import { injectable, events } from "~packages";
import { Helpers, Guards } from "~utils";

import type {
  Events,
  ILoggerService,
  IDiscoveryService,
  IAbstractService,
  NAbstractService,
} from "~types";

@injectable()
export abstract class AbstractService implements IAbstractService {
  protected abstract _SERVICE_NAME: string;
  protected abstract init(): Promise<boolean>;
  protected abstract destroy(): Promise<void>;

  protected _isStarted: boolean = false;
  protected readonly _emitter: Events.EventEmitter = new events.EventEmitter();
  protected abstract readonly _discoveryService: IDiscoveryService;
  protected abstract readonly _loggerService: ILoggerService | undefined;

  public get isStarted(): boolean {
    return Guards.isNotUndefined(this._isStarted);
  }

  protected once(
    event: NAbstractService.Event,
    listener: NAbstractService.Listener
  ): void {
    this._emitter.once(event, listener);
  }

  protected on(
    event: NAbstractService.Event,
    listener: NAbstractService.Listener
  ): void {
    this._emitter.once(event, listener);
  }

  protected emit<T = never>(
    event: NAbstractService.Event,
    data?: NAbstractService.Data<T>
  ): void {
    this._emitter.emit(event, data);
  }

  protected off(
    event: NAbstractService.Event,
    listener: NAbstractService.Listener
  ): void {
    this._emitter.once(event, listener);
  }

  public async start(): Promise<void> {
    if (this._isStarted) return;

    try {
      if (await this.init()) {
        const msg = this._SERVICE_NAME + " service has started.";
        this._isStarted = true;
        if (this._loggerService) {
          this._loggerService.system(msg, {
            namespace: this._SERVICE_NAME,
            scope: "Core",
          });
        } else {
          Helpers.levelConsoleLog(msg, "cyan", "system", this._SERVICE_NAME);
        }
        this.emit(`services:${this._SERVICE_NAME}:start`);
      } else {
        this._isStarted = false;
        const msg = this._SERVICE_NAME + " service not enabled.";

        if (this._loggerService) {
          this._loggerService.warn(msg, {
            namespace: this._SERVICE_NAME,
            tag: "Init",
            scope: "Core",
          });
        } else {
          Helpers.levelConsoleLog(msg, "bgYellow", "warn", this._SERVICE_NAME);
        }
      }
    } catch (e) {
      if (this._loggerService) {
        this._loggerService.error(e, {
          namespace: this._SERVICE_NAME,
          tag: "Init",
          scope: "Core",
          errorType: "FATAL",
        });
      } else {
        console.error(e);
      }
      throw e;
    }
  }

  public async stop(): Promise<void> {
    try {
      await this.destroy();
      const msg = this._SERVICE_NAME + " service has stopped.";
      if (this._loggerService) {
        this._loggerService.system(msg, {
          namespace: this._SERVICE_NAME,
          scope: "Core",
        });
      } else {
        Helpers.levelConsoleLog(msg, "cyan", "system", this._SERVICE_NAME);
      }
      this._isStarted = false;

      this.emit(`services:${this._SERVICE_NAME}:stop`);
      this._emitter.removeAllListeners();
    } catch (e) {
      if (this._loggerService) {
        this._loggerService.error(e, {
          namespace: this._SERVICE_NAME,
          tag: "Destroy",
          scope: "Core",
          errorType: "FATAL",
        });
      } else {
        console.error(e);
      }
      throw e;
    }
  }
}

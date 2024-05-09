import { inject, injectable } from "~packages";
import { CoreSymbols } from "~symbols";
import { ExpiringMap } from "~utils";

import { AbstractFileStorageStrategy } from "./abstract.file-storage.strategy";

import type {
  IDiscoveryService,
  IExpiringMap,
  ILoggerService,
  NAbstractFileStorageStrategy,
  IAbstractFileStorageStrategy,
} from "~types";

@injectable()
export class BufferFileStorageStrategy
  extends AbstractFileStorageStrategy
  implements IAbstractFileStorageStrategy
{
  private _config: NAbstractFileStorageStrategy.Config;
  private _BUFFER_STORAGE:
    | IExpiringMap<string, NAbstractFileStorageStrategy.FileInfo>
    | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService
  ) {
    super();

    const valueTimeout = 60 * 1000;

    this._config = {
      enable: false,
      buffer: {
        valueTimeout: valueTimeout,
        interval: valueTimeout * 2,
        updateTimeOnGet: true,
      },
    };
  }

  private _setConfig(): NAbstractFileStorageStrategy.Config {
    return {
      enable: this._discoveryService.getBoolean(
        "strategies.fileStorage.enable",
        this._config.enable
      ),
      buffer: {
        valueTimeout: this._discoveryService.getOptional<number | undefined>(
          "strategies.fileStorage.buffer.valueTimeout",
          this._config.buffer.valueTimeout
        ),
        interval: this._discoveryService.getOptional<number | undefined>(
          "strategies.fileStorage.buffer.interval",
          this._config.buffer.interval
        ),
        updateTimeOnGet: this._discoveryService.getOptional<
          boolean | undefined
        >(
          "strategies.fileStorage.buffer.updateTimeOnGet",
          this._config.buffer.updateTimeOnGet
        ),
      },
    };
  }

  public async start(): Promise<void> {
    this._config = this._setConfig();

    if (!this._config.enable) return;

    console.log("FILE_STORAGE");

    try {
      this._BUFFER_STORAGE = new ExpiringMap({
        interval: this._config.buffer.interval,
        valueTimeout: this._config.buffer.valueTimeout,
        updateTimeOnGet: this._config.buffer.updateTimeOnGet,
      });
    } catch (e) {
      this._loggerService.error(e, {
        tag: "Connection",
        scope: "Core",
        errorType: "FATAL",
        namespace: BufferFileStorageStrategy.name,
      });
      throw e;
    }
  }

  public async stop(): Promise<void> {
    if (this._BUFFER_STORAGE) {
      this._BUFFER_STORAGE.destroy();
      this._BUFFER_STORAGE = undefined;
    }
  }

  private get _bufferStorage(): Map<
    string,
    NAbstractFileStorageStrategy.FileInfo
  > {
    if (!this._BUFFER_STORAGE) {
      throw new Error(
        "Buffer storage not initialize. Select buffer type - 'buffer'"
      );
    }

    return this._BUFFER_STORAGE;
  }

  public async set<N extends string>(
    name: N,
    files: NAbstractFileStorageStrategy.FileInfo
  ): Promise<void> {
    this._bufferStorage.set(name, files);
  }
}

import { inject, injectable } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";

import { AbstractFileStorageStrategy } from "./abstract.file-storage.strategy";

import type {
  IDiscoveryService,
  ILoggerService,
  IAbstractFileStorageStrategy,
  NAbstractFileStorageStrategy,
  IRedisTunnel,
} from "~types";

// TODO: implement all methods

@injectable()
export class RedisFileStorageStrategy
  extends AbstractFileStorageStrategy
  implements IAbstractFileStorageStrategy
{
  private _config: NAbstractFileStorageStrategy.RedisConfig;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService
  ) {
    super();

    this._config = {
      enable: false,
      valueTimeout: 60,
    };
  }

  private _setConfig(): NAbstractFileStorageStrategy.RedisConfig {
    return {
      enable: this._discoveryService.getBoolean(
        "strategies.fileStorage.enable",
        this._config.enable
      ),
      valueTimeout: this._discoveryService.getOptional<number>(
        "strategies.fileStorage.buffer.valueTimeout",
        this._config.valueTimeout
      ),
    };
  }

  public async start(): Promise<void> {
    this._config = this._setConfig();

    if (!this._config.enable) return;

    try {
    } catch (e) {
      this._loggerService.error(e, {
        tag: "Connection",
        scope: "Core",
        errorType: "FATAL",
        namespace: RedisFileStorageStrategy.name,
      });
      throw e;
    }
  }

  public async stop(): Promise<void> {
    // not implemented
  }

  public async count(): Promise<number> {
    throw new Error("Method not implemented.");
  }

  public async setOne<N extends string>(
    name: N,
    file: NAbstractFileStorageStrategy.FileInfo
  ): Promise<void> {
    const base64 = file.file.toString("base64");

    const item: NAbstractFileStorageStrategy.RedisItem = {
      file: base64,
      fileName: file.fileName,
      type: file.type,
      encoding: file.encoding,
      mimetype: file.mimetype,
      fieldName: file.fieldName,
    };

    const tunnel = container.get<IRedisTunnel>(CoreSymbols.RedisTunnel);
    try {
      await tunnel.streams.addExpiredStream(
        "streams:" + name,
        item,
        this._config.valueTimeout
      );
    } catch (e) {
      console.error(e);
    }
  }

  public async setMany(
    files: NAbstractFileStorageStrategy.FilesInfo
  ): Promise<void> {
    throw new Error("Method not implemented");
  }

  public async getOne<N extends string>(
    name: N
  ): Promise<NAbstractFileStorageStrategy.FileInfo | null> {
    throw new Error("Method not implemented");
  }

  public async getAll(): Promise<NAbstractFileStorageStrategy.FilesInfo | null> {
    throw new Error("Method not implemented");
  }

  public async updateOne<N extends string>(
    name: N,
    file: NAbstractFileStorageStrategy.FileInfo
  ): Promise<void> {
    throw new Error("Method not implemented");
  }

  public async loadOne<N extends string>(
    name: N
  ): Promise<NAbstractFileStorageStrategy.FileInfo | null> {
    throw new Error("Method not implemented");
  }

  public async loadAll(): Promise<NAbstractFileStorageStrategy.FilesInfo | null> {
    throw new Error("Method not implemented");
  }

  public async removeOne<N extends string>(name: N): Promise<void> {
    throw new Error("Method not implemented");
  }

  public async clear(): Promise<void> {
    throw new Error("Method not implemented");
  }
}

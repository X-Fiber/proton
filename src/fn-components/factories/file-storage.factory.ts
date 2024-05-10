import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { Helpers } from "~utils";

import { AbstractFactory } from "./abstract.factory";

import type {
  ILoggerService,
  IDiscoveryService,
  IFileStorageFactory,
  NFileStorageFactory,
  IAbstractFileStorageStrategy,
  NAbstractFileStorageStrategy,
} from "~types";

@injectable()
export class FileStorageFactory
  extends AbstractFactory
  implements IFileStorageFactory
{
  protected readonly _FACTORY_NAME = FileStorageFactory.name;
  protected readonly _CONF_VARIABLE_PATH = "strategies.fileStorage.type";
  protected readonly _CONF_VARIABLE_ENABLE = "strategies.fileStorage.enable";
  protected readonly _DEF_CONF_VARIABLE = "buffer";

  protected _STRATEGY: IAbstractFileStorageStrategy | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.BufferFileStorageStrategy)
    protected readonly _bufferStrategy: IAbstractFileStorageStrategy,
    @inject(CoreSymbols.RedisFileStorageStrategy)
    protected readonly _redisStrategy: IAbstractFileStorageStrategy
  ) {
    super();
  }

  public async start(): Promise<void> {
    const kind = this._getKind<"buffer" | "redis">();
    switch (kind) {
      case "buffer":
        try {
          await this._bufferStrategy.start();
          this._STRATEGY = this._bufferStrategy;
        } catch (e) {
          console.error(e);
        }
        break;
      case "redis":
        try {
          await this._redisStrategy.start();
          this._STRATEGY = this._redisStrategy;
        } catch (e) {
          console.error(e);
        }
        break;
      default:
        throw Helpers.switchChecker(kind);
    }
  }

  public async stop(): Promise<void> {
    const kind = this._getKind<"buffer" | "redis">();

    switch (kind) {
      case "buffer":
        try {
          await this._bufferStrategy.stop();
        } catch (e) {
          console.error(e);
        }
        break;
      case "redis":
        try {
          await this._redisStrategy.stop();
          this._STRATEGY = this._redisStrategy;
        } catch (e) {
          console.error(e);
        }
        break;
      default:
        throw Helpers.switchChecker(kind);
    }

    if (this._STRATEGY) {
      this._STRATEGY = undefined;
    }
  }

  private get _strategy(): IAbstractFileStorageStrategy {
    if (!this._STRATEGY) {
      throw new Error("Strategy not implemented.");
    }
    return this._STRATEGY;
  }

  public get strategy(): NFileStorageFactory.Strategy {
    return {
      count: (): Promise<number> => {
        return this._strategy.count();
      },
      setOne: <N extends string>(
        name: N,
        files: NAbstractFileStorageStrategy.FileInfo
      ) => {
        return this._strategy.setOne<N>(name, files);
      },
      setMany: (files: NAbstractFileStorageStrategy.FilesInfo) => {
        return this._strategy.setMany(files);
      },
      getOne: <N extends string>(
        name: N
      ): Promise<NAbstractFileStorageStrategy.FileInfo | null> => {
        return this._strategy.getOne<N>(name);
      },
      getAll: (): Promise<NAbstractFileStorageStrategy.FilesInfo | null> => {
        return this._strategy.getAll();
      },
      updateOne: <N extends string>(
        name: N,
        file: NAbstractFileStorageStrategy.FileInfo
      ): Promise<void> => {
        return this._strategy.updateOne<N>(name, file);
      },
      loadOne: <N extends string>(
        name: N
      ): Promise<NAbstractFileStorageStrategy.FileInfo | null> => {
        return this._strategy.loadOne<N>(name);
      },
      loadAll:
        async (): Promise<NAbstractFileStorageStrategy.FilesInfo | null> => {
          return this._strategy.loadAll();
        },
      removeOne: <N extends string>(name: N): Promise<void> => {
        return this._strategy.removeOne<N>(name);
      },
      clear: (): Promise<void> => {
        return this._strategy.clear();
      },
    };
  }
}

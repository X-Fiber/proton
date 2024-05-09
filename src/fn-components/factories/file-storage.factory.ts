import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { Helpers } from "~utils";

import { AbstractFactory } from "./abstract.factory";

import {
  IAbstractFileStorageStrategy,
  IDiscoveryService,
  IFileStorageFactory,
  ILoggerService,
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

  protected _strategy: IAbstractFileStorageStrategy | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.BufferFileStorageStrategy)
    protected readonly _bufferStrategy: IAbstractFileStorageStrategy
  ) {
    super();
  }

  public async start(): Promise<void> {
    const kind = this._getKind<"buffer" | "file" | "s3">();
    switch (kind) {
      case "buffer":
        try {
          await this._bufferStrategy.start();
          this._strategy = this._bufferStrategy;
        } catch (e) {
          console.error(e);
        }
        break;
      case "file":
      case "s3":
        throw new Error("Strategy not implemented");
      default:
        throw Helpers.switchChecker(kind);
    }
  }

  public async stop(): Promise<void> {
    const kind = this._getKind<"buffer" | "file" | "s3">();

    switch (kind) {
      case "buffer":
        try {
          await this._bufferStrategy.stop();
        } catch (e) {
          console.error(e);
        }
        break;
      case "file":
      case "s3":
        throw new Error("Strategy not implemented");
      default:
        throw Helpers.switchChecker(kind);
    }

    if (this._strategy) {
      this._strategy = undefined;
    }
  }

  public async set<N extends string>(
    name: N,
    files: NAbstractFileStorageStrategy.FileInfo
  ): Promise<void> {
    this._strategy?.set(name, files);
  }
}

import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";

import { AbstractService } from "./abstract.service";

import type {
  ILoggerService,
  IAbstractFactory,
  IDiscoveryService,
  ILifecycleService,
} from "~types";

@injectable()
export class CombinationService extends AbstractService {
  protected readonly _SERVICE_NAME = CombinationService.name;

  constructor(
    @inject(CoreSymbols.LifecycleService)
    protected readonly _lifecycleService: ILifecycleService,
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.HttpFactory)
    private readonly _httpFactory: IAbstractFactory,
    @inject(CoreSymbols.WsFactory)
    private readonly _wsFactory: IAbstractFactory,
    @inject(CoreSymbols.FileStorageFactory)
    private readonly _fileStorage: IAbstractFactory
  ) {
    super();
  }

  protected async init(): Promise<boolean> {
    try {
      await this._httpFactory.run();
      await this._wsFactory.run();
      await this._fileStorage.run();

      this._lifecycleService.emit("CombinationService:init");

      return true;
    } catch (e) {
      throw this._catchError(e, "Init");
    }
  }

  protected async destroy(): Promise<void> {
    try {
      await this._fileStorage.stand();
      await this._httpFactory.stand();
      await this._wsFactory.stand();

      this._lifecycleService.emit("CombinationService:destroy");
    } catch (e) {
      throw this._catchError(e, "Destroy");
    }
  }
}

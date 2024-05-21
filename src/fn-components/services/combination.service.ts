import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { container } from "~container";
import { AbstractService } from "./abstract.service";

import type {
  ILoggerService,
  IAbstractFactory,
  IContextService,
  IDiscoveryService,
  IExceptionProvider,
} from "~types";

@injectable()
export class CombinationService extends AbstractService {
  protected readonly _SERVICE_NAME = CombinationService.name;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService,
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
      return true;
    } catch (e) {
      this._loggerService.error(e, {
        namespace: CombinationService.name,
        tag: "Init",
        errorType: "FATAL",
        scope: "Core",
      });
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError(e, {
          namespace: CombinationService.name,
          tag: "Connection",
          requestId: this._contextService.store.requestId,
          sessionId: this._contextService.store.sessionId,
          errorType: "FATAL",
        });
    }
  }

  protected async destroy(): Promise<void> {
    try {
      await this._fileStorage.stand();
      await this._httpFactory.stand();
      await this._wsFactory.stand();
    } catch (e) {
      this._loggerService.error(e, {
        namespace: CombinationService.name,
        tag: "Init",
        errorType: "FATAL",
        scope: "Core",
      });
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError(e, {
          namespace: CombinationService.name,
          tag: "Destroy",
          requestId: this._contextService.store.requestId,
          sessionId: this._contextService.store.sessionId,
          errorType: "FATAL",
        });
    }
  }
}

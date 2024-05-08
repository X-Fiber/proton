import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { AbstractService } from "./abstract.service";

import type {
  IAbstractFactory,
  IContextService,
  IDiscoveryService,
  IExceptionProvider,
  ILoggerService,
} from "~types";
import { container } from "~container";

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
    private readonly _wsFactory: IAbstractFactory
  ) {
    super();
  }

  protected async init(): Promise<boolean> {
    try {
      await this._httpFactory.run();
      await this._wsFactory.run();
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

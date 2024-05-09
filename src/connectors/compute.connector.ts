import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { AbstractConnector } from "./abstract.connector";

import type {
  IDiscoveryService,
  ILoggerService,
  IContextService,
  ISchemaService,
  IScramblerService,
  IComputeConnector,
  ISessionProvider,
  IAbstractService,
  IPermissionProvider,
} from "~types";

@injectable()
export class ComputeConnector
  extends AbstractConnector
  implements IComputeConnector
{
  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ScramblerService)
    private readonly _scramblerService: IScramblerService,
    @inject(CoreSymbols.SchemaService)
    private readonly _schemaService: ISchemaService,
    @inject(CoreSymbols.CombinationService)
    private readonly _getawayService: IAbstractService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {
    super();
  }

  public async start(): Promise<void> {
    await this._discoveryService.start();
    await this._loggerService.start();
    await this._contextService.start();
    await this._getawayService.start();
    await this._scramblerService.start();
    await this._schemaService.start();
  }
  public async stop(): Promise<void> {
    await this._getawayService.stop();
    await this._schemaService.stop();
    await this._scramblerService.stop();
    await this._contextService.stop();
    await this._loggerService.stop();
    await this._discoveryService.stop();
  }
}

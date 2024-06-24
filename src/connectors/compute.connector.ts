import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { AbstractConnector } from "./abstract.connector";

import type {
  IDiscoveryService,
  ILoggerService,
  IContextService,
  ISchemeService,
  IScramblerService,
  IComputeConnector,
  IAbstractService,
  ITaskService,
  IManagerService,
} from "~types";

@injectable()
export class ComputeConnector
  extends AbstractConnector
  implements IComputeConnector
{
  protected readonly _CONNECTOR_NAME = ComputeConnector.name;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService,
    @inject(CoreSymbols.SchemeService)
    private readonly _schemeService: ISchemeService,
    @inject(CoreSymbols.CombinationService)
    private readonly _combinationService: IAbstractService,
    @inject(CoreSymbols.ScramblerService)
    private readonly _scramblerService: IScramblerService,
    @inject(CoreSymbols.TaskService)
    private readonly _taskService: ITaskService,
    @inject(CoreSymbols.ManagerService)
    private readonly _managerService: IManagerService
  ) {
    super();
  }

  public async start(): Promise<void> {
    try {
      await this._discoveryService.start();
      await this._loggerService.start();
      await this._contextService.start();
      await this._schemeService.start();
      await this._combinationService.start();
      await this._scramblerService.start();
      await this._taskService.start();
      await this._managerService.start();
    } catch (e) {
      this._catchError(e, "Init");
    }
  }

  public async stop(): Promise<void> {
    try {
      await this._managerService.stop();
      await this._taskService.stop();
      await this._scramblerService.stop();
      await this._combinationService.stop();
      await this._schemeService.stop();
      await this._contextService.stop();
      await this._loggerService.stop();
      await this._discoveryService.stop();
    } catch (e) {
      this._catchError(e, "Destroy");
    }
  }
}

import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { Helpers } from "~utils";
import { AbstractFactory } from "./abstract.factory";

import type {
  ILoggerService,
  IAbstractFactory,
  IDiscoveryService,
  IAbstractWsAdapter,
} from "~types";

@injectable()
export class WsFactory extends AbstractFactory implements IAbstractFactory {
  protected readonly _FACTORY_NAME = WsFactory.name;
  protected readonly _CONF_VARIABLE_PATH = "adapters.ws.kind";
  protected readonly _CONF_VARIABLE_ENABLE = "adapters.ws.enable";
  protected readonly _DEF_CONF_VARIABLE = "ws";

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.WsAdapter)
    private readonly _wsAdapter: IAbstractWsAdapter
  ) {
    super();
  }

  protected async start(): Promise<void> {
    const kind = this._getKind<"ws">();
    switch (kind) {
      case "ws":
        await this._wsAdapter.start();
        break;
      default:
        throw Helpers.switchChecker(kind);
    }
  }

  protected async stop(): Promise<void> {
    const kind = this._getKind<"ws">();
    switch (kind) {
      case "ws":
        await this._wsAdapter.stop();
        break;
      default:
        throw Helpers.switchChecker(kind);
    }
  }
}

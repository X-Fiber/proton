import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { Helpers } from "~utils";
import { AbstractFactory } from "./abstract.factory";

import type {
  IAbstractFactory,
  IAbstractHttpAdapter,
  IDiscoveryService,
  ILoggerService,
} from "~types";

@injectable()
export class HttpFactory extends AbstractFactory implements IAbstractFactory {
  protected readonly _FACTORY_NAME = HttpFactory.name;
  protected readonly _CONF_VARIABLE_PATH = "adapters.http.kind";
  protected readonly _CONF_VARIABLE_ENABLE = "adapters.http.enable";
  protected readonly _DEF_CONF_VARIABLE = "fastify";

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.FastifyAdapter)
    private readonly _fastifyAdapter: IAbstractHttpAdapter
  ) {
    super();
  }

  public async start(): Promise<void> {
    const kind = this._getKind<"fastify" | "express">();
    switch (kind) {
      case "fastify":
        await this._fastifyAdapter.start();
        break;
      case "express":
        throw new Error("Adapter not implemented");
      default:
        throw Helpers.switchChecker(kind);
    }
  }

  public async stop(): Promise<void> {
    const kind = this._getKind<"fastify" | "express">();

    switch (kind) {
      case "fastify":
        await this._fastifyAdapter.stop();
        break;
      case "express":
        throw new Error("Adapter not implemented");
      default:
        throw Helpers.switchChecker(kind);
    }
  }
}

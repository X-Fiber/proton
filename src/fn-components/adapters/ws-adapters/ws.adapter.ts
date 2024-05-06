import { https, http, ws, injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { AbstractWsAdapter } from "./abstract.ws-adapter";

import type {
  Ws,
  Http,
  Https,
  IDiscoveryService,
  ILoggerService,
  ISessionService,
  IAbstractWsAdapter,
  NAbstractWebsocketAdapter,
} from "~types";

@injectable()
export class WsAdapter
  extends AbstractWsAdapter<"ws">
  implements IAbstractWsAdapter
{
  protected readonly _ADAPTER_NAME = WsAdapter.name;
  protected _config: NAbstractWebsocketAdapter.Config;
  protected _instance: Ws.WebSocketServer | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.SessionService)
    protected readonly _sessionService: ISessionService
  ) {
    super();

    this._config = {
      enable: false,
      kind: "ws",
      protocol: "ws",
      host: "0.0.0.0",
      port: 11001,
    };
  }

  private _setConfig(): void {
    this._config = {
      enable: this._discoveryService.getBoolean(
        "adapters.ws.enable",
        this._config.enable
      ),
      kind: this._discoveryService.getString(
        "adapters.ws.kind",
        this._config.kind
      ),
      protocol: this._discoveryService.getString(
        "adapters.ws.protocol",
        this._config.protocol
      ),
      host: this._discoveryService.getString(
        "adapters.ws.host",
        this._config.host
      ),
      port: this._discoveryService.getNumber(
        "adapters.ws.port",
        this._config.port
      ),
    };
  }

  public async start(): Promise<void> {
    this._setConfig();

    if (!this._config) throw this._throwConfigError();

    const { protocol, host, port } = this._config;
    let server: Http.Server | Https.Server;
    switch (true) {
      case protocol === "ws":
        server = http.createServer();
        break;
      case protocol === "wss":
        server = https.createServer();
        break;
      default:
        throw new Error(`Unsupported protocol - ${protocol}`);
    }

    try {
      this._instance = new ws.WebSocketServer({ server });

      const instance = this._instance;
      const service = this._sessionService;

      instance.on("connection", function (ws, request) {
        const internalWs = ws as Ws.WebSocket;

        service.setWsConnection(internalWs, {
          userAgent: request.headers["user-agent"],
          acceptLanguage: request.headers["accept-language"],
          websocketKey: request.headers["sec-websocket-key"],
          ip: request.socket.remoteAddress ?? "",
        });
      });

      server.listen(port, () => {
        this._loggerService.system(
          `Websocket server listening on ${protocol}://${host}:${port}`,
          {
            scope: "Core",
            namespace: this._ADAPTER_NAME,
            tag: "Connection",
          }
        );
      });
    } catch (e) {
      throw e;
    }
  }

  public async stop(): Promise<void> {
    if (!this._instance) return;

    this._instance.close();
    this._instance = undefined;

    this._loggerService.system(`Websocket server has been stopped.`, {
      scope: "Core",
      namespace: this._ADAPTER_NAME,
      tag: "Destroy",
    });
  }

  private _throwConfigError() {
    return new Error("Config not set");
  }
}

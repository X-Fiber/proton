import { https, http, ws, injectable, inject, uuid } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { AbstractWsAdapter } from "./abstract.ws-adapter";

import type {
  Ws,
  Http,
  Https,
  IDiscoveryService,
  ILoggerService,
  IAbstractWsAdapter,
  NAbstractWsAdapter,
  IContextService,
  ISchemeService,
  NContextService,
  IFunctionalityAgent,
  ISchemaAgent,
  IIntegrationAgent,
} from "~types";

@injectable()
export class WsAdapter
  extends AbstractWsAdapter<"ws">
  implements IAbstractWsAdapter
{
  protected readonly _ADAPTER_NAME = WsAdapter.name;
  protected _config: NAbstractWsAdapter.Config;
  protected _instance: Ws.WebSocketServer | undefined;

  private _connections: Map<string, Ws.WebSocket>;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.SchemeService)
    private readonly _schemaService: ISchemeService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {
    super();

    this._connections = new Map();

    this._config = {
      enable: false,
      kind: "ws",
      protocol: "ws",
      host: "0.0.0.0",
      port: 11001,
      serverTag: "SERVER_01",
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
      serverTag: this._discoveryService.getString(
        "adapters.serverTag",
        this._config.serverTag
      ),
    };
  }

  public async start(): Promise<void> {
    this._setConfig();

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
      this._instance = new ws.WebSocketServer({ noServer: true });

      this._instance.on("connection", (ws: Ws.WebSocket): void => {
        this._handshake(ws);
        ws.on("message", async (data) => await this._message(ws, data));
        ws.on("close", () => this._close(ws));
        ws.on("error", (data) => this._error(ws, data));
      });

      server.on("upgrade", (request, socket, head) => {
        this._instance?.handleUpgrade(request, socket, head, (ws) => {
          this._instance?.emit("connection", ws, request);
        });
      });

      server.listen({ port, host }, () => {
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

  public send(connectionId: string, type: any, payload: any): void {
    const connection = this._connections.get(connectionId);
    if (!connection) {
      throw new Error("ConnectionId not found");
    }

    connection.send(JSON.stringify({ type, payload }));
  }

  public broadcast(connectionId: string[], type: any, payload: any): void {
    connectionId.forEach((conn) => this.send(conn, type, payload));
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

  private _handshake(ws: Ws.WebSocket): void {
    const connectionId = uuid.v4();
    ws.$__fiber__ = { connectionId, serverTag: this._config.serverTag };
    this._connections.set(connectionId, ws);

    ws.send(
      JSON.stringify({
        type: "handshake",
        payload: { code: "0002.0001", message: "handshake successful" },
      })
    );
  }

  private async _message(ws: Ws.WebSocket, raw: Ws.RawData): Promise<void> {
    const data = raw.toString();

    type Event = "handshake" | "handshake.error" | "session:to:session";
    const kind: Event[] = ["session:to:session"];

    let event: any = null;
    try {
      event = JSON.parse(data);
    } catch (e) {
      // TODO: resolve error
      console.log(e);
      throw e;
    }

    if ("event" in event && "payload" in event) {
      const k = event.event as Event;
      const p = event.payload as {
        service: string;
        domain: string;
        event: string;
        version: string;
        data: any;
        language: string;
      };

      if (kind.includes(k)) {
        const service = this._schemaService.schema.get(p.service);
        if (!service) {
          ws.send(
            JSON.stringify({
              event: k + `.error`,
              payload: {
                code: "0001.0002",
                message: "Resolve unknown service",
              },
            })
          );
          return;
        }

        const domain = service.get(p.domain);
        if (!domain) {
          throw new Error("Resolve unknown domain");
        }

        const name = `${p.version}.${p.event}.${k}`;

        const event = domain.events.get(name);
        if (!event) throw new Error("Resolve unknown event");

        const store: NContextService.EventStore = {
          service: p.service,
          domain: p.domain,
          event: p.event,
          path: ws.url,
          requestId: uuid.v4(),
          version: p.version,
          schema: this._contextService.store.schema,
          type: k,
          language: p.language,
        };

        try {
          await this._contextService.storage.run(store, async () => {
            const context: NAbstractWsAdapter.Context<
              any,
              any,
              "private:system"
            > = {
              store: store,
              user: {},
              system: {},
            };

            switch (event.scope) {
              case "public:route":
                break;
              case "private:user":
                break;
              case "private:system":
                break;
            }
            try {
              await event.handler(
                p.data,
                {
                  fnAgent: container.get<IFunctionalityAgent>(
                    CoreSymbols.FunctionalityAgent
                  ),
                  schemaAgent: container.get<ISchemaAgent>(
                    CoreSymbols.SchemaAgent
                  ),
                  inAgent: container.get<IIntegrationAgent>(
                    CoreSymbols.IntegrationAgent
                  ),
                },
                context
              );
            } catch (e) {
              console.log(e);
            }
          });
        } catch (e) {
        } finally {
          this._contextService.exit();
        }
      }
    } else {
      // TODO: resolve invalid structure
    }
  }

  private _close(ws: Ws.WebSocket) {
    this._connections.delete(ws.$__fiber__.connectionId);
    ws.close();
  }
  private _error(ws: Ws.WebSocket, error: Error) {}
}

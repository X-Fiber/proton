import { https, http, ws, injectable, inject, uuid } from "~packages";
import { CommunicateCodes, ErrorCodes } from "~common";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { Guards, Helpers } from "~utils";

import { AbstractWsAdapter } from "./abstract.ws-adapter";

import type {
  Ws,
  Http,
  Https,
  ISchemeAgent,
  ILoggerService,
  IDiscoveryService,
  IAbstractWsAdapter,
  NAbstractWsAdapter,
  ISchemeService,
  IContextService,
  NContextService,
  IFunctionalityAgent,
  IIntegrationAgent,
  IExceptionProvider,
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
        throw container
          .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
          .throwError(`Unsupported protocol - ${protocol}`, {
            namespace: WsAdapter.name,
            tag: "Connection",
            code: ErrorCodes.fn.WsAdapter.UNSUPPORTED_PROTOCOL,
            errorType: "FATAL",
          });
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
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError(e, {
          namespace: WsAdapter.name,
          tag: "Connection",
          code: ErrorCodes.fn.WsAdapter.CATCH,
          errorType: "FATAL",
        });
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

    this._send(ws, "handshake", "handshake", {
      code: CommunicateCodes.ws.HANDSHAKE_SUCCESSFUL,
      message: "handshake successful",
    });
  }

  private async _message(ws: Ws.WebSocket, raw: Ws.RawData): Promise<void> {
    const data = raw.toString();

    let event: NAbstractWsAdapter.ClientEventStructure<NAbstractWsAdapter.EventKind>;
    try {
      event = JSON.parse(data);
    } catch {
      this._send(ws, "validation.error.invalid_data_structure", "validation", {
        code: CommunicateCodes.ws.INVALID_DATA_STRUCTURE,
        message:
          "Invalid data structure. Structure must be object with event, kind and payload fields",
      });
      return;
    }

    if (!Guards.isEventStructure(event)) {
      this._send(ws, "validation.error.invalid_data_structure", "validation", {
        code: CommunicateCodes.ws.INVALID_DATA_STRUCTURE,
        message:
          "Invalid data structure. Structure must be object with event, kind and payload fields",
      });
      return;
    }

    switch (event.kind) {
      case "communication":
        await this._callSchemaHandler(ws, event.event, event.payload);
        break;
      case "handshake":
        this._callHandshake(event.payload);
        break;
      case "validation":
        this._callValidation(event.event, event.payload);
        break;
      default:
        this._send(ws, "validation.error.unknown_event_kind", "validation", {
          code: CommunicateCodes.ws.UNKNOWN_EVENT_KIND,
          message: `Event kind '${event.kind}' not supported.`,
        });
        return;
    }
  }

  private _callHandshake(payload: NAbstractWsAdapter.HandshakePayload): void {
    console.warn("Method not implemented");
  }

  private _callValidation(
    event: string,
    payload: NAbstractWsAdapter.HandshakePayload
  ): void {
    console.warn("Method not implemented");
  }

  private async _callSchemaHandler(
    ws: Ws.WebSocket,
    event: string,
    payload: NAbstractWsAdapter.BaseCommunicationPayload
  ): Promise<void> {
    const service = this._schemaService.schema.get(payload.service);

    if (!service) {
      this._send(ws, "validation.error.service_not_found", "validation", {
        code: CommunicateCodes.ws.SERVICE_NOT_FOUND,
        message: `Service "${payload.service}" not found in business scheme collection.`,
      });
      return;
    }

    const domain = service.get(payload.domain);
    if (!domain) {
      this._send(ws, "validation.error.domain_not_found", "validation", {
        code: CommunicateCodes.ws.DOMAIN_NOT_FOUND,
        message: `Domain "${payload.domain}" not found in service "${payload.service}".`,
      });
      return;
    }

    const act = Helpers.getEventUniqueName(
      event,
      payload.version,
      payload.event
    );

    const storage = domain.events.get(act);
    if (!storage) {
      this._send(ws, "validation.error.event_not_found", "validation", {
        code: CommunicateCodes.ws.EVENT_NOT_FOUND,
        message: `Event name "${payload.event}" with version "${payload.version}" and type "${event}" not found in domain "${payload.domain}" in service "${payload.service}".`,
      });
      return;
    }

    const store: NContextService.EventStore = {
      service: payload.service,
      domain: payload.domain,
      event: payload.event,
      path: ws.url,
      requestId: uuid.v4(),
      version: payload.version,
      schema: this._schemaService.schema,
      socket: ws,
      type: event,
      language: payload.language ?? "",
    };

    try {
      await this._contextService.storage.run(store, async () => {
        const context: NAbstractWsAdapter.Context<any, any, "private:system"> =
          {
            store: store,
            user: {},
            system: {},
          };

        switch (storage.scope) {
          case "public:route":
            break;
          case "private:user":
            break;
          case "private:system":
            break;
        }
        try {
          await storage.handler(
            payload.data,
            {
              fnAgent: container.get<IFunctionalityAgent>(
                CoreSymbols.FunctionalityAgent
              ),
              schemaAgent: container.get<ISchemeAgent>(CoreSymbols.SchemaAgent),
              inAgent: container.get<IIntegrationAgent>(
                CoreSymbols.IntegrationAgent
              ),
            },
            context
          );
        } catch (e) {
          console.error(e);
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      this._contextService.exit();
    }
  }

  private _send<E extends NAbstractWsAdapter.AllEventType>(
    socket: Ws.WebSocket,
    event: E,
    kind: NAbstractWsAdapter.EventKind,
    payload: any
  ) {
    socket.send(JSON.stringify({ event, kind, payload }));
  }

  private _close(ws: Ws.WebSocket) {
    this._connections.delete(ws.$__fiber__.connectionId);
    ws.close();
  }
  private _error(ws: Ws.WebSocket, error: Error) {
    throw new Error("Method not implemented");
  }
}

import { injectable, inject, mongoose } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { ErrorCodes } from "~common";
import { Guards } from "~utils";
import { AbstractConnector } from "./abstract.connector";

import {
  Mongoose,
  IContextService,
  ILoggerService,
  IDiscoveryService,
  IMongoConnector,
  NMongoConnector,
  IExceptionProvider,
} from "~types";

@injectable()
export class MongoConnector
  extends AbstractConnector
  implements IMongoConnector
{
  protected readonly _CONNECTOR_NAME = MongoConnector.name;
  private _connection: Mongoose.Mongoose | undefined;
  private _config: NMongoConnector.Config;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {
    super();

    this._config = {
      enable: false,
      connect: {
        protocol: "mongodb",
        host: "0.0.0.0",
        port: 27017,
      },
      auth: {
        username: "",
        password: "",
      },
      database: "default",
    };
  }

  private _setConfig(): NMongoConnector.Config {
    return {
      enable: this._discoveryService.getBoolean(
        "connectors.mongodb.enable",
        this._config.enable
      ),
      connect: {
        protocol: this._discoveryService.getString(
          "connectors.mongodb.connect.protocol",
          this._config.connect.protocol
        ),
        host: this._discoveryService.getString(
          "connectors.mongodb.connect.host",
          this._config.connect.host
        ),
        port: this._discoveryService.getNumber(
          "connectors.mongodb.connect.port",
          this._config.connect.port
        ),
      },
      auth: {
        username: this._discoveryService.getString(
          "connectors.mongodb.auth.username",
          this._config.auth.username
        ),
        password: this._discoveryService.getString(
          "connectors.mongodb.auth.password",
          this._config.auth.password
        ),
      },
      database: this._discoveryService.getString(
        "connectors.mongodb.database",
        this._config.database
      ),
    };
  }

  public async start(): Promise<void> {
    this._config = this._setConfig();

    if (!this._config.enable) {
      this._loggerService.warn(`${MongoConnector.name} is disabled.`, {
        tag: "Connection",
        scope: "Core",
        namespace: MongoConnector.name,
      });
      return;
    }

    const { protocol, host, port } = this._config.connect;

    // TODO: implement advanced configuration options
    const options: Mongoose.ConnectionOptions = {
      dbName: this._config.database,
      auth: {
        username: this._config.auth.username,
        password: this._config.auth.password,
      },
    };

    const url = `${protocol}://${host}:${port}`;

    try {
      this._connection = await mongoose.connect(url, options);
    } catch (e) {
      throw this._catchError(e, "Init");
    }

    this._connection.set("debug", true);
    this._connection.set("debug", (collection, operation, payload) => {
      const store = this._contextService.store;
      this._loggerService.database({
        namespace: MongoConnector.name,
        databaseType: "mongodb",
        collection: collection,
        requestId: store.requestId,
        service: store.service,
        domain: store.domain,
        action: Guards.isRoute(store) ? store.action : undefined,
        sessionId: store.sessionId,
        tag: "Execution",
        event: Guards.isEvent(store) ? store.event : undefined,
        type: Guards.isEvent(store) ? store.type : undefined,
        scope: "Schema",
        operation: operation,
        payload: JSON.stringify(payload),
      });
    });

    this._loggerService.system(
      `${MongoConnector.name} has been started on ${url}.`,
      {
        tag: "Connection",
        scope: "Core",
        namespace: MongoConnector.name,
      }
    );

    this._emit<"MongoConnector">("MongoConnector:init");
  }

  public async stop(): Promise<void> {
    if (!this._connection) return;

    try {
      await this._connection.disconnect();
    } catch (e) {
      throw this._catchError(e, "Destroy");
    }

    this._loggerService.system(`${MongoConnector.name} has been stopped.`, {
      tag: "Connection",
      scope: "Core",
      namespace: MongoConnector.name,
    });

    this._connection = undefined;
    this._emitter.removeAllListeners();
    this._emit<"MongoConnector">("MongoConnector:destroy");
  }

  public get connection(): Mongoose.Mongoose {
    if (!this._connection) {
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError("MongoDB connection not initialize.", {
          tag: "Init",
          namespace: MongoConnector.name,
          errorType: "FATAL",
          code: ErrorCodes.conn.MongoConnector.CONN_NOT_SET,
        });
    }

    return this._connection;
  }
}

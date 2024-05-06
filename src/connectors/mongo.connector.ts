import { injectable, inject, mongoose } from "~packages";
import { CoreSymbols } from "~symbols";
import { AbstractConnector } from "./abstract.connector";

import {
  Mongoose,
  UnknownObject,
  IContextService,
  IDiscoveryService,
  ILoggerService,
  IMongoConnector,
  NMongodbConnector,
} from "~types";

@injectable()
export class MongoConnector
  extends AbstractConnector
  implements IMongoConnector
{
  private _connection: Mongoose.Mongoose | undefined;
  private _config: NMongodbConnector.Config | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {
    super();
  }

  private _setConfig(): void {
    this._config = {
      enable: this._discoveryService.getBoolean(
        "connectors.mongodb.enable",
        false
      ),
      connect: {
        protocol: this._discoveryService.getString(
          "connectors.mongodb.connect.protocol",
          "mongodb"
        ),
        host: this._discoveryService.getString(
          "connectors.mongodb.connect.host",
          "0.0.0.0"
        ),
        port: this._discoveryService.getNumber(
          "connectors.mongodb.connect.port",
          27017
        ),
      },
      auth: {
        username: this._discoveryService.getString(
          "connectors.mongodb.auth.username",
          ""
        ),
        password: this._discoveryService.getString(
          "connectors.mongodb.auth.password",
          ""
        ),
      },
      database: this._discoveryService.getString(
        "connectors.mongodb.database",
        "default"
      ),
    };
  }

  public async start(): Promise<void> {
    this._setConfig();

    if (!this._config) {
      throw new Error("Config is not set");
    }

    if (!this._config.enable) {
      this._loggerService.warn("Mongodb connector is disabled.", {
        tag: "Connection",
        scope: "Core",
        namespace: "MongodbConnector",
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

    try {
      const url = `${protocol}://${host}:${port}`;
      this._connection = await mongoose.connect(url, options);

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
          action: store.action,
          scope: "Schema",
          operation: operation,
          payload: JSON.stringify(payload),
        });
      });

      this._loggerService.system(
        `Mongodb connector has been started on ${url}.`,
        {
          tag: "Connection",
          scope: "Core",
          namespace: "MongodbConnector",
        }
      );
    } catch (e) {
      throw e;
    } finally {
      this._emit("connector:MongoDbConnector:init");
    }
  }

  public async stop(): Promise<void> {
    this._config = undefined;

    if (!this._connection) return;

    try {
      await this._connection.disconnect();

      this._loggerService.system("Mongodb connector has been stopped.", {
        tag: "Connection",
        scope: "Core",
        namespace: "MongodbConnector",
      });
    } catch (e) {
      this._loggerService.error(e, {
        namespace: "MongoConnector",
        scope: "Core",
        errorType: "FATAL",
        tag: "Connection",
      });
      throw e;
    } finally {
      this._connection = undefined;
    }
  }

  public get connection(): Mongoose.Mongoose {
    if (!this._connection) {
      throw new Error("Connection is not set");
    }

    return this._connection;
  }

  private _emit(event: NMongodbConnector.Events, data?: UnknownObject): void {
    this._emitter.emit(event, data);
  }

  public on(
    event: NMongodbConnector.Events,
    listener: (...args: any[]) => void
  ): void {
    this._emitter.on(event, listener);
  }
}

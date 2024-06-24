import { injectable, inject, typeorm } from "~packages";
import { CoreSymbols } from "~symbols";
import { container } from "~container";
import { ErrorCodes } from "~common";
import { AbstractConnector } from "./abstract.connector";

import {
  Typeorm,
  IDiscoveryService,
  ILoggerService,
  ITypeormConnector,
  NTypeormConnector,
  ISchemeService,
  IExceptionProvider,
} from "~types";

@injectable()
export class TypeormConnector
  extends AbstractConnector
  implements ITypeormConnector
{
  protected readonly _CONNECTOR_NAME = TypeormConnector.name;
  private _connection: Typeorm.DataSource | undefined;
  private _config: NTypeormConnector.Config;
  private _repositories: Map<string, Typeorm.Repository<unknown>>;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.SchemeService)
    private readonly _schemaService: ISchemeService
  ) {
    super();

    this._repositories = new Map<string, Typeorm.Repository<unknown>>();

    this._config = {
      enable: false,
      type: "postgres" as NTypeormConnector.DatabaseType,
      protocol: "http",
      host: "0.0.0.0",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "",
      schema: "public",
    };
  }

  private _setConfig(): NTypeormConnector.Config {
    return {
      enable: this._discoveryService.getBoolean(
        "connectors.typeorm.enable",
        this._config.enable
      ),
      type: this._discoveryService.getString(
        "connectors.typeorm.type",
        this._config.type
      ) as NTypeormConnector.DatabaseType,
      protocol: this._discoveryService.getString(
        "connectors.typeorm.postgres.credentials.protocol",
        this._config.protocol
      ),
      host: this._discoveryService.getString(
        "connectors.typeorm.postgres.credentials.host",
        this._config.host
      ),
      port: this._discoveryService.getNumber(
        "connectors.typeorm.postgres.credentials.port",
        this._config.port
      ),
      username: this._discoveryService.getString(
        "connectors.typeorm.postgres.credentials.username",
        this._config.username
      ),
      password: this._discoveryService.getString(
        "connectors.typeorm.postgres.credentials.password",
        this._config.password
      ),
      database: this._discoveryService.getString(
        "connectors.typeorm.postgres.credentials.database",
        this._config.database
      ),
      schema: this._discoveryService.getString(
        "connectors.typeorm.postgres.options.schema",
        this._config.schema
      ),
    };
  }

  public async start(): Promise<void> {
    this._config = this._setConfig();

    if (!this._config.enable) {
      this._loggerService.warn(`${TypeormConnector.name} is disabled.`, {
        tag: "Connection",
        scope: "Core",
        namespace: TypeormConnector.name,
      });
      return;
    }

    const { type, protocol, host, port, schema } = this._config;

    const options: Typeorm.DataSourceOptions = {
      type: this._config.type,
      host: this._config.host,
      port: this._config.port,
      database: this._config.database,
      username: this._config.username,
      password: this._config.password,
      useUTC: true,
      entities: Array.from(this._schemaService.typeormSchemas.values()),
      schema: schema,
      synchronize: true,
    };
    this._connection = new typeorm.DataSource(options);

    try {
      await this._connection.initialize();
    } catch (e) {
      throw this._catchError(e, "Init");
    }

    for (const [name, entity] of this._schemaService.typeormSchemas) {
      this._repositories.set(name, this._connection.getRepository(entity));
    }

    this._loggerService.system(
      `${TypeormConnector.name} with type "${type}" has been started on ${protocol}://${host}:${port}.`,
      {
        tag: "Connection",
        scope: "Core",
        namespace: TypeormConnector.name,
      }
    );

    this._emit<"TypeormConnector">("connector:TypeormConnector:init");
  }

  public async stop(): Promise<void> {
    if (!this._connection) return;

    try {
      await this.connection.destroy();
    } catch (e) {
      throw this._catchError(e, "Destroy");
    }
    this._connection = undefined;
    this._emitter.removeAllListeners();

    this._loggerService.system(`${TypeormConnector.name} has been stopped.`, {
      tag: "Connection",
      scope: "Core",
      namespace: TypeormConnector.name,
    });

    this._emit<"TypeormConnector">("connector:TypeormConnector:destroy");
  }

  public getRepository<T>(name: string): Typeorm.Repository<T> {
    const repository = this._repositories.get(name);
    if (!repository) {
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError(`Repository "${name}" not found.`, {
          tag: "Execution",
          namespace: this._CONNECTOR_NAME,
          errorType: "FATAL",
          code: ErrorCodes.conn.TypeormConnector.REPO_NOT_FOUND,
        });
    }

    return repository as Typeorm.Repository<T>;
  }

  public get connection(): Typeorm.DataSource {
    if (!this._connection) {
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError("Database connection in typeorm ORM is not initialize.", {
          tag: "Execution",
          namespace: this._CONNECTOR_NAME,
          errorType: "FATAL",
          code: ErrorCodes.conn.TypeormConnector.CONN_NOT_SET,
        });
    }

    return this._connection;
  }
}

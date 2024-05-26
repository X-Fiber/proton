import { injectable, inject, winston } from "~packages";
import { CoreSymbols } from "~symbols";
import { Helpers } from "~utils";

import { AbstractService } from "./abstract.service";

import type {
  Winston,
  ILoggerService,
  NLoggerService,
  IDiscoveryService,
} from "~types";

@injectable()
export class LoggerService extends AbstractService implements ILoggerService {
  protected readonly _SERVICE_NAME = LoggerService.name;
  protected readonly _loggerService = this;
  private _config: NLoggerService.Config;
  private _container: Winston.Container | undefined;
  private _loggers: Partial<
    Record<keyof NLoggerService.Loggers, Winston.Logger>
  > = {};

  private readonly _LOGGER_TYPES: NLoggerService.Loggers = {
    core: "CoreLogger",
    schema: "SchemaLogger",
  };

  private readonly _CORE_LEVELS: NLoggerService.CoreLoggerLevels = {
    error: 0,
    warn: 1,
    system: 2,
    api: 3,
    database: 4,
    storage: 5,
    info: 6,
    schema: 7,
    verbose: 8,
  };

  private readonly _SCHEMA_LOGGERS: NLoggerService.SchemaLoggerLevels = {
    error: 0,
    exception: 1,
    warn: 2,
    api: 3,
    info: 4,
    debug: 5,
  };

  private readonly _LOGGER_COLORS: NLoggerService.LoggerColors = {
    error: "bold red",
    exception: "red",
    warn: "yellow",
    system: "cyan",
    api: "bold green",
    database: "magenta",
    storage: "yellow",
    info: "blue",
    schema: "bold green",
    verbose: "gray",
    debug: "bold green",
  };

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService
  ) {
    super();
    this._config = {
      enable: true,
      loggers: {
        core: true,
        schema: true,
      },
      transports: {
        console: {
          core: {
            enable: true,
            level: "verbose",
          },
          schema: {
            enable: true,
            level: "debug",
          },
        },
      },
    };
    winston.addColors(this._LOGGER_COLORS);
  }

  private _setConfig(): NLoggerService.Config {
    return {
      enable: this._discoveryService.getBoolean(
        "services.logger.loggers.core",
        this._config.enable
      ),
      loggers: {
        core: this._discoveryService.getBoolean(
          "services.logger.loggers.core",
          this._config.loggers.core
        ),
        schema: this._discoveryService.getBoolean(
          "services.logger.loggers.schema",
          this._config.loggers.schema
        ),
      },
      transports: {
        console: {
          core: {
            enable: this._discoveryService.getBoolean(
              "services.logger.transports.console.core.enable",
              this._config.transports.console.core.enable
            ),
            level: this._discoveryService.getString(
              "services.logger.transports.console.core.level",
              this._config.transports.console.core.level
            ),
          },
          schema: {
            enable: this._discoveryService.getBoolean(
              "services.logger.transports.console.schema.enable",
              this._config.transports.console.schema.enable
            ),
            level: this._discoveryService.getString(
              "services.logger.transports.console.schema.level",
              this._config.transports.console.schema.level
            ),
          },
        },
      },
    };
  }

  public async init(): Promise<boolean> {
    this._config = this._setConfig();
    this._discoveryService.on("service:DiscoveryService:reload", () => {
      this._config = this._setConfig();
    });

    if (!this._config) {
      console.log(`Config for ${this._SERVICE_NAME} not initialize`);
      return false;
    }

    this._container = new winston.Container();
    if (this._config.loggers.core) {
      const coreTransports: Winston.transport[] = [];
      if (this._config.transports.console.core.enable) {
        coreTransports.push(this._consoleCoreTransport);
      }

      this._container.add(this._LOGGER_TYPES.core, {
        levels: this._CORE_LEVELS,
        level: this._config.transports.console.core.level,
        transports: coreTransports,
      });
    }

    if (this._config.loggers.schema) {
      const schemaTransports: Winston.transport[] = [];
      if (this._config.transports.console.schema.enable) {
        schemaTransports.push(this._consoleSchemaTransport);
      }

      this._container.add(this._LOGGER_TYPES.schema, {
        levels: this._SCHEMA_LOGGERS,
        level: this._config.transports.console.schema.level,
        transports: schemaTransports,
      });
    }

    this._loggers.core = this._container.get(this._LOGGER_TYPES.core);
    this._loggers.schema = this._container.get(this._LOGGER_TYPES.schema);

    return typeof this._config !== "undefined";
  }

  public async destroy(): Promise<void> {}

  public error(msg: any, options: NLoggerService.CoreErrorOptions): void {
    if (this._loggers.core) {
      this._loggers.core.log("error", { msg, ...options });
    }
  }

  public warn(msg: string, options?: NLoggerService.CoreWarnOptions): void {
    if (this._loggers.core) {
      this._loggers.core.log("warn", { msg, ...options });
    }
  }

  public system(msg: string, options?: NLoggerService.CoreSystemOptions): void {
    if (this._loggers.core) {
      this._loggers.core.log("system", { msg, ...options });
    }
  }

  public api(options: NLoggerService.CoreApiOptions): void {
    if (this._loggers.core) {
      this._loggers.core.log("api", { ...options });
    }
  }

  public database(options: NLoggerService.CoreDatabaseOptions): void {
    if (this._loggers.core) {
      this._loggers.core.log("database", { ...options });
    }
  }

  public storage(
    msg: string,
    options?: NLoggerService.CoreStorageOptions
  ): void {
    throw new Error("Method not implemented");
  }

  public info(msg: string, options?: NLoggerService.CoreInfoOptions): void {
    throw new Error("Method not implemented");
  }

  public schema(msg: string, options?: NLoggerService.CoreSchemaOptions): void {
    if (this._loggers.core) {
      this._loggers.core.log("schema", { msg, ...options });
    }
  }

  public verbose(
    msg: string,
    options?: NLoggerService.CoreVerboseOptions
  ): void {
    throw new Error("Method not implemented");
  }

  public logSchemaError(
    msg: string,
    options: NLoggerService.SchemaErrorOptions
  ): void {
    if (this._loggers.schema) {
      this._loggers.schema.log("error", { msg, ...options });
    }
  }
  public logSchemaException(
    msg: string,
    options: NLoggerService.SchemaExceptionOptions
  ): void {
    throw new Error("Method not implemented");
  }
  public logSchemaWarn(
    msg: string,
    options: NLoggerService.SchemaWarnOptions
  ): void {
    throw new Error("Method not implemented");
  }
  public logSchemaApi(
    msg: string,
    options: NLoggerService.SchemaApiOptions
  ): void {
    throw new Error("Method not implemented");
  }
  public logSchemaInfo(
    msg: string,
    options: NLoggerService.SchemaInfoOptions
  ): void {
    throw new Error("Method not implemented");
  }
  public logSchemaDebug(
    msg: string,
    options: NLoggerService.SchemaDebugOptions
  ): void {
    console.debug(msg);
  }

  private get _consoleCoreTransport() {
    if (!this._config) throw this._throwConfigError();

    return new winston.transports.Console({
      level: this._config.transports.console.core.level,
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf((info) => {
          const baseOptions = () => {
            if (info.tag) str += "Tag: " + info.tag + "\n";
            if (info.requestId) str += "RequestId: " + info.requestId + "\n";
            if (info.errorId) str += "ErrorId: " + info.errorId + "\n";
            if (info.traceId) str += "TraceId: " + info.traceId + "\n";
            if (info.sessionId) str += "SessionId: " + info.sessionId;
          };
          let str = info.timestamp + " ";
          let namespace: string = " ";
          if (info.namespace) {
            namespace = Helpers.addBrackets(
              Helpers.centralized(20, info.namespace)
            );
          }
          const coreLevels =
            info.level as keyof NLoggerService.CoreLoggerLevels;

          switch (coreLevels) {
            case "error":
              str += Helpers.addLevel(info.level, "black", "red");
              str += namespace;
              str += info.msg.stack;
              str += "\n";
              if (info.errorType) str += "Type: " + info.errorType + "\n";
              baseOptions();
              break;
            case "warn":
              str += Helpers.addLevel(info.level, "bgBlack", "yellow");
              str += namespace;
              str += info.msg;
              break;
            case "schema":
              str += Helpers.addLevel(info.level, "bgBlue", "green");
              str += namespace;
              str += info.msg;
              baseOptions();
              break;
            case "system":
              str += Helpers.addLevel(info.level, "bgMagenta", "green");
              str += namespace;
              str += info.msg;
              break;
            case "api":
              str += "{ ";
              str += "Service: " + info.service + " ";
              str += "Domain: " + info.domain + " ";
              str += "Action: " + info.action;
              str += " } ";
              str += info.method() + " | " + info.path + "\n";
              str += " ".repeat(3);
              str += "RequestId: " + info.requestId;
              break;
            case "database":
              str += Helpers.addLevel(info.level, "bgBlack", "magenta");
              str += " Request id: " + info.requestId + " ";
              str += "{ " + info.databaseType + " | ";
              str += "Collection: " + info.collection + " }";
              str += "\n";
              str += " ".repeat(3);
              str += "Service: " + info.service + " | ";
              str += "Domain: " + info.domain + " | ";
              str += "Action: " + info.action;
              str += "\n";
              str += " ".repeat(3) + 'Operation type: "' + info.operation + '"';
              str += "\n";
              str += " ".repeat(3) + "Payload: " + info.payload;
              break;
            case "storage":
            case "info":
            case "verbose":
              throw new Error(`Console level "${info.level}" not implemented`);
          }

          return str;
        }),
        winston.format.colorize({ all: true })
      ),
    });
  }

  private get _consoleSchemaTransport() {
    if (!this._config) throw this._throwConfigError();

    return new winston.transports.Console({
      level: this._config.transports.console.schema.level,
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf((info) => {
          const levels = info.level as keyof NLoggerService.SchemaLoggerLevels;

          let msg = "";
          switch (levels) {
            case "error":
              msg += Helpers.addLevel(info.level, "black", "red");
              break;
          }

          return msg;
        }),
        winston.format.colorize({ all: true })
      ),
    });
  }

  private _throwConfigError() {
    return new Error("Config is not initialize");
  }
}

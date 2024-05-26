import type { IAbstractService } from "./abstract.service";
import type { NDiscoveryService } from "./discovery.service";

export interface ILoggerService extends IAbstractService {
  error(msg: any, options: NLoggerService.CoreErrorOptions): void;
  warn(msg: string, options?: NLoggerService.CoreWarnOptions): void;
  system(msg: string, options?: NLoggerService.CoreSystemOptions): void;
  api(options: NLoggerService.CoreApiOptions): void;
  database(options: NLoggerService.CoreDatabaseOptions): void;
  storage(msg: string, options?: NLoggerService.CoreStorageOptions): void;
  info(msg: string, options?: NLoggerService.CoreInfoOptions): void;
  schema(msg: string, options?: NLoggerService.CoreSchemaOptions): void;
  verbose(msg: string, options?: NLoggerService.CoreVerboseOptions): void;

  logSchemaError(msg: string, options: NLoggerService.SchemaErrorOptions): void;
  logSchemaException(
    msg: string,
    options: NLoggerService.SchemaExceptionOptions
  ): void;
  logSchemaWarn(msg: string, options: NLoggerService.SchemaWarnOptions): void;
  logSchemaApi(msg: string, options: NLoggerService.SchemaApiOptions): void;
  logSchemaInfo(msg: string, options: NLoggerService.SchemaInfoOptions): void;
  logSchemaDebug(msg: string, options: NLoggerService.SchemaDebugOptions): void;
}

export namespace NLoggerService {
  export type Config = Pick<
    NDiscoveryService.CoreConfig["services"]["logger"],
    "enable" | "loggers" | "transports"
  >;

  export type Loggers = {
    core: "CoreLogger";
    schema: "SchemaLogger";
  };

  export type CoreLoggerLevels = {
    error: 0;
    warn: 1;
    system: 2;
    api: 3;
    database: 4;
    storage: 5;
    info: 6;
    schema: 7;
    verbose: 8;
  };

  export type SchemaLoggerLevels = {
    error: 0;
    exception: 1;
    warn: 2;
    api: 3;
    info: 4;
    debug: 5;
  };

  export type LoggerColors = {
    error: "bold red";
    exception: "red";
    warn: "yellow";
    system: "cyan";
    api: "bold green";
    database: "magenta";
    storage: "yellow";
    info: "blue";
    schema: "bold green";
    verbose: "gray";
    debug: "bold green";
  };

  export type ServiceTag =
    | "Connection"
    | "Execution"
    | "Init"
    | "Destroy"
    | "Registration";

  export type ErrorType = "FATAL" | "FAIL" | "EXCEPTION" | "CUSTOM";

  export interface CoreBaseOptions {
    namespace: string;
    tag?: ServiceTag;
    requestId?: string;
    sessionId?: string;
  }

  export type ServerScope = "Schema" | "Core";
  export interface ScopeOptions {
    scope: ServerScope;
  }

  export interface CoreErrorOptions extends ScopeOptions, CoreBaseOptions {
    scope: "Core";
    errorType: ErrorType;
  }
  export interface CoreWarnOptions extends ScopeOptions, CoreBaseOptions {
    scope: "Core";
  }
  export interface CoreSystemOptions extends ScopeOptions, CoreBaseOptions {
    scope: "Core";
  }
  export interface CoreApiOptions extends ScopeOptions, CoreBaseOptions {
    path: string;
    method: string;
    ip: string;
    statusCode: string;
    responseType?: string;
    application: string;
    collection: string;
    version: string;
    action: string;
  }

  export type DatabaseType = "mongodb";
  export interface BaseDatabaseOptions extends ScopeOptions, CoreBaseOptions {
    scope: "Core" | "Schema";
    databaseType: DatabaseType;
    service: string;
    domain?: string;
    action?: string;
    event?: string;
    type?: string;
  }
  export interface MongodbDatabaseOptions
    extends BaseDatabaseOptions,
      ScopeOptions,
      CoreBaseOptions {
    databaseType: "mongodb";
    collection: string;
    operation: string;
    payload?: string;
  }

  export type CoreDatabaseOptions = MongodbDatabaseOptions;

  export interface CoreStorageOptions extends ScopeOptions, CoreBaseOptions {
    scope: "Core";
  }
  export interface CoreInfoOptions extends ScopeOptions, CoreBaseOptions {
    scope: "Core";
  }
  export interface CoreSchemaOptions extends ScopeOptions, CoreBaseOptions {
    scope: "Core";
  }
  export interface CoreVerboseOptions extends ScopeOptions, CoreBaseOptions {
    scope: "Core";
  }

  export interface BaseSchemaOptions {
    service: string;
    domain: string;
    version: string;
    action?: string;
    method?: string;
    event?: string;
    type?: string;
    scope?: string;
    tag?: string;
    sessionId?: string;
    requestId?: string;
    userId?: string;
    ip?: string;
  }

  export interface SchemaErrorOptions extends ScopeOptions, BaseSchemaOptions {}
  export interface SchemaExceptionOptions
    extends ScopeOptions,
      BaseSchemaOptions {}
  export interface SchemaWarnOptions extends ScopeOptions, BaseSchemaOptions {}
  export interface SchemaApiOptions extends ScopeOptions, BaseSchemaOptions {
    url?: string;
    statusCode?: string;
  }
  export interface SchemaInfoOptions extends ScopeOptions, BaseSchemaOptions {}
  export interface SchemaDebugOptions extends ScopeOptions, BaseSchemaOptions {}
}

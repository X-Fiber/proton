import type {
  IRabbitMQTunnel,
  IRouteException,
  ITypeormTunnel,
  ITaskService,
  ILoggerService,
  ICacheProvider,
  ISessionProvider,
  IScramblerService,
  IDiscoveryService,
  IAbstractWsAdapter,
  IExceptionProvider,
  NExceptionProvider,
  IFileStorageFactory,
  IPermissionProvider,
} from "../../fn-components";

export interface IFunctionalityAgent {
  readonly discovery: NFunctionalityAgent.Discovery;
  readonly logger: NFunctionalityAgent.Logger;
  readonly utils: NFunctionalityAgent.Utils;
  readonly scrambler: NFunctionalityAgent.Scrambler;
  readonly sessions: NFunctionalityAgent.Sessions;
  readonly exception: NFunctionalityAgent.Exception;
  readonly permissions: NFunctionalityAgent.Permissions;
  readonly scheduler: NFunctionalityAgent.Scheduler;
  readonly fileStorage: NFunctionalityAgent.FileStorage;
  readonly ws: NFunctionalityAgent.Ws;
  readonly broker: NFunctionalityAgent.Broker;
  readonly cache: NFunctionalityAgent.Cache;
}

export namespace NFunctionalityAgent {
  export type Discovery = {
    getMandatory: IDiscoveryService["getSchemaMandatory"];
    getString: IDiscoveryService["getSchemaString"];
    getNumber: IDiscoveryService["getSchemaNumber"];
    getBoolean: IDiscoveryService["getSchemaBoolean"];
    getArray: IDiscoveryService["getSchemaArray"];
    getBuffer: IDiscoveryService["getSchemaBuffer"];
  };

  export type Logger = {
    error: ILoggerService["logSchemaError"];
    exception: ILoggerService["logSchemaException"];
    warn: ILoggerService["logSchemaWarn"];
    api: ILoggerService["logSchemaApi"];
    info: ILoggerService["logSchemaInfo"];
    debug: (msg: string) => void;
  };

  export type Utils = {
    uuid: string;
  };

  export type typeorm = {
    getRepository<T>(): ITypeormTunnel["getRepository"];
  };

  export type Scrambler = {
    readonly accessExpiredAt: IScramblerService["accessExpiredAt"];
    readonly refreshExpiredAt: IScramblerService["refreshExpiredAt"];

    generateAccessToken: IScramblerService["generateAccessToken"];
    generateRefreshToken: IScramblerService["generateRefreshToken"];
    verifyToken: IScramblerService["verifyToken"];
    createHash: IScramblerService["createHash"];
    hashedPassword: IScramblerService["hashPayload"];
    comparePassword: IScramblerService["compareHash"];
  };

  export type Ws = {
    send: IAbstractWsAdapter["send"];
    broadcast: IAbstractWsAdapter["broadcast"];
  };

  export type Broker = {
    sendToQueue: IRabbitMQTunnel["sendToQueue"];
  };

  export type Sessions = {
    open: ISessionProvider["open"];
    getById: ISessionProvider["getById"];
    getCount: ISessionProvider["getCount"];
    update: ISessionProvider["update"];
    removeById: ISessionProvider["removeById"];
  };

  export type Exception = {
    validation: IExceptionProvider["throwValidation"];
    exception: (
      options: Partial<
        Pick<
          NExceptionProvider.RouteErrorOptions,
          "statusCode" | "responseType" | "errorCode" | "redirect" | "trace"
        >
      > &
        Pick<NExceptionProvider.RouteErrorOptions, "message">
    ) => IRouteException;
    error: (
      e: any,
      options?: Partial<
        Pick<
          NExceptionProvider.RouteErrorOptions,
          "statusCode" | "redirect" | "trace"
        >
      >
    ) => IRouteException;
  };

  export type Permissions = {
    createRole: IPermissionProvider["createRole"];
    getRoleRoutes: IPermissionProvider["getRoleRoutes"];
    getRoleEvents: IPermissionProvider["getRoleEvents"];
    removeRole: IPermissionProvider["removeRole"];
    clearRoleRoutes: IPermissionProvider["clearRoleRoutes"];
    clearRoleEvents: IPermissionProvider["clearRoleEvents"];
    addRoute: IPermissionProvider["addRoute"];
    removeRoute: IPermissionProvider["removeRoute"];
    addEvent: IPermissionProvider["addEvent"];
    removeEvent: IPermissionProvider["removeEvent"];
  };

  export type Scheduler = {
    on: ITaskService["on"];
    once: ITaskService["once"];
    off: ITaskService["off"];
    removeListener: ITaskService["removeListener"];
    get: ITaskService["get"];
    set: ITaskService["set"];
    delete: ITaskService["delete"];
  };

  export type FileStorage = IFileStorageFactory["strategy"];

  export type Cache = {
    setItem: ICacheProvider["setItem"];
  };
}

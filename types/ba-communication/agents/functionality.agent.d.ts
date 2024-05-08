import {
  IDiscoveryService,
  IExceptionProvider,
  ILocalizationProvider,
  ILoggerService,
  IMongoTunnel,
  IPermissionProvider,
  IRouteException,
  IScramblerService,
  ISessionProvider,
  ITypeormTunnel,
  NExceptionProvider,
} from "../../fn-components";
import { AbstractWsAdapter } from "../../../src/fn-components/adapters/ws-adapters/abstract.ws-adapter";

export interface IFunctionalityAgent {
  readonly discovery: NFunctionalityAgent.Discovery;
  readonly logger: NFunctionalityAgent.Logger;
  readonly utils: NFunctionalityAgent.Utils;
  readonly scrambler: NFunctionalityAgent.Scrambler;
  readonly sessions: NFunctionalityAgent.Sessions;
  readonly exception: NFunctionalityAgent.Exception;
  readonly permissions: NFunctionalityAgent.Permissions;
  readonly ws: NFunctionalityAgent.Ws;
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
    debug: ILoggerService["logSchemaDebug"];
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
    send: AbstractWsAdapter<"ws">["send"];
    broadcast: AbstractWsAdapter<"ws">["broadcast"];
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
}

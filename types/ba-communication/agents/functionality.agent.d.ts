import {
  IDiscoveryService,
  IExceptionProvider,
  ILocalizationProvider,
  IMongoTunnel,
  IPermissionProvider,
  IRouteException,
  IScramblerService,
  ISessionService,
  ITypeormTunnel,
  NExceptionProvider,
} from "../../fn-components";

export interface IFunctionalityAgent {
  readonly discovery: NFunctionalityAgent.Discovery;
  readonly utils: NFunctionalityAgent.Utils;
  readonly scrambler: NFunctionalityAgent.Scrambler;
  readonly sessions: NFunctionalityAgent.Sessions;
  readonly exception: NFunctionalityAgent.Exception;
  readonly permissions: NFunctionalityAgent.Permissions;
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

  export type HttpSessions = {
    openHttpSession: ISessionService["openHttpSession"];
    getHttpSessionInfo: ISessionService["getHttpSessionInfo"];
    getHttpSessionCount: ISessionService["getHttpSessionCount"];
    deleteHttpSession: ISessionService["deleteHttpSession"];
  };

  export type WsSessions = {
    sendSessionToSession: ISessionService["sendSessionToSession"];
  };

  export type Sessions = {
    http: HttpSessions;
    ws: WsSessions;
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

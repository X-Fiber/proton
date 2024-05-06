import { injectable, inject, uuid } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";

import {
  Jwt,
  Nullable,
  UnknownObject,
  IDiscoveryService,
  IExceptionProvider,
  IFunctionalityAgent,
  IScramblerService,
  ISessionService,
  IValidatorError,
  NFunctionalityAgent,
  NScramblerService,
  NSchemaService,
  NPermissionService,
  IRouteException,
  IContextService,
  NExceptionProvider,
  IPermissionProvider,
} from "~types";
import { Helpers } from "~utils";

@injectable()
export class FunctionalityAgent implements IFunctionalityAgent {
  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.ScramblerService)
    private readonly _scramblerService: IScramblerService,
    @inject(CoreSymbols.SessionService)
    private readonly _sessionService: ISessionService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {}

  public get discovery(): NFunctionalityAgent.Discovery {
    return {
      getMandatory: <T>(name: string): T => {
        return this._discoveryService.getSchemaMandatory<T>(name);
      },
      getString: (name: string, def: string): string => {
        return this._discoveryService.getSchemaString(name, def);
      },
      getNumber: (name: string, def: number): number => {
        return this._discoveryService.getSchemaNumber(name, def);
      },
      getBoolean: (name: string, def: boolean): boolean => {
        return this._discoveryService.getSchemaBoolean(name, def);
      },
      getArray: <T>(name: string, def: Array<T>): Array<T> => {
        return this._discoveryService.getSchemaArray<T>(name, def);
      },
      getBuffer: async (path: string): Promise<Buffer> => {
        return this._discoveryService.getSchemaBuffer(path);
      },
    };
  }

  public get utils(): NFunctionalityAgent.Utils {
    return {
      uuid: uuid.v4(),
    };
  }

  public get scrambler(): NFunctionalityAgent.Scrambler {
    return {
      accessExpiredAt: this._scramblerService.accessExpiredAt,
      refreshExpiredAt: this._scramblerService.refreshExpiredAt,
      generateAccessToken: <
        T extends UnknownObject & NScramblerService.SessionIdentifiers
      >(
        payload: T,
        algorithm?: Jwt.Algorithm
      ): NScramblerService.ConvertJwtInfo => {
        return this._scramblerService.generateAccessToken(payload, algorithm);
      },
      generateRefreshToken: <
        T extends UnknownObject & NScramblerService.SessionIdentifiers
      >(
        payload: T,
        algorithm?: Jwt.Algorithm
      ): NScramblerService.ConvertJwtInfo => {
        return this._scramblerService.generateRefreshToken(payload, algorithm);
      },
      verifyToken: async <T extends UnknownObject>(
        token: string
      ): Promise<NScramblerService.JwtTokenPayload<T>> => {
        return this._scramblerService.verifyToken(token);
      },
      createHash: (algorithm?: Jwt.Algorithm): string => {
        return this._scramblerService.createHash(algorithm);
      },
      hashedPassword: async (password: string): Promise<string> => {
        return this._scramblerService.hashPayload(password);
      },
      comparePassword: async (
        candidatePassword: string,
        userPassword: string
      ): Promise<boolean> => {
        return this._scramblerService.compareHash(
          candidatePassword,
          userPassword
        );
      },
    };
  }

  public get sessions(): NFunctionalityAgent.Sessions {
    return {
      http: {
        openHttpSession: async <T extends UnknownObject>(
          payload: T
        ): Promise<string> => {
          return this._sessionService.openHttpSession<T>(payload);
        },
        getHttpSessionInfo: async <T extends UnknownObject>(
          userId: string,
          sessionId: string
        ): Promise<Nullable<T>> => {
          return this._sessionService.getHttpSessionInfo<T>(userId, sessionId);
        },
        getHttpSessionCount: async (userId): Promise<number> => {
          return this._sessionService.getHttpSessionCount(userId);
        },
        deleteHttpSession: async (
          userId: string,
          sessionId: string
        ): Promise<void> => {
          return this._sessionService.deleteHttpSession(userId, sessionId);
        },
      },
      ws: {
        sendSessionToSession: async (event, payload): Promise<void> => {
          try {
            return this._sessionService.sendSessionToSession(event, payload);
          } catch (e) {
            throw e;
          }
        },
      },
    };
  }

  public get exception(): NFunctionalityAgent.Exception {
    return {
      validation: (errors: NSchemaService.ValidateErrors): IValidatorError => {
        return container
          .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
          .throwValidation(errors);
      },
      exception: (options) => {
        const payload: IRouteException = {
          statusCode: options.statusCode ?? 400,
          processingType: "EXCEPTION",
          requestId: this._contextService.store.requestId,
          responseTime: Helpers.UTCDate,
          trace: options.trace ?? false,
          responseType: options.responseType ?? "EXCEPTION",
          redirect: options.redirect ?? undefined,
          errorCode: options.errorCode ?? undefined,
          sessionId: undefined,
          userId: undefined,
          message: options.message,
        };

        return container
          .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
          .throwRoute(payload);
      },
      error: (e, options) => {
        const ops: Pick<
          NExceptionProvider.RouteErrorOptions,
          "statusCode" | "redirect" | "trace"
        > = {
          statusCode: 500,
          trace: false,
          redirect: undefined,
        };

        if (options) {
          if (options.statusCode) ops["statusCode"] = options.statusCode;
          if (options.redirect) ops["redirect"] = options.redirect;
          if (options.trace) ops["trace"] = options.trace;
        }

        const payload: IRouteException = {
          statusCode: ops.statusCode,
          processingType: "EXCEPTION",
          requestId: this._contextService.store.requestId,
          responseTime: Helpers.UTCDate,
          trace: ops.trace,
          responseType: "FATAL",
          redirect: ops.redirect,
          sessionId: undefined,
          userId: undefined,
          message: e,
        };

        return container
          .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
          .throwRoute(payload);
      },
    };
  }

  public get permissions(): NFunctionalityAgent.Permissions {
    const provider = container.get<IPermissionProvider>(
      CoreSymbols.PermissionProvider
    );

    return {
      createRole: async <
        R extends string = string,
        I extends NPermissionService.RoleInfo = NPermissionService.RoleInfo
      >(
        role: R,
        info: I
      ): Promise<void> => {
        return provider.createRole<R, I>(role, info);
      },
      getRoleRoutes: async <
        R extends string = string,
        RU extends NPermissionService.Routes = NPermissionService.Routes
      >(
        role: R
      ): Promise<Nullable<RU>> => {
        return provider.getRoleRoutes<R, RU>(role);
      },
      getRoleEvents: async <
        R extends string = string,
        EV extends NPermissionService.Events = NPermissionService.Events
      >(
        role: R
      ): Promise<Nullable<EV>> => {
        return provider.getRoleEvents<R, EV>(role);
      },
      removeRole: async <R extends string = string>(role: R): Promise<void> => {
        return provider.removeRole<R>(role);
      },
      clearRoleRoutes: async <R extends string = string>(
        role: R
      ): Promise<void> => {
        return provider.clearRoleRoutes<R>(role);
      },
      clearRoleEvents: async <R extends string = string>(
        role: R
      ): Promise<void> => {
        return provider.clearRoleEvents<R>(role);
      },
      addRoute: async <
        RO extends string = string,
        RU extends NPermissionService.Routes = NPermissionService.Routes
      >(
        role: RO,
        routes: RU
      ): Promise<void> => {
        return provider.addRoute<RO, RU>(role, routes);
      },
      removeRoute: async <
        R extends string = string,
        RU extends NPermissionService.Routes = NPermissionService.Routes
      >(
        role: R,
        routes: RU
      ): Promise<void> => {
        return provider.removeRoute<R, RU>(role, routes);
      },
      addEvent: async <
        R extends string = string,
        EV extends NPermissionService.Events = NPermissionService.Events
      >(
        role: R,
        events: EV
      ): Promise<void> => {
        return provider.addEvent(role, events);
      },
      removeEvent: async <
        E extends string = string,
        EV extends NPermissionService.Events = NPermissionService.Events
      >(
        role: E,
        events: EV
      ): Promise<void> => {
        return provider.removeEvent(role, events);
      },
    };
  }
}

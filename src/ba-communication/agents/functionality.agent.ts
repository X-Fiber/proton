import { injectable, inject, uuid } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { Guards, Helpers } from "~utils";

import {
  AnyFn,
  Jwt,
  Nullable,
  UnknownObject,
  IDiscoveryService,
  IExceptionProvider,
  IFunctionalityAgent,
  IScramblerService,
  ISessionProvider,
  IValidatorError,
  NFunctionalityAgent,
  NScramblerService,
  NSchemaService,
  NPermissionService,
  IRouteException,
  IContextService,
  NExceptionProvider,
  IPermissionProvider,
  IAbstractWsAdapter,
  ILoggerService,
  NLoggerService,
  IRabbitMQTunnel,
  NRabbitMQConnector,
  NRabbitMQTunnel,
  NTaskScheduler,
  ITaskService,
  ITaskScheduler,
  NAbstractFileStorageStrategy,
  IFileStorageFactory,
  ICacheProvider,
  NCacheProvider,
} from "~types";

@injectable()
export class FunctionalityAgent implements IFunctionalityAgent {
  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ScramblerService)
    private readonly _scramblerService: IScramblerService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService,
    @inject(CoreSymbols.TaskService)
    private readonly _taskService: ITaskService,
    @inject(CoreSymbols.WsAdapter)
    private readonly _wsAdapter: IAbstractWsAdapter,
    @inject(CoreSymbols.FileStorageFactory)
    private readonly _fileStorage: IFileStorageFactory
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

  public get logger(): NFunctionalityAgent.Logger {
    const { store } = this._contextService;

    const logOptions: NLoggerService.SchemaErrorOptions = {
      scope: "Schema",
      tag: "Execution",
      sessionId: store.sessionId,
      requestId: store.requestId,
      ip: Guards.isRoute(store) ? store.ip : undefined,
      userId: store.userId,
      action: Guards.isRoute(store) ? store.action : undefined,
      method: Guards.isRoute(store) ? store.method : undefined,
      version: store.version,
      service: store.service,
      domain: store.domain,
      event: Guards.isEvent(store) ? store.event : undefined,
      type: Guards.isEvent(store) ? store.type : undefined,
    };

    return {
      error: (msg) => {
        this._loggerService.logSchemaError(msg, logOptions);
      },
      exception: (msg) => {
        this._loggerService.logSchemaException(msg, logOptions);
      },
      warn: (msg) => {
        this._loggerService.logSchemaWarn(msg, logOptions);
      },
      api: (msg) => {
        this._loggerService.logSchemaApi(msg, logOptions);
      },
      info: (msg) => {
        this._loggerService.logSchemaInfo(msg, logOptions);
      },
      debug: (msg) => {
        this._loggerService.logSchemaDebug(msg, logOptions);
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
    const provider = container.get<ISessionProvider>(
      CoreSymbols.SessionProvider
    );

    return {
      open: <T extends UnknownObject>(payload: T): Promise<string> => {
        return provider.open<T>(payload);
      },
      getById: <T extends UnknownObject>(
        sessionId: string
      ): Promise<T | null> => {
        return provider.getById<T>(sessionId);
      },
      getCount: (sessionId: string): Promise<number> => {
        return provider.getCount(sessionId);
      },
      update: <T extends Record<string, unknown>>(
        sessionId: string,
        field: keyof T,
        value: T[keyof T]
      ): Promise<void> => {
        return provider.update(sessionId, field, value);
      },
      removeById: (sessionId: string): Promise<void> => {
        return provider.removeById(sessionId);
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

  public get scheduler(): NFunctionalityAgent.Scheduler {
    return {
      on: (event: NTaskScheduler.Event, listener: AnyFn): void => {
        this._taskService.on(event, listener);
      },
      once: (event: NTaskScheduler.Event, listener: AnyFn): void => {
        this._taskService.on(event, listener);
      },
      off: (event: NTaskScheduler.Event, listener: AnyFn): void => {
        this._taskService.off(event, listener);
      },
      removeListener: (event: NTaskScheduler.Event, listener: AnyFn): void => {
        this._taskService.removeListener(event, listener);
      },
      set: <K extends string>(
        name: K,
        task: NTaskScheduler.Task
      ): ITaskScheduler => {
        return this._taskService.set(name, task);
      },
      get: <K extends string>(event: K): NTaskScheduler.Task | undefined => {
        return this._taskService.get<K>(event);
      },
      delete: <K extends string>(event: K): boolean => {
        return this._taskService.delete(event);
      },
    };
  }

  public get ws(): NFunctionalityAgent.Ws {
    return {
      send: (sessionId, type, payload): void => {
        this._wsAdapter.send(sessionId, type, payload);
      },
      broadcast: (sessionIds, type, payload): void => {
        this._wsAdapter.broadcast(sessionIds, type, payload);
      },
    };
  }

  public get broker(): NFunctionalityAgent.Broker {
    const tunnel = container.get<IRabbitMQTunnel>(CoreSymbols.RabbitMQTunnel);

    return {
      sendToQueue: <
        P,
        A extends NRabbitMQConnector.AuthScope = NRabbitMQConnector.AuthScope
      >(
        queue: string,
        payload: NRabbitMQTunnel.QueuePayload<P, A>
      ): void => {
        const { store } = this._contextService;

        const name = `${store.service}.${store.domain}.${store.version}.${queue}`;
        tunnel.sendToQueue<P, A>(name, payload);
      },
    };
  }

  public get fileStorage(): NFunctionalityAgent.FileStorage {
    return {
      count: (): Promise<number> => {
        return this._fileStorage.strategy.count();
      },
      setOne: <N extends string>(
        name: N,
        files: NAbstractFileStorageStrategy.FileInfo
      ) => {
        return this._fileStorage.strategy.setOne<N>(name, files);
      },
      setMany: (files: NAbstractFileStorageStrategy.FilesInfo) => {
        return this._fileStorage.strategy.setMany(files);
      },
      getOne: <N extends string>(
        name: N
      ): Promise<NAbstractFileStorageStrategy.FileInfo | null> => {
        return this._fileStorage.strategy.getOne<N>(name);
      },
      getAll: (): Promise<NAbstractFileStorageStrategy.FilesInfo | null> => {
        return this._fileStorage.strategy.getAll();
      },
      updateOne: <N extends string>(
        name: N,
        file: NAbstractFileStorageStrategy.FileInfo
      ): Promise<void> => {
        return this._fileStorage.strategy.updateOne<N>(name, file);
      },
      loadOne: <N extends string>(
        name: N
      ): Promise<NAbstractFileStorageStrategy.FileInfo | null> => {
        return this._fileStorage.strategy.loadOne<N>(name);
      },
      loadAll:
        async (): Promise<NAbstractFileStorageStrategy.FilesInfo | null> => {
          return this._fileStorage.strategy.loadAll();
        },
      removeOne: <N extends string>(name: N): Promise<void> => {
        return this._fileStorage.strategy.removeOne<N>(name);
      },
      clear: (): Promise<void> => {
        return this._fileStorage.strategy.clear();
      },
    };
  }

  public get cache(): NFunctionalityAgent.Cache {
    const tunnel = container.get<ICacheProvider>(CoreSymbols.CacheProvider);

    return {
      setItem: async <N extends string, T>(
        name: N,
        item: T,
        ttl?: number
      ): Promise<NCacheProvider.CacheIdentifier> => {
        return tunnel.setItem<N, T>(name, item, ttl);
      },
    };
  }
}

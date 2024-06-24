import { injectable, inject, express, uuid } from "~packages";
import { CoreSymbols } from "~symbols";
import { Guards } from "~utils";
import {
  defaultConfig,
  ManagerCodes,
  StatusCode,
  MANAGER_AUTH_HEADER,
  MANAGER_TOKEN_HEADER,
  MANAGER_USER_HEADER,
} from "~common";

import { AbstractService } from "./abstract.service";

import {
  AnyFn,
  Express,
  ILoggerService,
  IManagerService,
  NManagerService,
  IDiscoveryService,
  NDiscoveryService,
  IScramblerService,
  ILifecycleService,
} from "~types";

@injectable()
export class ManagerService extends AbstractService implements IManagerService {
  protected readonly _SERVICE_NAME = ManagerService.name;
  private _config: NManagerService.Config;
  private _manager: Express.Application | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected _lifecycleService: ILifecycleService,
    @inject(CoreSymbols.DiscoveryService)
    protected _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ScramblerService)
    protected readonly _scramblerService: IScramblerService
  ) {
    super();
    this._config = defaultConfig.services.manager;
  }

  private _setConfig(): NManagerService.Config {
    return {
      enable: this._discoveryService.getBoolean(
        "services.manager.enable",
        this._config.enable
      ),
      secret: this._discoveryService.getString(
        "services.manager.secret",
        this._config.secret
      ),
      connect: {
        protocol: this._discoveryService.getString(
          "services.manager.connect.protocol",
          this._config.connect.protocol
        ),
        host: this._discoveryService.getString(
          "services.manager.connect.host",
          this._config.connect.host
        ),
        port: this._discoveryService.getNumber(
          "services.manager.connect.port",
          this._config.connect.port
        ),
      },
      communicationUrl: this._discoveryService.getString(
        "services.manager.communicationUrl",
        this._config.communicationUrl
      ),
      users: this._discoveryService.getArray<NDiscoveryService.ManagerUser>(
        "services.manager.users",
        this._config.users
      ),
    };
  }

  public async init(): Promise<boolean> {
    this._config = this._setConfig();

    this._lifecycleService.on("DiscoveryService:reload", () => {
      this._config = this._setConfig();
    });

    const { connect, communicationUrl } = this._config;
    const { protocol, host, port } = connect;
    const url = "/" + communicationUrl + "/:scope/:command";

    try {
      this._manager = express();
      this._manager.use(express.json());

      this._manager.post(url, this._callHandler);

      this._manager.listen(port, host, () => {
        this._loggerService.system(
          `Manager server listening on ${protocol}://${host}:${port}`,
          {
            scope: "Core",
            namespace: ManagerService.name,
            tag: "Connection",
          }
        );
      });

      this._lifecycleService.emit("ManagerService:init");

      return true;
    } catch (e) {
      throw this._catchError(e, "Init");
    }
  }

  public async destroy(): Promise<void> {
    try {
      this._emitter.removeAllListeners();
      if (this._manager) {
        this._manager.removeAllListeners();
        this._manager = undefined;
      }
    } catch (e) {
      throw this._catchError(e, "Destroy");
    }

    this._loggerService.system(`Manager server has been stopped.`, {
      scope: "Core",
      namespace: ManagerService.name,
      tag: "Destroy",
    });
  }

  public once(event: NManagerService.Events, listener: AnyFn): void {
    this._emitter.once(event, listener);
  }

  public on(event: NManagerService.Events, listener: AnyFn): void {
    this._emitter.on(event, listener);
  }

  public off(event: NManagerService.Events, listener: AnyFn): void {
    this._emitter.off(event, listener);
  }

  public clear() {
    this._emitter.removeAllListeners();
  }

  private _callHandler = async (
    req: Express.Request<{ scope: string; command: string }>,
    res: Express.Response
  ): Promise<void> => {
    res.removeHeader("x-powered-by");

    if (!Guards.isManagerScope(req.params.scope)) {
      res.status(StatusCode.BAD_REQUEST).json({
        code: ManagerCodes.validation.SCOPE_NOT_FOUND,
      });
      return;
    }

    let response: NManagerService.Response;

    switch (req.params.scope) {
      case "auth":
        if (!Guards.isAuthCommands(req.params.command)) {
          res.status(StatusCode.BAD_REQUEST).json({
            code: ManagerCodes.validation.COMMAND_NOT_FOUND,
          });
          return;
        }

        const secret = req.headers[MANAGER_AUTH_HEADER];
        const user = req.headers[MANAGER_USER_HEADER];

        if (!Guards.isString(secret)) {
          res.status(StatusCode.BAD_REQUEST).json({
            code: ManagerCodes.validation.SECRET_NOT_FOUND,
          });
          return;
        }

        if (!Guards.isString(user)) {
          res.status(StatusCode.BAD_REQUEST).json({
            code: ManagerCodes.validation.USER_NOT_FOUND,
          });
          return;
        }

        response = this._login(user, secret);
        break;
      case "logger":
        if (!Guards.isLoggerCommands(req.params.command)) {
          res.status(StatusCode.BAD_REQUEST).json({
            code: ManagerCodes.validation.COMMAND_NOT_FOUND,
          });
          return;
        }

        response = { kind: "validation", code: "" };
        break;
      case "discovery":
        console.log(req.params.command);
        console.log(Guards.isDiscoveryCommands(req.params.command));

        if (!Guards.isDiscoveryCommands(req.params.command)) {
          res.status(StatusCode.BAD_REQUEST).json({
            code: ManagerCodes.validation.COMMAND_NOT_FOUND,
          });
          return;
        }

        const result = await this._resolveDiscoveryScope(req.params.command);
        if (result) {
          response = {
            kind: "ok",
            code: ManagerCodes.discovery.SUCCESS,
            data: result,
          };
        } else {
          response = {
            kind: "ok",
            code: ManagerCodes.discovery.SUCCESS,
          };
        }
        break;
    }

    switch (response.kind) {
      case "ok":
        if (response.headers) {
          for (const name in response.headers) {
            res.setHeader(name, response.headers[name]);
          }
        }
        res.status(StatusCode.SUCCESS).json(response.data ?? {});
        return;
      case "validation":
        res.status(StatusCode.BAD_REQUEST).json({ code: response.code });
        return;
      case "fail":
        res.status(StatusCode.BAD_REQUEST).json({ code: response.code });
        return;
    }
  };

  private _login(user: string, secret: string): NManagerService.Response {
    const isValidUser = this._config.users.some((u) => u.name === user);
    const isValidSecret = this._config.secret === secret;

    if (!isValidUser || !isValidSecret) {
      return {
        kind: "fail",
        code: ManagerCodes.auth.NOT_SUPPORTED_ENTITY,
      };
    }

    const token = this._scramblerService.generateAccessToken({
      userId: user,
      sessionId: uuid.v4(),
    });

    return {
      kind: "ok",
      code: ManagerCodes.auth.SUCCESS,
      headers: {
        [MANAGER_TOKEN_HEADER]: token.jwt,
      },
    };
  }

  private _resolveDiscoveryScope(
    scope: NManagerService.DiscoveryCommands
  ): any {
    console.log("@_resolveDiscoveryScope", this);

    switch (scope) {
      case "get-service-status":
        break;
      case "get-service-config":
        return this._getServiceConfig();
      case "reload-core-config":
        break;
      case "reload-scheme-config":
        break;
    }
  }

  private _getServiceConfig() {
    console.log("@_getServiceConfig", this);

    const config: Array<{
      service: string;
      path: string;
      value: string;
    }> = [];

    const setLoggerEl = (path: string, value: unknown) => {
      config.push({
        service: "LoggerService",
        path: path,
        value: JSON.stringify(value),
      });
    };

    const getBoolean = this._discoveryService.getBoolean;
    const getString = this._discoveryService.getString;
    const getNumber = this._discoveryService.getNumber;

    const { logger, scrambler, scheduler } = defaultConfig.services;

    setLoggerEl(
      "services.logger.enable",
      this._discoveryService.getBoolean("services.logger.enable", logger.enable)
    );
    setLoggerEl(
      "services.logger.loggers.core",
      this._discoveryService.getBoolean(
        "services.logger.loggers.core",
        logger.loggers.core
      )
    );
    setLoggerEl(
      "services.logger.loggers.schema",
      this._discoveryService.getBoolean(
        "services.logger.loggers.schema",
        logger.loggers.schema
      )
    );
    setLoggerEl(
      "services.logger.transports.console.core.enable",
      this._discoveryService.getBoolean(
        "services.logger.transports.console.core.enable",
        logger.transports.console.core.enable
      )
    );
    setLoggerEl(
      "services.logger.transports.console.core.level",
      this._discoveryService.getString(
        "services.logger.transports.console.core.level",
        logger.transports.console.core.level
      )
    );
    setLoggerEl(
      "services.logger.transports.console.schema.enable",
      getBoolean(
        "services.logger.transports.console.schema.enable",
        logger.transports.console.schema.enable
      )
    );
    setLoggerEl(
      "services.logger.transports.console.schema.level",
      getString(
        "services.logger.transports.console.schema.level",
        logger.transports.console.schema.level
      )
    );

    const setSchedulerEl = (path: string, value: unknown) => {
      config.push({
        service: "SchedulerService",
        path: path,
        value: JSON.stringify(value),
      });
    };

    setSchedulerEl(
      "services.scheduler.enable",
      getBoolean("services.scheduler.enable", scrambler.enable)
    );
    setSchedulerEl(
      "services.scheduler.maxTask",
      this._discoveryService.getOptional<number | "no-validate" | undefined>(
        "services.scheduler.maxTask",
        scheduler.maxTask as "no-validate"
      )
    );
    setSchedulerEl(
      "services.scheduler.periodicity",
      getNumber("services.scheduler.periodicity", scheduler.periodicity)
    );
    setSchedulerEl(
      "services.scheduler.workers.workerType",
      this._discoveryService.getOptional<string | undefined>(
        "services.scheduler.workers.workerType",
        scheduler.workers.workerType
      )
    );
    setSchedulerEl(
      "services.scheduler.workers.minWorkers",
      this._discoveryService.getOptional<number | undefined | "max">(
        "services.scheduler.workers.minWorkers",
        scheduler.workers.minWorkers as "max"
      )
    );
    setSchedulerEl(
      "services.scheduler.workers.maxWorkers",
      this._discoveryService.getOptional<number | undefined | "max">(
        "services.scheduler.workers.maxWorkers",
        scheduler.workers.maxWorkers
      )
    );
    setSchedulerEl(
      "services.scheduler.workers.workerTerminateTimeout",
      this._discoveryService.getOptional<number | undefined>(
        "services.scheduler.workers.workerTerminateTimeout",
        scheduler.workers.workerTerminateTimeout
      )
    );
    setSchedulerEl(
      "services.scheduler.workers.maxQueueSize",
      this._discoveryService.getOptional<number | undefined>(
        "services.scheduler.workers.maxQueueSize",
        scheduler.workers.maxQueueSize
      )
    );

    const setScramblerEl = (path: string, value: unknown) => {
      config.push({
        service: "ScramblerService",
        path: path,
        value: JSON.stringify(value),
      });
    };

    setScramblerEl(
      "services.scrambler.enable",
      getBoolean("services.scrambler.enable", scrambler.enable)
    );
    setScramblerEl(
      "services.scrambler.accessExpiredAt",
      getNumber("services.scrambler.accessExpiredAt", scrambler.accessExpiredAt)
    );
    setScramblerEl(
      "services.scrambler.refreshExpiredAt",
      getNumber(
        "services.scrambler.refreshExpiredAt",
        scrambler.refreshExpiredAt
      )
    );
    setScramblerEl(
      "services.scrambler.randomBytes",
      getNumber("services.scrambler.randomBytes", scrambler.randomBytes)
    );
    setScramblerEl(
      "services.scrambler.defaultAlgorithm",
      getString(
        "services.scrambler.defaultAlgorithm",
        scrambler.defaultAlgorithm
      )
    );

    return config;
  }
}

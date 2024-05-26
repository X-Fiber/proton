import { injectable, inject, express, uuid } from "~packages";
import { CoreSymbols } from "~symbols";
import {
  MANAGER_AUTH_HEADER,
  MANAGER_TOKEN_HEADER,
  MANAGER_USER_HEADER,
  ManagerCodes,
  StatusCode,
} from "~common";
import { Guards } from "~utils";

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
} from "~types";

@injectable()
export class ManagerService extends AbstractService implements IManagerService {
  protected readonly _SERVICE_NAME = ManagerService.name;
  private _config: NManagerService.Config;
  private _manager: Express.Application | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ScramblerService)
    protected readonly _scramblerService: IScramblerService
  ) {
    super();
    this._config = {
      enable: false,
      secret: "",
      connect: {
        protocol: "http",
        host: "0.0.0.0",
        port: 11008,
      },
      communicationUrl: "v1/call/cli",
      users: [
        {
          name: "Admin",
          permissions: "All",
        },
      ],
    };
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

    if (!this._config.enable) return false;

    this._manager = express();
    this._manager.use(express.json());

    const { connect, communicationUrl } = this._config;
    const { protocol, host, port } = connect;
    const url = "/" + communicationUrl + "/:scope/:command";

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

    return true;
  }

  public async destroy(): Promise<void> {
    this._emitter.removeAllListeners();
    if (this._manager) {
      this._manager.removeAllListeners();
      this._manager = undefined;
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
        if (!Guards.isManagerScope(req.params.command)) {
          res.status(StatusCode.BAD_REQUEST).json({
            code: ManagerCodes.validation.COMMAND_NOT_FOUND,
          });
          return;
        }
        response = { kind: "validation", code: "" };
        break;
    }

    console.log("@response", response);

    switch (response.kind) {
      case "ok":
        if (response.headers) {
          res.removeHeader("x-powered-by");
          for (const name in response.headers) {
            res.setHeader(name, response.headers[name]);
          }
        }

        res.status(StatusCode.SUCCESS).json(response.data ?? {});
        return;
      case "validation":
      case "fail":
        break;
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
}

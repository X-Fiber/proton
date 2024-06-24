import { injectable, inject, ioredis } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { ErrorCodes } from "~common";
import { AbstractConnector } from "./abstract.connector";

import {
  IoRedis,
  IDiscoveryService,
  ILoggerService,
  IRedisConnector,
  NRedisConnector,
  IExceptionProvider,
} from "~types";

@injectable()
export class RedisConnector
  extends AbstractConnector
  implements IRedisConnector
{
  protected readonly _CONNECTOR_NAME = RedisConnector.name;
  private _config: NRedisConnector.Config;
  private _connection: IoRedis.IoRedis | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService
  ) {
    super();

    this._config = {
      enable: false,
      connect: {
        host: "0.0.0.0",
        protocol: "redis",
        port: 6379,
      },
      retryCount: 5,
      retryTimeout: 10000,
      showFriendlyErrorStack: true,
    };
  }

  private _setConfig(): NRedisConnector.Config {
    return {
      enable: this._discoveryService.getBoolean(
        "connectors.redis.enable",
        this._config.enable
      ),
      connect: {
        protocol: this._discoveryService.getString(
          "connectors.redis.connect.protocol",
          this._config.connect.protocol
        ),
        host: this._discoveryService.getString(
          "connectors.redis.connect.host",
          this._config.connect.host
        ),
        port: this._discoveryService.getNumber(
          "connectors.redis.connect.port",
          this._config.connect.port
        ),
      },
      retryTimeout: this._discoveryService.getNumber(
        "connectors.redis.options.retryTimeout",
        this._config.retryTimeout
      ),
      retryCount: this._discoveryService.getNumber(
        "connectors.redis.options.retryCount",
        this._config.retryCount
      ),
      showFriendlyErrorStack: this._discoveryService.getBoolean(
        "connectors.redis.options.showFriendlyErrorStack",
        this._config.showFriendlyErrorStack
      ),
    };
  }

  public async start(): Promise<void> {
    this._config = this._setConfig();

    if (!this._config.enable) {
      this._loggerService.warn(`${RedisConnector.name} is disabled.`, {
        tag: "Connection",
        scope: "Core",
        namespace: RedisConnector.name,
      });
      return;
    }

    const { protocol, host, port } = this._config.connect;
    const url = `${protocol}://${host}:${port}`;

    // TODO: implement advanced configuration
    const redisOptions: IoRedis.IoRedisOptions = {
      host: host,
      port: port,
      showFriendlyErrorStack: this._config.showFriendlyErrorStack,
      retryStrategy: () => this._config.retryTimeout,
    };

    try {
      this._connection = new ioredis.ioredis(url, redisOptions);
    } catch (e) {
      throw this._catchError(e, "Init");
    }

    this._loggerService.system(
      `${RedisConnector.name} has been started on ${url}.`,
      {
        tag: "Connection",
        scope: "Core",
        namespace: RedisConnector.name,
      }
    );

    this._emit<"RedisConnector">("RedisConnector:init");
  }

  public async stop(): Promise<void> {
    if (!this._connection) return;

    try {
      this._connection.disconnect();
    } catch (e) {
      this._catchError(e, "Destroy");
    }

    this._connection = undefined;
    this._emitter.removeAllListeners();

    this._loggerService.system(`${RedisConnector.name} has been stopped.`, {
      tag: "Connection",
      scope: "Core",
      namespace: RedisConnector.name,
    });

    this._emit<"RedisConnector">("RedisConnector:destroy");
  }

  public get connection(): IoRedis.IoRedis {
    if (!this._connection) {
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError("Redis connection is not initialize.", {
          tag: "Execution",
          namespace: this._CONNECTOR_NAME,
          errorType: "FATAL",
          code: ErrorCodes.conn.CATCH_ERROR,
        });
    }

    return this._connection;
  }
}

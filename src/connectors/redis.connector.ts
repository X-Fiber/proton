import { injectable, inject, ioredis } from "~packages";
import { CoreSymbols } from "~symbols";
import { AbstractConnector } from "./abstract.connector";

import type {
  IoRedis,
  IDiscoveryService,
  ILoggerService,
  IRedisConnector,
  NRedisConnector,
} from "~types";

@injectable()
export class RedisConnector
  extends AbstractConnector
  implements IRedisConnector
{
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

  private _setConfig(): void {
    this._config = {
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
    this._setConfig();

    if (!this._config) {
      throw new Error("Config is not set");
    }

    if (!this._config.enable) {
      this._loggerService.warn("Redis connector is disabled.", {
        tag: "Connection",
        scope: "Core",
        namespace: "RedisConnector",
      });
      return;
    }

    const { protocol, host, port } = this._config.connect;
    const url = `${protocol}://${host}:${port}`;

    const redisOptions: IoRedis.IoRedisOptions = {
      host: host,
      port: port,
      showFriendlyErrorStack: this._config.showFriendlyErrorStack,
      retryStrategy: () => this._config.retryTimeout,
    };

    try {
      this._connection = new ioredis.ioredis(url, redisOptions);

      this._loggerService.system(
        `Redis connector has been started on ${url}.`,
        {
          tag: "Connection",
          scope: "Core",
          namespace: "RedisConnector",
        }
      );
    } catch (e) {
      throw e;
    }
  }

  public async stop(): Promise<void> {
    if (!this._connection) return;

    this._connection.disconnect();
    this._connection = undefined;
    this._emitter.removeAllListeners();

    this._loggerService.system(`Redis connector has been stopped.`, {
      tag: "Connection",
      scope: "Core",
      namespace: "RedisConnector",
    });
  }

  public get connection(): IoRedis.IoRedis {
    if (!this._connection) {
      throw new Error("Redis connection is not set");
    }

    return this._connection;
  }
}

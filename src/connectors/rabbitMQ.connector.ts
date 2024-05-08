import { injectable, inject, rabbitMQ } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { AbstractConnector } from "./abstract.connector";

import {
  RabbitMQ,
  ILoggerService,
  IDiscoveryService,
  IRabbitMQConnector,
  NRabbitMQConnector,
  IExceptionProvider,
} from "~types";

injectable();
export class RabbitMQConnector
  extends AbstractConnector
  implements IRabbitMQConnector
{
  private _options: NRabbitMQConnector.Config;
  private _connection: RabbitMQ.Connection | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly loggerService: ILoggerService
  ) {
    super();

    this._options = {
      enable: false,
      protocol: "amqp",
      host: "0.0.0.0",
      port: 5672,
      username: "guest",
      password: "guest",
      locale: "en_US",
      frameMax: 0x1000,
      heartBeat: 0,
      vhost: "/",
    };
  }

  public get connection(): RabbitMQ.Connection {
    if (!this._connection) {
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError("RabbitMQ Connection not initialize.", {
          tag: "EXECUTION",
          namespace: RabbitMQConnector.name,
          errorType: "FATAL",
        });
    }

    return this._connection;
  }

  private _setConfig(): NRabbitMQConnector.Config {
    return {
      enable: this.discoveryService.getBoolean(
        "connectors.rabbitMQ.enable",
        this._options.enable
      ),
      protocol: this.discoveryService.getString(
        "connectors.rabbitMQ.protocol",
        this._options.protocol
      ),
      host: this.discoveryService.getString(
        "connectors.rabbitMQ.host",
        this._options.host
      ),
      port: this.discoveryService.getNumber(
        "connectors.rabbitMQ.port",
        this._options.port
      ),
      username: this.discoveryService.getString(
        "connectors.rabbitMQ.username",
        this._options.username
      ),
      password: this.discoveryService.getString(
        "connectors.rabbitMQ.password",
        this._options.password
      ),
      locale: this.discoveryService.getString(
        "connectors.rabbitMQ.locale",
        this._options.locale
      ),
      frameMax: this.discoveryService.getNumber(
        "connectors.rabbitMQ.frameMax",
        this._options.frameMax
      ),
      heartBeat: this.discoveryService.getNumber(
        "connectors.rabbitMQ.heartBeat",
        this._options.heartBeat
      ),
      vhost: this.discoveryService.getString(
        "connectors.rabbitMQ.vhost",
        this._options.vhost
      ),
    };
  }

  public async start(): Promise<void> {
    this._options = this._setConfig();

    if (!this._options.enable) return;

    rabbitMQ.connect(
      {
        protocol: this._options.protocol,
        hostname: this._options.host,
        port: this._options.port,
        username: this._options.username,
        password: this._options.password,
        locale: this._options.locale,
        frameMax: this._options.frameMax,
        heartbeat: this._options.heartBeat,
        vhost: this._options.vhost,
      },
      (err, connection): void => {
        if (this._connection) return;
        const { protocol, host, port } = this._options;

        if (err) {
          throw container
            .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
            .throwError(
              `Failed to create RabbitMQ connection due to error: ${err}`,
              {
                tag: "Connection",
                namespace: RabbitMQConnector.name,
                errorType: "FATAL",
              }
            );
        }

        this._connection = connection;

        this.loggerService.system(
          `Mongodb connector has been started on ${protocol}://${host}:${port}.`,
          {
            tag: "Connection",
            namespace: RabbitMQConnector.name,
            scope: "Core",
          }
        );
      }
    );
  }

  public async stop(): Promise<void> {
    if (this._connection) {
      this._connection = undefined;
    }

    this.loggerService.system(`Mongodb connector has been stopped.`, {
      tag: "Destroy",
      namespace: RabbitMQConnector.name,
      scope: "Core",
    });
  }
}

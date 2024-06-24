import { injectable, inject, rabbitMQ, uuid } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { ErrorCodes } from "~common";
import { AbstractConnector } from "./abstract.connector";

import type {
  RabbitMQ,
  ILoggerService,
  IDiscoveryService,
  IRabbitMQConnector,
  NRabbitMQConnector,
  IExceptionProvider,
  IFunctionalityAgent,
  ISchemeAgent,
  IIntegrationAgent,
  IContextService,
  NContextService,
  ISchemeService,
  NSchemeService,
} from "~types";

injectable();
export class RabbitMQConnector
  extends AbstractConnector
  implements IRabbitMQConnector
{
  protected readonly _CONNECTOR_NAME = RabbitMQConnector.name;
  private _config: NRabbitMQConnector.Config;
  private _connection: RabbitMQ.Connection | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    private readonly discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService,
    @inject(CoreSymbols.SchemeService)
    private readonly _schemaService: ISchemeService
  ) {
    super();

    this._config = {
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

  private _setConfig(): NRabbitMQConnector.Config {
    return {
      enable: this.discoveryService.getBoolean(
        "connectors.rabbitMQ.enable",
        this._config.enable
      ),
      protocol: this.discoveryService.getString(
        "connectors.rabbitMQ.protocol",
        this._config.protocol
      ),
      host: this.discoveryService.getString(
        "connectors.rabbitMQ.host",
        this._config.host
      ),
      port: this.discoveryService.getNumber(
        "connectors.rabbitMQ.port",
        this._config.port
      ),
      username: this.discoveryService.getString(
        "connectors.rabbitMQ.username",
        this._config.username
      ),
      password: this.discoveryService.getString(
        "connectors.rabbitMQ.password",
        this._config.password
      ),
      locale: this.discoveryService.getString(
        "connectors.rabbitMQ.locale",
        this._config.locale
      ),
      frameMax: this.discoveryService.getNumber(
        "connectors.rabbitMQ.frameMax",
        this._config.frameMax
      ),
      heartBeat: this.discoveryService.getNumber(
        "connectors.rabbitMQ.heartBeat",
        this._config.heartBeat
      ),
      vhost: this.discoveryService.getString(
        "connectors.rabbitMQ.vhost",
        this._config.vhost
      ),
    };
  }

  public async start(): Promise<void> {
    this._config = this._setConfig();

    if (!this._config.enable) {
      this._loggerService.warn(`${RabbitMQConnector.name} is disabled.`, {
        tag: "Connection",
        scope: "Core",
        namespace: RabbitMQConnector.name,
      });
      return;
    }

    rabbitMQ.connect(
      {
        protocol: this._config.protocol,
        hostname: this._config.host,
        port: this._config.port,
        username: this._config.username,
        password: this._config.password,
        locale: this._config.locale,
        frameMax: this._config.frameMax,
        heartbeat: this._config.heartBeat,
        vhost: this._config.vhost,
      },
      async (err, connection): Promise<void> => {
        if (err) {
          throw this._catchError(err, "Init");
        }

        if (this._connection) return;

        const { protocol, host, port } = this._config;
        this._connection = connection;

        this._emit<"RabbitMQConnector">("RabbitMQConnector:init");

        this._loggerService.system(
          `${RabbitMQConnector.name} has been started on ${protocol}://${host}:${port}.`,
          {
            tag: "Connection",
            scope: "Core",
            namespace: RabbitMQConnector.name,
          }
        );

        try {
          await this._subscribe();

          this._emit<"RabbitMQConnector">("RabbitMQConnector:subscribe");
        } catch (e) {
          throw this._catchError(e, "Init");
        }
      }
    );
  }

  public async stop(): Promise<void> {
    if (!this._connection) return;

    this.connection.close(() => {
      this._loggerService.system(
        `${RabbitMQConnector.name} has been stopped.`,
        {
          tag: "Destroy",
          scope: "Core",
          namespace: RabbitMQConnector.name,
        }
      );
    });
    this._connection = undefined;
    this._emitter.removeAllListeners();
    this._emit<"RabbitMQConnector">("RabbitMQConnector:destroy");
  }

  public get connection(): RabbitMQ.Connection {
    if (!this._connection) {
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError("RabbitMQ connection not initialize.", {
          tag: "EXECUTION",
          namespace: RabbitMQConnector.name,
          errorType: "FATAL",
          code: ErrorCodes.conn.RabbitMQConnector.CONN_NOT_SET,
        });
    }

    return this._connection;
  }

  protected async _subscribe(): Promise<void> {
    this.connection.createChannel((e, channel) => {
      if (e) {
        throw this._catchError(e, "Execution");
      }

      this._schemaService.schema.forEach((sStorage, sName) => {
        sStorage.forEach((sDomain, dName) => {
          sDomain.broker.forEach((topic, queue) => {
            switch (topic.type) {
              case "queue":
                this._consumeQueue(channel, sName, dName, queue, topic);
                break;
              case "exchange":
                this._consumeExchange(channel, queue, topic);
                break;
            }
          });
        });
      });
    });
  }

  private async _consumeQueue(
    channel: RabbitMQ.Channel,
    service: string,
    domain: string,
    queue: string,
    topic: NRabbitMQConnector.QueueTopic
  ): Promise<void> {
    const qOptions: RabbitMQ.QueueOptions = {
      durable: topic.queue?.durable ?? true,
      ...topic.queue,
    };
    const cOptions: RabbitMQ.ConsumeOptions = {
      noAck: topic.consume?.noAck ?? true,
      ...topic.consume,
    };

    channel.assertQueue(queue, qOptions);
    channel.consume(
      queue,
      async (msg): Promise<void> => {
        if (msg) {
          try {
            await this._callHandler(msg, service, domain, queue, topic);
          } catch (e) {
            throw this._catchError(e, "Execution");
          }
        }
      },
      cOptions
    );
  }

  private async _consumeExchange(
    channel: RabbitMQ.Channel,
    queue: string,
    topic: NRabbitMQConnector.ExchangeTopic
  ): Promise<void> {
    throw new Error(
      `Method not implemented. Args: ${channel}, ${queue}, ${topic}`
    );
  }

  private async _callHandler(
    msg: RabbitMQ.Message,
    service: string,
    domain: string,
    queue: string,
    topic: NRabbitMQConnector.Topic
  ): Promise<void> {
    const agents: NSchemeService.Agents = {
      fnAgent: container.get<IFunctionalityAgent>(
        CoreSymbols.FunctionalityAgent
      ),
      schemaAgent: container.get<ISchemeAgent>(CoreSymbols.SchemaAgent),
      inAgent: container.get<IIntegrationAgent>(CoreSymbols.IntegrationAgent),
    };

    const store: NContextService.TopicStore = {
      service: service,
      domain: domain,
      queue: queue,
      version: topic.version,
      schema: this._schemaService.schema,
      requestId: uuid.v4(),
      language: "",
    };

    switch (topic.scope) {
      case "public":
        break;
      case "private":
        break;
    }

    const context: NRabbitMQConnector.Context = {
      store: store,
      session: {},
    };

    try {
      await this._contextService.storage.run(store, async () => {
        try {
          await topic.handler(msg, agents, context);
        } catch (e) {
          throw this._catchError(e, "Execution");
        }
      });
    } catch (e) {
      throw this._catchError(e, "Execution");
    }
  }
}

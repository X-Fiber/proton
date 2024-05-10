import { injectable, inject, rabbitMQ, uuid } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { AbstractConnector } from "./abstract.connector";

import type {
  RabbitMQ,
  ILoggerService,
  IDiscoveryService,
  IRabbitMQConnector,
  NRabbitMQConnector,
  IExceptionProvider,
  IFunctionalityAgent,
  ISchemaAgent,
  IIntegrationAgent,
  NContextService,
  IContextService,
  ISchemeService,
  NSchemaService,
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
    protected readonly loggerService: ILoggerService,
    @inject(CoreSymbols.ContextService)
    protected _contextService: IContextService,
    @inject(CoreSymbols.SchemeService)
    protected _schemaService: ISchemeService
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
      async (err, connection): Promise<void> => {
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
          `RabbitMQ connector has been started on ${protocol}://${host}:${port}.`,
          {
            tag: "Connection",
            namespace: RabbitMQConnector.name,
            scope: "Core",
          }
        );

        await this._subscribe();
      }
    );
  }

  public async stop(): Promise<void> {
    if (this._connection) {
      this.connection.close(() => {
        this.loggerService.system(`Mongodb connector has been stopped.`, {
          tag: "Destroy",
          namespace: RabbitMQConnector.name,
          scope: "Core",
        });
      });
      this._connection = undefined;
    }
  }

  protected async _subscribe(): Promise<void> {
    this.connection.createChannel((e, channel) => {
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

    const name = `${service}.${domain}.${topic.version}.${queue}`;

    channel.assertQueue(name, qOptions);
    channel.consume(
      queue,
      async (msg): Promise<void> => {
        if (msg) {
          await this._callHandler(msg, service, domain, queue, topic);
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
    // TODO: Method not implemented
    console.log(channel, queue, topic);
  }

  private async _callHandler(
    msg: RabbitMQ.Message,
    service: string,
    domain: string,
    queue: string,
    topic: NRabbitMQConnector.Topic
  ): Promise<void> {
    const agents: NSchemaService.Agents = {
      fnAgent: container.get<IFunctionalityAgent>(
        CoreSymbols.FunctionalityAgent
      ),
      schemaAgent: container.get<ISchemaAgent>(CoreSymbols.SchemaAgent),
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

    await this._contextService.storage.run(store, async () => {
      try {
        await topic.handler(msg, agents, context);
      } catch (e) {
        throw container
          .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
          .throwError(e, {
            tag: "Execution",
            errorType: "FAIL",
            namespace: RabbitMQConnector.name,
            requestId: this._contextService.store.requestId,
            sessionId: this._contextService.store.sessionId,
          });
      }
    });
  }
}

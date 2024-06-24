import type { RabbitMQ } from "../packages";
import type {
  AnyFn,
  NContextService,
  NDiscoveryService,
  NSchemeService,
} from "../fn-components";
import type {
  IAbstractConnector,
  NAbstractConnector,
} from "./abstract.connector";

export interface IRabbitMQConnector extends IAbstractConnector {
  readonly connection: RabbitMQ.Connection;

  on(event: NRabbitMQConnector.Events, listener: AnyFn): void;
  once(event: NRabbitMQConnector.Events, listener: AnyFn): void;
  off(event: NRabbitMQConnector.Events, listener: AnyFn): void;
}

export namespace NRabbitMQConnector {
  export type Events =
    | NAbstractConnector.Events<"RabbitMQConnector">
    | "connector:RabbitMQConnector:subscribe.finish";

  export type Config = Pick<
    NDiscoveryService.CoreConfig["connectors"]["rabbitMQ"],
    | "enable"
    | "protocol"
    | "host"
    | "port"
    | "username"
    | "password"
    | "locale"
    | "frameMax"
    | "heartBeat"
    | "vhost"
  >;

  export type AuthScope = "public" | "private";

  export type Context<T = any, A extends AuthScope = AuthScope> = {
    store: NContextService.TopicStore;
    session: A extends "private" ? T : A extends "public" ? undefined : never;
  };

  export type Handler = (
    msg: RabbitMQ.Message,
    agents: NSchemeService.Agents,
    context: Context
  ) => Promise<void>;

  export type TopicKind = "queue" | "exchange";

  export interface BaseTopic {
    type: TopicKind;
    scope: "public" | "private";
    version: string;
    handler: Handler;
  }

  export interface QueueTopic extends BaseTopic {
    type: "queue";
    queue?: RabbitMQ.QueueOptions;
    consume?: RabbitMQ.ConsumeOptions;
  }

  export interface ExchangeTopic extends BaseTopic {
    type: "exchange";
    exchange?: RabbitMQ.ExchangeOptions;
  }

  export type Topic = QueueTopic | ExchangeTopic;
}

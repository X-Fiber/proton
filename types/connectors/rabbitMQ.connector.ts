import { NDiscoveryService } from "../fn-components";
import { RabbitMQ } from "../packages";
import { IAbstractConnector } from "./abstract.connector";

export interface IRabbitMQConnector extends IAbstractConnector {
  readonly connection: RabbitMQ.Connection;
}

export namespace NRabbitMQConnector {
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
}

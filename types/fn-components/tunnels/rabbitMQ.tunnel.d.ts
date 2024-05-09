import { NRabbitMQConnector } from "../../connectors";

export interface IRabbitMQTunnel {
  sendToQueue<
    P,
    A extends NRabbitMQConnector.AuthScope = NRabbitMQConnector.AuthScope
  >(
    queue: string,
    payload?: NRabbitMQTunnel.QueuePayload<P, A>
  ): void;
}

export namespace NRabbitMQTunnel {
  export type QueuePayload<
    P,
    A extends NRabbitMQConnector.AuthScope = NRabbitMQConnector.AuthScope
  > = A extends "public"
    ? P
    : A extends "private"
    ? { token: string; payload: P }
    : never;

  export type Context = {
    sessionId?: string;
    requestId?: string;
  };
}

import { Ws } from "../../packages";
import {
  NContextService,
  NDiscoveryService,
  NSchemaService,
} from "../services";
import { NAbstractHttpAdapter } from "./abstract.http-adapter";
import { AuthScope, Context } from "../services/schema.service";

export interface IAbstractWsAdapter {
  start(): Promise<void>;
  stop(): Promise<void>;

  send(connectionId: string, type: any, payload: any): void;
  broadcast(connectionId: string[], type: any, payload: any): void;
}

export namespace NAbstractWsAdapter {
  export type WsKind = "ws";

  export type Instance<K extends WsKind> = K extends "ws"
    ? Ws.WebSocketServer
    : never;

  export type Config = Pick<
    NDiscoveryService.CoreConfig["adapters"]["ws"],
    "enable" | "protocol" | "host" | "port" | "kind"
  > &
    Pick<NDiscoveryService.CoreConfig["adapters"], "serverTag">;

  export type Context<
    USER_INFO = any,
    SYSTEM_INFO = any,
    AUTH_SCOPE extends NSchemaService.AuthScope = NSchemaService.AuthScope
  > = {
    store: NContextService.EventStore;
  } & (AUTH_SCOPE extends "public:route"
    ? {}
    : AUTH_SCOPE extends "private:user"
    ? {
        user: USER_INFO;
      }
    : AUTH_SCOPE extends "private:system"
    ? {
        user: USER_INFO;
        system: SYSTEM_INFO;
      }
    : never);

  export type Handler = (
    payload: any,
    agents: NSchemaService.Agents,
    context: NAbstractWsAdapter.Context
  ) => Promise<void>;
}

import { Ws } from "../../packages";
import { NDiscoveryService } from "../services";

export interface IAbstractWsAdapter {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export namespace NAbstractWebsocketAdapter {
  export type WsKind = "ws";

  export type Instance<K extends WsKind> = K extends "ws"
    ? Ws.WebSocketServer
    : never;

  export type Config = Pick<
    NDiscoveryService.CoreConfig["adapters"]["ws"],
    "enable" | "protocol" | "host" | "port" | "kind"
  >;
}

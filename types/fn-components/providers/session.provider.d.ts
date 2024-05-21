import type { Ws } from "../../packages";
import type { UnknownObject } from "../utils";
import type { IIntegrationAgent } from "../../ba-communication";

export interface ISessionProvider {
  open<T extends UnknownObject>(payload: T): Promise<string>;
  getById<T extends UnknownObject>(sessionId: string): Promise<T | null>;
  getCount(sessionId: string): Promise<number>;
  update<T extends Record<string, unknown>>(
    sessionId: string,
    field: keyof T,
    value: T[keyof T]
  ): Promise<void>;
  removeById(sessionId: string): Promise<void>;
}

export namespace NSessionProvider {
  export type Agents = {
    integrationAgent: IIntegrationAgent;
  };

  export type Config = {
    serverTag: string;
  };

  export interface ConnectionDetails {
    userAgent?: string;
    acceptLanguage?: string;
    websocketKey?: string;
    ip?: string;
  }

  export interface BaseConnection extends ConnectionDetails {
    auth: boolean;
    localization?: string;
    clientTag?: string;
    applicationName?: string;
    deviceId?: string;
    fingerprint?: string;
    socket: Ws.WebSocket;
    connectionCount: number;
  }
  export interface AnonymousConnection extends BaseConnection {
    auth: false;
  }
  export interface AuthConnection<T extends UnknownObject = UnknownObject>
    extends BaseConnection {
    auth: true;
    userId: string;
    sessionId: string;
    sessionInfo: T;
  }

  export type Connection<T extends UnknownObject = UnknownObject> =
    | AnonymousConnection
    | AuthConnection<T>;
}

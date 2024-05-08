import { UnknownObject } from "../utils";
import { Ws } from "../../packages";
import { IIntegrationAgent } from "../../ba-communication";

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
  export const enum ClientEvent {
    HANDSHAKE = "handshake",
    UPLOAD_PAGE = "upload:page",
    AUTHENTICATE = "authenticate",
    SESSION_TO_SESSION = "session:to:session",
    BROADCAST_TO_SERVICE = "broadcast:to:service",
  }

  export type Agents = {
    integrationAgent: IIntegrationAgent;
  };

  export type ClientData<
    P,
    H extends Record<string, string> = Record<string, string>,
    E extends ClientEvent = ClientEvent
  > = {
    event: E;
    payload: P;
    headers?: H;
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

  export type SessionToSessionPayload = {
    recipientId: string;
    payload?: UnknownObject;
  };

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

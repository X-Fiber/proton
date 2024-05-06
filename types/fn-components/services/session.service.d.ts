import { Nullable, UnknownObject } from "../utils";
import { IAbstractService } from "./abstract.service";
import { Ws } from "../../packages";
import { IIntegrationAgent } from "../../ba-communication";

export interface ISessionService extends IAbstractService {
  openHttpSession<T extends UnknownObject>(payload: T): Promise<string>;
  getHttpSessionInfo<T extends UnknownObject>(
    userId: string,
    sessionId: string
  ): Promise<Nullable<T>>;
  getHttpSessionCount(userId: string): Promise<number>;
  deleteHttpSession(userId: string, sessionId: string): Promise<void>;

  setWsConnection(
    ws: Ws.WebSocket,
    connection: NSessionService.ConnectionDetails
  ): void;
  sendSessionToSession(
    event: string,
    payload: NSessionService.SessionToSessionPayload
  ): Promise<void>;
}

export namespace NSessionService {
  export type ServerEvent =
    | "handshake"
    | "handshake.error"
    | "authenticate"
    | "authenticate.error"
    | "session:to:session"
    | "broadcast:to:service";

  export const enum ClientEvent {
    HANDSHAKE = "handshake",
    UPLOAD_PAGE = "upload:page",
    AUTHENTICATE = "authenticate",
    SESSION_TO_SESSION = "session:to:session",
    BROADCAST_TO_SERVICE = "broadcast:to:service",
  }

  export type ConnectionId = {
    connectionId: string;
  };

  export type EventHandler<T> = (ws: Ws.WebSocket, payload: T) => Promise<void>;

  export type RedisKeyOptions = {
    user?: {
      id: string;
      count?: boolean;
    };
    sessionId?: string;
  };

  export type ServerHandshakePayload = {
    serverTag: string;
    services: string[];
    connectionId: string;
  };

  export type ClientHandshakePayload = {
    localization?: string;
    clientTag?: string;
    applicationName?: string;
    deviceId?: string;
  };

  export type ClientAuthenticatePayload = {
    accessToken: string;
  };

  export type ClientSessionToSessionPayload<
    T extends UnknownObject = UnknownObject
  > = {
    event: string;
    token: string;
    userId: string;
    payload: T;
  };

  export type ReSendPayload = {
    type: NSessionService.ServerEvent;
    eventName: string;
    payload: UnknownObject;
  };

  export type Listener = {
    isPrivateUser: boolean;
    isPrivateOrganization: boolean;
    listener: (
      agent: Agents,
      context: Context
    ) => Promise<void | ReSendPayload>;
  };

  export type Agents = {
    integrationAgent: IIntegrationAgent;
  };

  export type Context = {};

  export type EventPayload<E extends ClientEvent = ClientEvent> =
    E extends ClientEvent.HANDSHAKE
      ? ClientHandshakePayload
      : E extends ClientEvent.AUTHENTICATE
      ? ClientAuthenticatePayload
      : E extends ClientEvent.UPLOAD_PAGE
      ? string
      : E extends ClientEvent.SESSION_TO_SESSION
      ? ClientSessionToSessionPayload
      : E extends ClientEvent.BROADCAST_TO_SERVICE
      ? string
      : never;

  export type EventRoutine<E extends ClientEvent = ClientEvent> = EventHandler<
    EventPayload<E>
  >;

  export type EventRoutines<K extends ClientEvent = ClientEvent> = {
    [key in K]: EventRoutine<key>;
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

  export type ConnectionStorage = Map<string, Connection>;
}

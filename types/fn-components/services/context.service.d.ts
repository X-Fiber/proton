import type { AsyncHooks, Ws } from "../../packages";
import type { IAbstractService } from "./abstract.service";
import type { NSchemeService } from "./schema.service";

export interface IContextService extends IAbstractService {
  readonly storage: AsyncHooks.AsyncLocalStorage<NContextService.Store>;
  readonly store: NContextService.Store;
  exit(callback?: () => void): void;
}

export namespace NContextService {
  interface BaseStore {
    requestId: string;
    sessionId?: string;
    userId?: string;
    service: string;
    domain: string;
    schema: NSchemeService.BusinessScheme;
    version: string;
    language: string;
  }

  export interface RouteStore extends BaseStore {
    path: string;
    ip: string;
    action: string;
    method: string;
    language: string;
  }

  export interface EventStore extends BaseStore {
    path: string;
    event: string;
    type: string;
    socket: Ws.WebSocket;
  }

  export interface TopicStore extends BaseStore {
    queue: string;
  }

  export type Store = RouteStore | EventStore | TopicStore;
}

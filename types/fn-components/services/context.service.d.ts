import { AsyncHooks } from "../../packages";
import { IAbstractService } from "./abstract.service";
import { NSchemaService } from "./schema.service";

export interface IContextService extends IAbstractService {
  readonly storage: AsyncHooks.AsyncLocalStorage<
    NContextService.RouteStore | NContextService.EventStore
  >;
  readonly store: NContextService.Store;
  exit(callback?: () => void): void;
}

export namespace NContextService {
  interface BaseStore {
    requestId: string;
    sessionId?: string;
    userId?: string;
    path: string;
    service: string;
    domain: string;
    schema: NSchemaService.BusinessScheme;
    version: string;
    language: string;
  }

  export interface RouteStore extends BaseStore {
    ip: string;
    action: string;
    method: string;
  }

  export interface EventStore extends BaseStore {
    event: string;
    type: string;
  }

  export type Store = RouteStore | EventStore;
}

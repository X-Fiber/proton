import { AsyncHooks } from "../../packages";
import { IAbstractService } from "./abstract.service";
import { NSchemaService } from "./schema.service";

export interface IContextService extends IAbstractService {
  readonly storage: AsyncHooks.AsyncLocalStorage<NContextService.Store>;
  readonly store: NContextService.Store;
  exit(callback?: () => void): void;
}

export namespace NContextService {
  export type Store = {
    requestId: string;
    sessionId?: string;
    userId?: string;
    ip: string;
    path: string;
    service: string;
    domain: string;
    action: string;
    method: string;
    schema: NSchemaService.BusinessScheme;
    language: string;
  };
}

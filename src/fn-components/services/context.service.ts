import { injectable, inject, async_hooks } from "~packages";
import { CoreSymbols } from "~symbols";
import { AbstractService } from "./abstract.service";

import type {
  AsyncHooks,
  IDiscoveryService,
  ILoggerService,
  IContextService,
  NContextService,
} from "~types";

@injectable()
export class ContextService extends AbstractService implements IContextService {
  protected readonly _SERVICE_NAME = ContextService.name;
  protected _STORAGE:
    | AsyncHooks.AsyncLocalStorage<NContextService.RouteStore>
    | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService
  ) {
    super();
  }

  protected async init(): Promise<boolean> {
    this._STORAGE =
      new async_hooks.AsyncLocalStorage<NContextService.RouteStore>();

    return true;
  }

  public get storage(): AsyncHooks.AsyncLocalStorage<NContextService.RouteStore> {
    if (!this._STORAGE) {
      throw new Error("Storage not initialize");
    }
    return this._STORAGE;
  }

  public get store(): NContextService.RouteStore {
    const store = this.storage.getStore();
    if (!store) {
      throw new Error("Async local store not found");
    }
    return store;
  }

  public exit(callback?: () => void): void {
    return this.storage.exit(() => {
      if (callback) callback();
    });
  }

  protected async destroy(): Promise<void> {
    if (this._STORAGE) {
      this._STORAGE.exit(() => {});
      this._STORAGE = undefined;
    }
  }
}

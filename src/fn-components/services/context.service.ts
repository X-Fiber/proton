import { injectable, inject, async_hooks } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { ErrorCodes } from "~common";

import { AbstractService } from "./abstract.service";

import type {
  AsyncHooks,
  IDiscoveryService,
  ILoggerService,
  IContextService,
  NContextService,
  ILifecycleService,
  IExceptionProvider,
} from "~types";

@injectable()
export class ContextService extends AbstractService implements IContextService {
  protected readonly _SERVICE_NAME = ContextService.name;
  protected _STORAGE:
    | AsyncHooks.AsyncLocalStorage<NContextService.RouteStore>
    | undefined;

  constructor(
    @inject(CoreSymbols.LifecycleService)
    protected readonly _lifecycleService: ILifecycleService,
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService
  ) {
    super();
  }

  protected async init(): Promise<boolean> {
    try {
      this._STORAGE =
        new async_hooks.AsyncLocalStorage<NContextService.RouteStore>();

      this._lifecycleService.emit("ContextService:init");
      return true;
    } catch (e) {
      throw this._catchError(e, "Init");
    }
  }

  protected async destroy(): Promise<void> {
    if (this._STORAGE) {
      this._STORAGE.exit(() => {});
      this._STORAGE = undefined;
    }

    this._lifecycleService.emit("ContextService:destroy");
  }

  public get storage(): AsyncHooks.AsyncLocalStorage<NContextService.RouteStore> {
    if (!this._STORAGE) {
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError("Async local storage not initialize.", {
          code: ErrorCodes.fn.ContextService.NOT_INIT,
          tag: "Execution",
          namespace: this._SERVICE_NAME,
          errorType: "FATAL",
        });
    }

    return this._STORAGE;
  }

  public get store(): NContextService.RouteStore {
    const store = this.storage.getStore();
    if (!store) {
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError("Async local store not found.", {
          code: ErrorCodes.fn.ContextService.NOT_INIT,
          tag: "Execution",
          namespace: this._SERVICE_NAME,
          errorType: "FATAL",
        });
    }
    return store;
  }

  public exit(callback?: () => void): void {
    return this.storage.exit(() => {
      if (callback) callback();
    });
  }
}

import { injectable, inject, joi, typeorm } from "~packages";
import { CoreSymbols } from "~symbols";
import { ErrorCodes, SCHEMA_SERVICES } from "~common";
import { container } from "~container";
import { Guards } from "~utils";

import { AbstractService } from "./abstract.service";

import {
  Typeorm,
  FnObject,
  AnyObject,
  AnyFunction,
  ExtendedRecordObject,
  IMongoTunnel,
  ITypeormTunnel,
  IContextService,
  IIntegrationAgent,
  IFunctionalityAgent,
  ISchemeAgent,
  NSchemaAgent,
  ILoggerService,
  ISchemeLoader,
  NSchemaLoader,
  ISchemeService,
  NSchemeService,
  IDiscoveryService,
  NAbstractService,
  ILifecycleService,
  IExceptionProvider,
  ICoreError,
  NContextService,
} from "~types";

@injectable()
export class SchemeService extends AbstractService implements ISchemeService {
  protected readonly _SERVICE_NAME = SchemeService.name;
  private _SCHEMA: NSchemeService.BusinessScheme | undefined;

  constructor(
    @inject(CoreSymbols.LifecycleService)
    protected readonly _lifecycleService: ILifecycleService,
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.SchemaLoader)
    private readonly _schemaLoader: ISchemeLoader,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {
    super();
  }

  protected async init(): Promise<boolean> {
    try {
      await this._runWorker();

      this._lifecycleService.emit("SchemaService:init");

      return true;
    } catch (e) {
      throw this._catchError(e, "Init");
    }
  }

  protected async destroy(): Promise<void> {
    try {
      this._schemaLoader.destroy();
      this._emitter.removeAllListeners();

      this._lifecycleService.emit("SchemaService:destroy");
    } catch (e) {
      this._catchError(e, "Destroy");
    }
  }

  private async _runWorker(): Promise<void> {
    try {
      this._schemaLoader.init();
      this._schemaLoader.setBusinessLogic(this._schemaServices);

      this._SCHEMA = this._schemaLoader.services;

      this._lifecycleService.emit("SchemaService:load");
    } catch (e) {
      this._catchError(e, "Execution");
    }
  }

  public on(
    event: NSchemeService.Events,
    listener: NAbstractService.Listener
  ): void {
    this._emitter.on(event, listener);
  }

  public get typeormSchemas(): NSchemeService.TypeormEntities {
    const entities: NSchemeService.TypeormEntities = new Map<
      string,
      Typeorm.EntitySchema<unknown>
    >();
    this.schema.forEach((domains) => {
      domains.forEach((storage) => {
        if (storage.typeorm) {
          const agents: NSchemeService.Agents = {
            fnAgent: container.get<IFunctionalityAgent>(
              CoreSymbols.FunctionalityAgent
            ),
            schemaAgent: container.get<ISchemeAgent>(CoreSymbols.SchemaAgent),
            inAgent: container.get<IIntegrationAgent>(
              CoreSymbols.IntegrationAgent
            ),
          };

          const entity = new typeorm.EntitySchema<unknown>(
            storage.typeorm.schema(agents)
          );
          entities.set(storage.typeorm.name, entity);
        }
      });
    });

    return entities;
  }

  private get _schemaServices(): NSchemaLoader.ServiceStructure[] {
    if (!SCHEMA_SERVICES || SCHEMA_SERVICES.length === 0) {
      throw this._callException(
        "Schema services array is empty.",
        ErrorCodes.fn.SchemaService.EMPTY_SERVICES
      );
    }

    return SCHEMA_SERVICES;
  }

  public get schema(): NSchemeService.BusinessScheme {
    if (!this._SCHEMA) {
      throw this._callException(
        "Schema services collection not initialize.",
        ErrorCodes.fn.SchemaService.COLLECTION_NOT_INIT
      );
    }

    return this._SCHEMA;
  }

  public getAnotherMongoRepository<T>(name: string): T {
    const domain = this._getDomain(this._contextService.store, name);

    const mongoRepo = domain.mongo && domain.mongo.repository;
    if (!mongoRepo) {
      throw this._callException(
        `MongoDB repository "${domain.mongo}" in domain "${name}" in service "${this._contextService.store.service}" not found.`,
        ErrorCodes.fn.SchemaService.MONGO_REPO_NOT_FOUND
      );
    }

    class Repository {
      private readonly _handlers: Map<string, AnyFunction>;

      constructor(handlers: Map<string, AnyFunction>) {
        this._handlers = handlers;

        for (const [name] of this._handlers) {
          Object.defineProperty(this, name, {
            value: async (...args: any[]) => this._runMethod(name, ...args),
            writable: true,
            configurable: true,
          });
        }
      }

      private _runMethod(method: string, ...args: any[]): any {
        const handler = this._handlers.get(method);

        try {
          return handler
            ? handler(
                container
                  .get<IMongoTunnel>(CoreSymbols.MongoTunnel)
                  .getRepository(),
                ...args
              )
            : undefined;
        } catch (e) {
          throw container
            .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
            .throwError(e, {
              namespace: "SchemaService",
              tag: "Execution",
              code: ErrorCodes.fn.CATCH_ERROR,
              errorType: "FATAL",
            });
        }
      }
    }

    return new Repository(mongoRepo) as T;
  }

  public getMongoRepository<T extends FnObject = FnObject>(): T {
    return this.getAnotherMongoRepository<T>(this._contextService.store.domain);
  }

  public getAnotherValidator<T extends Record<string, AnyObject>>(
    name: string
  ): NSchemeService.ValidatorStructure<T> {
    const domain = this._getDomain(this._contextService.store, name);

    const validators = domain.validator;
    if (!validators) {
      throw this._callException(
        `Validator structure in domain "${name}" in service "${this._contextService.store.service}" not set to service collection.`,
        ErrorCodes.fn.SchemaService.MONGO_REPO_NOT_FOUND
      );
    }

    class Validator {
      private readonly _handlers: Map<string, NSchemeService.ValidatorHandler>;

      constructor(handlers: Map<string, NSchemeService.ValidatorHandler>) {
        this._handlers = handlers;

        for (const [name] of this._handlers) {
          Object.defineProperty(this, name, {
            value: (args: any) => this._runMethod(name, args),
            writable: true,
            configurable: true,
          });
        }
      }

      private _runMethod(name: string, args: any[]): any {
        const handler = this._handlers.get(name);

        const schemaAgent = container.get<ISchemeAgent>(
          CoreSymbols.SchemaAgent
        );

        const localization: NSchemaAgent.Localization = {
          getResource: schemaAgent.getResource,
          getAnotherResource: schemaAgent.getAnotherResource,
        };

        try {
          return handler ? handler(joi.joi, localization, args) : undefined;
        } catch (e) {
          throw container
            .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
            .throwError(e, {
              namespace: "SchemaService",
              tag: "Execution",
              code: ErrorCodes.fn.CATCH_ERROR,
              errorType: "FATAL",
            });
        }
      }
    }

    return new Validator(
      validators
    ) as unknown as NSchemeService.ValidatorStructure<T>;
  }

  public getValidator<
    T extends Record<string, AnyObject>
  >(): NSchemeService.ValidatorStructure<T> {
    return this.getAnotherValidator<T>(this._contextService.store.domain);
  }

  public getAnotherTypeormRepository<T>(name: string): T {
    const store = this._contextService.store;

    const service = store.schema.get(store.service);
    if (!service) {
      throw new Error("Service not found");
    }
    const domain = service.get(name);
    if (!domain) {
      throw new Error("Domain not found");
    }

    const handlers = domain.typeorm && domain.typeorm.repository;
    if (!handlers) {
      throw new Error("Typeorm repository handlers not found");
    }

    class Repository {
      private readonly _handlers: Map<string, AnyFunction>;

      constructor(handlers: Map<string, AnyFunction>) {
        this._handlers = handlers;

        for (const [name] of this._handlers) {
          Object.defineProperty(this, name, {
            value: (...args: any[]) => this._runMethod(name, ...args),
            writable: true,
            configurable: true,
          });
        }
      }

      private _runMethod(method: string, ...args: any[]): any {
        const handler = this._handlers.get(method);
        if (handler && domain && domain.typeorm) {
          const agents: NSchemeService.Agents = {
            fnAgent: container.get<IFunctionalityAgent>(
              CoreSymbols.FunctionalityAgent
            ),
            schemaAgent: container.get<ISchemeAgent>(CoreSymbols.SchemaAgent),
            inAgent: container.get<IIntegrationAgent>(
              CoreSymbols.IntegrationAgent
            ),
          };

          const validator = container
            .get<ITypeormTunnel>(CoreSymbols.TypeormTunnel)
            .getRepository(domain.typeorm.name);
          return handler(validator, agents, ...args);
        }
      }
    }

    return new Repository(handlers) as T;
  }

  public getTypeormRepository<T>(): T {
    return this.getAnotherTypeormRepository<T>(
      this._contextService.store.domain
    );
  }

  public getAnotherResource(
    name: string,
    resource: string,
    substitutions?: Record<string, string>,
    language?: string
  ): string {
    const store = this._contextService.store;

    const service = store.schema.get(store.service);
    if (!service) {
      throw new Error(`Service "${service}" not found`);
    }
    const domain = service.get(name);
    if (!domain) {
      throw new Error(`Domain "${domain}" not found`);
    }

    const dictionaries = domain.dictionaries;
    if (!dictionaries) {
      throw new Error(`Dictionaries not found`);
    }

    let dictionary: ExtendedRecordObject;
    if (language) {
      dictionary = dictionaries.get(language);
    } else {
      dictionary = dictionaries.get(store.language);
    }

    const resources = resource.split(".");
    let record: ExtendedRecordObject = dictionary;

    if (resources.length > 1) {
      for (const key of resources) {
        if (!Guards.isString(record)) {
          record = record[key];

          if (typeof record === "undefined") {
            // TODO: implement localization error
            throw new Error("Resource not found");
          }
        } else {
          return record;
        }
      }
      if (substitutions) {
        for (const substitution in substitutions) {
          record = record.replace(
            "{{" + substitution + "}}",
            substitutions[substitution]
          );
        }
      }
    } else {
      return record;
    }

    return record;
  }

  private _getDomain(
    store: NContextService.Store,
    domain: string
  ): NSchemeService.Domain {
    const sStorage = store.schema.get(store.service);
    if (!sStorage) {
      throw this._callException(
        `Service "${store.service}" not found.`,
        ErrorCodes.fn.SchemaService.SERVICE_NOT_FOUND
      );
    }
    const dStorage = sStorage.get(domain);
    if (!dStorage) {
      throw this._callException(
        `Domain "${domain}" in service "${store.service}" not found.`,
        ErrorCodes.fn.SchemaService.DOMAIN_NOT_FOUND
      );
    }

    return dStorage;
  }

  public getResource(
    resource: string,
    substitutions?: Record<string, string>,
    language?: string
  ): string {
    const store = this._contextService.store;

    return this.getAnotherResource(
      store.domain,
      resource,
      substitutions,
      language
    );
  }

  private _callException(msg: string, code: string): ICoreError {
    return container
      .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
      .throwError(msg, {
        code: code,
        namespace: this._SERVICE_NAME,
        tag: "Execution",
        errorType: "FATAL",
      });
  }
}

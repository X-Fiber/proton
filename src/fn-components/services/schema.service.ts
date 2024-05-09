import { injectable, inject, joi, typeorm } from "~packages";
import { CoreSymbols } from "~symbols";
import { SCHEMA_SERVICES } from "~common";
import { container } from "~container";
import { Guards } from "~utils";

import { AbstractService } from "./abstract.service";

import {
  Typeorm,
  IDiscoveryService,
  ILoggerService,
  ISchemaLoader,
  NSchemaLoader,
  ISchemeService,
  NSchemaService,
  NAbstractService,
  IContextService,
  AnyFunction,
  IFunctionalityAgent,
  FnObject,
  ISchemaAgent,
  IIntegrationAgent,
  ITypeormTunnel,
  AnyObject,
  ExtendedRecordObject,
  NSchemaAgent,
  IMongoTunnel,
} from "~types";

@injectable()
export class SchemaService extends AbstractService implements ISchemeService {
  protected readonly _SERVICE_NAME = SchemaService.name;
  private _config: NSchemaService.Config | undefined;
  private _SCHEMA: NSchemaService.BusinessScheme | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.SchemaLoader)
    private readonly _schemaLoader: ISchemaLoader,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {
    super();
  }

  public get typeormSchemas(): NSchemaService.TypeormEntities {
    const entities: NSchemaService.TypeormEntities = new Map<
      string,
      Typeorm.EntitySchema<unknown>
    >();
    this.schema.forEach((domains) => {
      domains.forEach((storage, domain) => {
        if (storage.typeorm) {
          const agents: NSchemaService.Agents = {
            fnAgent: container.get<IFunctionalityAgent>(
              CoreSymbols.FunctionalityAgent
            ),
            schemaAgent: container.get<ISchemaAgent>(CoreSymbols.SchemaAgent),
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

  protected async init(): Promise<boolean> {
    try {
      await this._runWorker();

      return true;
    } catch (e) {
      this._loggerService.error(e, {
        namespace: this._SERVICE_NAME,
        scope: "Core",
        tag: "Init",
        errorType: "FATAL",
      });
      return false;
    } finally {
      this._emitter.emit(`services:${this._SERVICE_NAME}:schemas-init`);
    }
  }

  public on(
    event: NSchemaService.Events,
    listener: NAbstractService.Listener
  ): void {
    this._emitter.on(event, listener);
  }

  private get _schemaServices(): NSchemaLoader.ServiceStructure[] {
    if (!SCHEMA_SERVICES || SCHEMA_SERVICES.length === 0) {
      throw new Error("Schema service array is empty");
    }

    return SCHEMA_SERVICES;
  }

  private async _runWorker(): Promise<void> {
    try {
      this._schemaLoader.init();
      this._schemaLoader.setBusinessLogic(this._schemaServices);

      this._SCHEMA = this._schemaLoader.services;
    } catch (e) {
      throw e;
    }
  }

  protected async destroy(): Promise<void> {
    this._config = undefined;

    this._schemaLoader.destroy();

    this._emitter.removeAllListeners();
  }

  public get schema(): NSchemaService.BusinessScheme {
    if (!this._SCHEMA) {
      throw new Error("Services collection not initialize.");
    }
    return this._SCHEMA;
  }

  public getAnotherMongoRepository<T>(name: string): T {
    const store = this._contextService.store;

    const service = store.schema.get(store.service);
    if (!service) {
      throw new Error("Service not found");
    }
    const domain = service.get(name);
    if (!domain) {
      throw new Error("Domain not found");
    }

    const mongoRepository = domain.mongo && domain.mongo.repository;
    if (!mongoRepository) {
      throw new Error("Mongo repository not found");
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

        return handler
          ? handler(
              container
                .get<IMongoTunnel>(CoreSymbols.MongoTunnel)
                .getRepository(),
              ...args
            )
          : undefined;
      }
    }

    return new Repository(mongoRepository) as T;
  }

  public getMongoRepository<T extends FnObject = FnObject>(): T {
    return this.getAnotherMongoRepository<T>(this._contextService.store.domain);
  }

  public getAnotherValidator<T extends Record<string, AnyObject>>(
    name: string
  ): NSchemaService.ValidatorStructure<T> {
    const store = this._contextService.store;

    const service = store.schema.get(store.service);
    if (!service) {
      throw new Error("Service not found");
    }
    const domain = service.get(name);
    if (!domain) {
      throw new Error("Domain not found");
    }

    const validators = domain.validator;
    if (!validators) {
      throw new Error("Validator not found");
    }

    class Validator {
      private readonly _handlers: Map<string, NSchemaService.ValidatorHandler>;

      constructor(handlers: Map<string, NSchemaService.ValidatorHandler>) {
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

        const schemaAgent = container.get<ISchemaAgent>(
          CoreSymbols.SchemaAgent
        );

        const localization: NSchemaAgent.Localization = {
          getDictionary: "",
          getAnotherDictionary: "",
          getResource: schemaAgent.getResource,
          getAnotherResource: schemaAgent.getAnotherResource,
        };

        return handler ? handler(joi.joi, localization, args) : undefined;
      }
    }

    return new Validator(
      validators
    ) as unknown as NSchemaService.ValidatorStructure<T>;
  }

  public getValidator<
    T extends Record<string, AnyObject>
  >(): NSchemaService.ValidatorStructure<T> {
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
          const agents: NSchemaService.Agents = {
            fnAgent: container.get<IFunctionalityAgent>(
              CoreSymbols.FunctionalityAgent
            ),
            schemaAgent: container.get<ISchemaAgent>(CoreSymbols.SchemaAgent),
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
}

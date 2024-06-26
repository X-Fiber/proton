import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { Helpers } from "~utils";

import type {
  AnyFn,
  HttpMethod,
  ExtendedRecordObject,
  ISchemeLoader,
  NSchemaLoader,
  NSchemeService,
  NRabbitMQConnector,
  ILoggerService,
} from "~types";

@injectable()
export class SchemeLoader implements ISchemeLoader {
  private _SCHEME: NSchemeService.BusinessScheme | undefined;
  private _DOMAINS: NSchemeService.Service | undefined;

  constructor(
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService
  ) {}

  public async init(): Promise<void> {
    this._SCHEME = new Map<string, NSchemeService.Service>();
    this._DOMAINS = new Map<string, NSchemeService.Domain>();
  }

  public get services(): NSchemeService.BusinessScheme {
    if (!this._SCHEME) {
      throw new Error("Services map not initialize");
    }

    return this._SCHEME;
  }

  public async destroy(): Promise<void> {
    this._DOMAINS = undefined;
    this._SCHEME = undefined;
  }

  private get _domains(): NSchemeService.Service {
    if (!this._DOMAINS) {
      throw new Error("Domains map not initialize");
    }

    return this._DOMAINS;
  }

  public setBusinessLogic(services: NSchemaLoader.ServiceStructure[]): void {
    services.forEach((service) => {
      service.domains.forEach((domain) => {
        const name = domain.domain;
        const { documents } = domain;

        this._setDomain(name);
        if (documents.router) {
          this._setRoute(service.service, name, documents.router);
        }

        if (documents.emitter) {
          this._setEmitter(service.service, name, documents.emitter);
        }
        if (documents.broker) {
          this._setBroker(service.service, name, documents.broker);
        }
        if (documents.streamer) {
          this._setStreamer(service.service, name, documents.streamer);
        }
        if (documents.helper) {
          this._setHelper(name, documents.helper);
        }
        if (documents.dictionaries) {
          this._setDictionaries(name, documents.dictionaries);
        }
        if (documents.validator) {
          this._setValidator(name, documents.validator);
        }
        if (documents.typeorm) {
          this._setTypeormSchema(
            name,
            documents.typeorm.name,
            documents.typeorm.schema
          );

          if (documents.typeorm.repository) {
            this._setTypeormRepository(
              name,
              documents.typeorm.name,
              documents.typeorm.schema,
              documents.typeorm.repository
            );
          }
        }
        if (documents.mongo) {
          this._setMongoSchema(
            name,
            documents.mongo.name,
            documents.mongo.model
          );

          if (documents.mongo.repository) {
            this._setMongoRepository(
              name,
              documents.mongo.name,
              documents.mongo.model,
              documents.mongo.repository
            );
          }
        }

        this._applyDomainToService(service.service, domain.domain);
      });
    });
  }

  private _setRoute(
    service: string,
    domain: string,
    structure: NSchemaLoader.RouterStructure
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setRoute(service, domain, structure);
      return;
    }

    for (const path in structure) {
      if (path.includes("/")) {
        throw new Error(
          `X-Fiber system not supported dots '/'. Please use slag string path for '${path}' path in '${domain}' domain in '${service}' service.`
        );
      }

      if (path.includes(".")) {
        throw new Error(
          `X-Fiber system not supported dots '.'. Please use slag string path for '${path}' path in '${domain}' domain in '${service}' service.`
        );
      }

      const methods = structure[path];
      for (const m in methods) {
        const method = m as HttpMethod;

        const route = methods[method];
        if (route) {
          const version = route.version ?? "v1";

          const name = Helpers.getRouteUniqueName(method, version, path);

          if (storage.routes.has(name)) {
            throw new Error(
              `Route '${name}' has been exists in '${domain}' domain in '${service}' service.`
            );
          }

          this._loggerService.schema(
            `Route '${name}' in '${domain}' domain in '${service}' service has been registration.`,
            { namespace: "Router", scope: "Core" }
          );

          storage.routes.set(name, {
            path: path,
            method: method,
            handler: route.handler,
            scope: route.scope ?? "public:route",
            params: route.params ?? null,
            headers: route.headers ?? null,
            queries: route.queries ?? null,
            version: version,
          });
        }
      }
    }
  }

  private _setStreamer(
    service: string,
    domain: string,
    structure: NSchemaLoader.StreamerStructure
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setStreamer(service, domain, structure);
      return;
    }

    for (const path in structure) {
      if (path.includes("/")) {
        throw new Error(
          `X-Fiber system not supported dots '/'. Please use slag string path for '${path}' path in '${domain}' domain in '${service}' service.`
        );
      }

      if (path.includes(".")) {
        throw new Error(
          `X-Fiber system not supported dots '.'. Please use slag string path for '${path}' path in '${domain}' domain in '${service}' service.`
        );
      }

      const stream = structure[path];
      const version = stream.version ?? "v1";

      const name = Helpers.getStreamUniqueName(version, path);

      if (storage.streams.has(name)) {
        throw new Error(
          `Route '${name}' has been exists in '${domain}' domain in '${service}' service.`
        );
      }

      this._loggerService.schema(
        `Route '${name}' in '${domain}' domain in '${service}' service has been registration.`,
        { namespace: "Streamer", scope: "Core" }
      );

      storage.streams.set(name, {
        path: path,
        handler: stream.handler,
        scope: stream.scope ?? "public:route",
        params: stream.params ?? null,
        headers: stream.headers ?? null,
        queries: stream.queries ?? null,
        limits: stream.limits ?? null,
        version: version,
      });
    }
  }

  private _setEmitter(
    service: string,
    domain: string,
    structure: NSchemaLoader.EmitterStructure
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setEmitter(service, domain, structure);
      return;
    }

    for (const path in structure) {
      if (path.includes("/")) {
        throw new Error(
          `X-Fiber system not supported dots '/'. Please use slag string path for '${path}' event in '${domain}' domain in '${service}' service.`
        );
      }

      if (path.includes(".")) {
        throw new Error(
          `X-Fiber system not supported dots '.'. Please use slag string path for '${path}' event in '${domain}' domain in '${service}' service.`
        );
      }

      const kinds = structure[path];
      for (const k in kinds) {
        const kind = k as NSchemeService.EventKind;

        const event = kinds[kind];
        if (event) {
          const version = event.version ?? "v1";

          const name = Helpers.getEventUniqueName(kind, version, path);

          if (storage.events.has(name)) {
            throw new Error(
              `Event '${name}' has been exists in '${domain}' domain in '${service}' service.`
            );
          }

          this._loggerService.schema(
            `Event '${name}' in '${domain}' domain in '${service}' service has been registration.`,
            { namespace: "Emitter", scope: "Core" }
          );

          storage.events.set(name, {
            kind: kind,
            event: path,
            version: version,
            scope: event.scope ?? "public:route",
            handler: event.handler,
          });
        }
      }
    }
  }

  private _setBroker(
    service: string,
    domain: string,
    structure: NSchemaLoader.BrokerStructure
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setBroker(service, domain, structure);
      return;
    }

    for (const name in structure) {
      const topic = structure[name];
      const key = `${service}.${domain}.${topic.version}.${name}`;
      storage.broker.set(key, topic);
    }
  }

  private _setHelper(
    domain: string,
    structure: NSchemaLoader.HelperStructure
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setHelper(domain, structure);
      return;
    }

    for (const name in structure) {
      const handler = structure[name];
      storage.helper.set(name, handler);
    }
  }

  private _setDictionaries(
    domain: string,
    dictionaries:
      | NSchemaLoader.DictionaryStructure
      | NSchemaLoader.DictionaryStructure[]
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setDictionaries(domain, dictionaries);
      return;
    }

    if (Array.isArray(dictionaries)) {
      dictionaries.forEach((dict) => {
        if (Array.isArray(dict.language)) {
          dict.language.forEach((ln) => {
            storage.dictionaries.set(ln, dict.dictionary);
          });
        } else {
          storage.dictionaries.set(dict.language, dict.dictionary);
        }
      });
    } else {
      if (Array.isArray(dictionaries.language)) {
        dictionaries.language.forEach((ln) => {
          storage.dictionaries.set(ln, dictionaries.dictionary);
        });
      } else {
        storage.dictionaries.set(
          dictionaries.language,
          dictionaries.dictionary
        );
      }
    }
  }

  private _setValidator(
    domain: string,
    structure: NSchemeService.ValidatorStructure
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setValidator(domain, structure);
      return;
    }

    for (const handler in structure) {
      const validator = structure[handler];
      storage.validator.set(handler, validator);
    }
  }

  private _setMongoSchema<T>(
    domain: string,
    name: string,
    schema: NSchemeService.MongoSchema
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setMongoSchema<T>(domain, name, schema);
      return;
    }

    if (!storage.mongo) {
      storage.mongo = {
        name: name,
        schema: schema,
        repository: new Map<string, NSchemeService.MongoHandler>(),
      };
    } else {
      storage.mongo.schema = schema;
    }
  }

  private _setMongoRepository<T extends string = string>(
    domain: string,
    name: string,
    schema: NSchemeService.MongoSchema,
    repository: NSchemaLoader.MongoRepositoryStructure
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setMongoRepository<T>(domain, name, schema, repository);
      return;
    }

    if (!storage.mongo) {
      storage.mongo = {
        name: name,
        schema: schema,
        repository: new Map<string, NSchemeService.MongoHandler>(),
      };
    }

    for (const name in repository) {
      const handler = repository[name];
      storage.mongo.repository.set(name, handler);
    }
  }

  private _setTypeormSchema<T>(
    domain: string,
    name: string,
    schema: NSchemeService.TypeormSchema
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setTypeormSchema<T>(domain, name, schema);
      return;
    }

    if (!storage.typeorm) {
      storage.typeorm = {
        name: name,
        schema: schema,
        repository: new Map<string, NSchemeService.TypeormHandler>(),
      };
    } else {
      storage.typeorm.schema = schema;
    }
  }

  private _setTypeormRepository<T extends string = string>(
    domain: string,
    name: string,
    schema: NSchemeService.TypeormSchema,
    repository: NSchemaLoader.TypeormRepositoryStructure
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setTypeormRepository<T>(domain, name, schema, repository);
      return;
    }

    if (!storage.typeorm) {
      storage.typeorm = {
        name: name,
        schema: schema,
        repository: new Map<string, NSchemeService.TypeormHandler>(),
      };
    }

    for (const name in repository) {
      const handler = repository[name];
      storage.typeorm.repository.set(name, handler);
    }
  }

  private _applyDomainToService(service: string, domain: string): void {
    const sStorage = this.services.get(service);
    if (!sStorage) {
      this.services.set(service, new Map<string, NSchemeService.Domain>());
      this._applyDomainToService(service, domain);
      return;
    }

    const dStorage = this._domains.get(domain);
    if (!dStorage) {
      throw new Error(`Domain ${domain} not found`);
    }

    sStorage.set(domain, dStorage);
  }

  private _setDomain(domain: string): void {
    this._domains.set(domain, {
      routes: new Map<string, NSchemeService.Route>(),
      events: new Map<string, NSchemeService.Event>(),
      broker: new Map<string, NRabbitMQConnector.Topic>(),
      streams: new Map<string, NSchemeService.Stream>(),
      helper: new Map<string, AnyFn>(),
      dictionaries: new Map<string, ExtendedRecordObject>(),
      validator: new Map<string, NSchemeService.ValidatorHandler>(),
    });
  }
}

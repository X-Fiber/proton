import { injectable } from "~packages";

import {
  AnyFn,
  HttpMethod,
  ExtendedRecordObject,
  ISchemaLoader,
  NSchemaLoader,
  NSchemaService,
} from "~types";

@injectable()
export class SchemaLoader implements ISchemaLoader {
  private _SCHEME: NSchemaService.BusinessScheme | undefined;
  private _DOMAINS: NSchemaService.Service | undefined;

  public async init(): Promise<void> {
    this._SCHEME = new Map<string, NSchemaService.Service>();
    this._DOMAINS = new Map<string, NSchemaService.Domain>();
  }

  public get services(): NSchemaService.BusinessScheme {
    if (!this._SCHEME) {
      throw new Error("Services map not initialize");
    }

    return this._SCHEME;
  }

  public async destroy(): Promise<void> {
    this._DOMAINS = undefined;
    this._SCHEME = undefined;
  }

  private get _domains(): NSchemaService.Service {
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
          this._setRoute(name, documents.router);
        }
        if (documents.emitter) {
          this._setEmitter(name, documents.emitter);
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
            documents.mongo.schema
          );

          if (documents.mongo.repository) {
            this._setMongoRepository(
              name,
              documents.mongo.name,
              documents.mongo.schema,
              documents.mongo.repository
            );
          }
        }

        this._applyDomainToService(service.service, domain.domain);
      });
    });
  }

  private _setRoute(
    domain: string,
    structure: NSchemaLoader.RouterStructure
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setRoute(domain, structure);
      return;
    }

    for (const path in structure) {
      if (path.includes("/")) {
        throw new Error(
          'Endpoint name is not supported slash "/". Please use slag string path'
        );
      }

      if (path.includes(".")) {
        throw new Error(
          "Endpoint name is not supported dots '.'. Please use slag string path"
        );
      }

      const methods = structure[path];
      for (const m in methods) {
        const method = m as HttpMethod;

        const route = methods[method];
        if (route) {
          const version = route.version ?? "v1";
          const name = `${version}.${path}.${method.toUpperCase()}`;

          if (storage.routes.has(name)) {
            throw new Error(
              `Route "${path}" with http method "${method}" has been exists in domain "${domain}"`
            );
          }

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

  private _setEmitter(
    domain: string,
    structure: NSchemaLoader.EmitterStructure
  ): void {
    const storage = this._domains.get(domain);
    if (!storage) {
      this._setDomain(domain);
      this._setEmitter(domain, structure);
      return;
    }

    for (const path in structure) {
      if (path.includes("/")) {
        throw new Error(
          'Event name is not supported slash "/". Please use slag string path'
        );
      }

      if (path.includes(".")) {
        throw new Error(
          "Event name is not supported dots '.'. Please use slag string path"
        );
      }

      const kinds = structure[path];
      for (const k in kinds) {
        const kind = k as NSchemaService.EventKind;

        const event = kinds[kind];
        if (event) {
          const version = event.version ?? "v1";
          const name = `${version}.${event}.${kind}`;

          if (storage.events.has(name)) {
            throw new Error(
              `Event "${event}" with event kind "${kind}" has been exists in domain "${domain}"`
            );
          }

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
    structure: NSchemaService.ValidatorStructure
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
    schema: NSchemaService.MongoSchema
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
        repository: new Map<string, NSchemaService.MongoHandler>(),
      };
    } else {
      storage.mongo.schema = schema;
    }
  }

  private _setMongoRepository<T extends string = string>(
    domain: string,
    name: string,
    schema: NSchemaService.MongoSchema,
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
        repository: new Map<string, NSchemaService.MongoHandler>(),
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
    schema: NSchemaService.TypeormSchema
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
        repository: new Map<string, NSchemaService.TypeormHandler>(),
      };
    } else {
      storage.typeorm.schema = schema;
    }
  }

  private _setTypeormRepository<T extends string = string>(
    domain: string,
    name: string,
    schema: NSchemaService.TypeormSchema,
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
        repository: new Map<string, NSchemaService.TypeormHandler>(),
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
      this.services.set(service, new Map<string, NSchemaService.Domain>());
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
      routes: new Map<string, NSchemaService.Route>(),
      events: new Map<string, NSchemaService.Event>(),
      broker: new Map<string, NSchemaService.Topic>(),
      helper: new Map<string, AnyFn>(),
      dictionaries: new Map<string, ExtendedRecordObject>(),
      validator: new Map<string, NSchemaService.ValidatorHandler>(),
    });
  }
}

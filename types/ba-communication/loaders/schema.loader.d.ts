import type { Typeorm } from "../../packages";
import {
  AnyFn,
  HttpMethod,
  NMongoTunnel,
  NSchemeService,
  NStreamService,
  ExtendedRecordObject,
  NAbstractHttpAdapter,
  NAbstractFileStorageStrategy,
  NAbstractWsAdapter,
} from "../../fn-components";
import type { NRabbitMQConnector } from "../../connectors";

export interface ISchemeLoader {
  readonly services: NSchemeService.BusinessScheme;

  readonly init(): void;
  readonly destroy(): void;
  readonly setBusinessLogic(services: NSchemaLoader.ServiceStructure[]): void;
}

export namespace NSchemaLoader {
  export type RouterStructure<R extends string = string> = {
    [key in R]: {
      [key in HttpMethod]?: {
        scope?: NSchemeService.AuthScope;
        version?: NSchemeService.Version;
        params?: NSchemeService.RouteParams[];
        headers?: NSchemeService.HeaderParams[];
        queries?: NSchemeService.QueryParams[];
        handler: NAbstractHttpAdapter.ApiHandler;
      };
    };
  };

  export type StreamerStructure<R extends string = string> = {
    [key in R]: {
      scope?: NSchemeService.AuthScope;
      version?: NSchemeService.Version;
      params?: NSchemeService.RouteParams[];
      headers?: NSchemeService.HeaderParams[];
      queries?: NSchemeService.QueryParams[];
      limits?: NAbstractFileStorageStrategy.StreamLimits;
      handler: NAbstractHttpAdapter.StreamHandler;
    };
  };

  export type EmitterStructure<E extends string = string> = {
    [key in E]: {
      [key in NSchemeService.EventKind]?: {
        scope?: NSchemeService.AuthScope;
        version?: NSchemeService.Version;
        handler: NAbstractWsAdapter.Handler;
      };
    };
  };

  export type BrokerStructure<T extends string = string> = {
    [key in T]: NRabbitMQConnector.Topic;
  };

  export type DictionaryStructure<
    L extends string = string,
    D extends ExtendedRecordObject = ExtendedRecordObject
  > = {
    language: L | L[];
    dictionary: D;
  };

  export type HelperStructure<
    T extends Record<string, AnyFn> = Record<string, AnyFn>
  > = T;

  export type ValidatorStructure<
    T extends Record<string, any> = Record<string, any>
  > = {
    [K in keyof T]: T[K] extends infer I
      ? NSchemeService.ValidatorHandler<I>
      : T[K];
  };

  export type RepositoryHandler<ARGS = void, RESULT = void> = (
    args: ARGS
  ) => Promise<RESULT>;

  export type TypeormSchemaStructure<T> = (
    agent: NAbstractHttpAdapter.Agents
  ) => Typeorm.EntitySchemaOptions<T>;

  export type TypeormRepositoryStructure<
    S = any,
    T extends Record<string, RepositoryHandler> = Record<
      string,
      RepositoryHandler
    >
  > = {
    [K in keyof T]: T[K] extends (data: infer D, ...args: infer A) => infer R
      ? NSchemeService.TypeormHandler<S, D>
      : T[K];
  };

  export type MongoRepositoryStructure<
    S = any,
    T extends Record<string, RepositoryHandler> = Record<
      string,
      RepositoryHandler
    >
  > = {
    [K in keyof T]: T[K] extends (data: infer D, ...args: infer A) => infer R
      ? NSchemeService.MongoHandler<S, D>
      : T[K];
  };

  export type MongoSchemaStructure<T> = (
    agents: NSchemeService.Agents
  ) => NMongoTunnel.Schema<T>;

  export type DocumentsStructure = {
    router?: RouterStructure;
    emitter?: EmitterStructure;
    helper?: HelperStructure;
    broker?: BrokerStructure;
    streamer?: StreamerStructure;
    dictionaries?: DictionaryStructure | DictionaryStructure[];
    validator?: ValidatorStructure;
    typeorm?: {
      name: string;
      schema: NSchemeService.TypeormSchema;
      repository?: TypeormRepositoryStructure;
    };
    mongo?: {
      name: string;
      model: MongoSchemaStructure;
      repository?: MongoRepositoryStructure;
    };
  };

  export type DomainStructure<D extends string = string> = {
    domain: D;
    documents: DocumentsStructure;
  };

  export type ServiceStructure<S extends string = string> = {
    service: S;
    domains: DomainStructure[];
  };
}

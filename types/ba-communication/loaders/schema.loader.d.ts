import {
  AnyFn,
  ExtendedRecordObject,
  HttpMethod,
  NAbstractHttpAdapter,
  NSchemaService,
  NMongoProvider,
} from "../../fn-components";
import { Typeorm } from "../../packages";
import { Handler } from "../../fn-components/adapters/abstract.http-adapter";
export interface ISchemaLoader {
  readonly services: NSchemaService.BusinessScheme;

  readonly init(): void;
  readonly destroy(): void;
  readonly setBusinessLogic(services: NSchemaLoader.ServiceStructure[]): void;
}

export namespace NSchemaLoader {
  export type RouterStructure<R extends string = string> = {
    [key in R]: {
      [key in HttpMethod]?: {
        scope?: NSchemaService.AuthScope;
        version?: NSchemaService.Version;
        params?: NSchemaService.RouteParams[];
        headers?: NSchemaService.HeaderParams[];
        queries?: NSchemaService.QueryParams[];
        handler: NAbstractHttpAdapter.Handler;
      };
    };
  };

  export type EmitterStructure<E extends string = string> = {
    [key in E]: {
      [key in NSchemaService.EventKind]?: {
        scope?: NSchemaService.AuthScope;
        version?: NSchemaService.Version;
        handler: any;
      };
    };
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
      ? NSchemaService.ValidatorHandler<I>
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
      ? NSchemaService.TypeormHandler<S, D>
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
      ? NSchemaService.MongoHandler<S, D>
      : T[K];
  };

  export type MongoSchemaStructure<T> = (
    agents: NAbstractHttpAdapter.Agents
  ) => NMongoProvider.Schema<T>;

  export type DocumentsStructure = {
    router?: RouterStructure;
    emitter?: EmitterStructure;
    helper?: HelperStructure;
    dictionaries?: DictionaryStructure | DictionaryStructure[];
    validator?: ValidatorStructure;
    typeorm?: {
      name: string;
      schema: NSchemaService.TypeormSchema;
      repository?: TypeormRepositoryStructure;
    };
    mongo?: {
      name: string;
      schema: MongoSchemaStructure;
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

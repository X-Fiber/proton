import { Joi, RabbitMQ, Typeorm } from "../../packages";
import { IAbstractService } from "./abstract.service";
import { NMongoProvider } from "../tunnels";
import {
  IFunctionalityAgent,
  IIntegrationAgent,
  ISchemaAgent,
  NSchemaAgent,
} from "../../ba-communication";
import {
  AnyFn,
  AnyObject,
  HttpMethod,
  ExtendedRecordObject,
  FnObject,
} from "../utils";
import { NAbstractHttpAdapter, NAbstractWsAdapter } from "../adapters";
import { NContextService } from "./context.service";
import { NRabbitMQConnector } from "../../connectors";
import { NStreamService } from "./stream.service";

export interface ISchemeService extends IAbstractService {
  readonly schema: NSchemaService.BusinessScheme;

  getMongoRepository<T extends FnObject = FnObject>(): T;
  getAnotherMongoRepository<T extends FnObject = FnObject>(name: string): T;
  getValidator<
    T extends Record<string, AnyObject>
  >(): NSchemaService.ValidatorStructure<T>;
  getAnotherValidator<T extends Record<string, AnyObject>>(
    name: string
  ): NSchemaService.ValidatorStructure<T>;
  getTypeormRepository<T>(): T;
  getAnotherTypeormRepository<T>(name: string): T;
  getResource(
    resource: string,
    substitutions?: Record<string, string> | undefined | null,
    language?: string
  ): string;
  getAnotherResource(
    name: string,
    resource: string,
    substitutions?: Record<string, string> | undefined | null,
    language?: string
  ): string;

  readonly typeormSchemas: NSchemaService.TypeormEntities;

  on(event: NSchemaService.Events, listener: () => void): void;
}

export namespace NSchemaService {
  export type Config = {};

  export type Agents = {
    fnAgent: IFunctionalityAgent;
    schemaAgent: ISchemaAgent;
    inAgent: IIntegrationAgent;
  };

  export type Events =
    | `services:${ServiceName}:schemas-init`
    | `services:${ServiceName}:schemas-load`
    | `services:${ServiceName}:schemas-error`;

  export type EventKind = "session:to:session" | "session:to:service";
  export type AuthScope = "public:route" | "private:user" | "private:system";
  export type Version = "v1" | "v2" | "v3" | "v4" | "v5" | string;
  export type RouteParams = {
    name: string;
    scope: "required" | "optional";
  };
  export type HeaderParams = {
    name: string;
    scope: "required" | "optional";
  };

  export type QueryParameter =
    | "string"
    | "string[]"
    | "number"
    | "number[]"
    | "boolean"
    | "boolean[]";

  export type QueryParams = {
    name: string;
    format: QueryParameter[];
    scope: "required" | "optional";
  };

  export type Route = {
    path: string;
    method: HttpMethod;
    scope: AuthScope;
    version: Version;
    params: RouteParams[] | null;
    headers: HeaderParams[] | null;
    queries: QueryParams[] | null;
    handler: NAbstractHttpAdapter.ApiHandler;
  };

  export type Stream = {
    path: string;
    scope: AuthScope;
    version: Version;
    params: RouteParams[] | null;
    headers: HeaderParams[] | null;
    queries: QueryParams[] | null;
    limits: NStreamService.StreamLimits | null;
    handler: NAbstractHttpAdapter.StreamHandler;
  };

  export type Event = {
    event: string;
    kind: EventKind;
    scope: AuthScope;
    version: Version;
    handler: NAbstractWsAdapter.Handler;
  };

  export type TypeormEntities = Map<string, Typeorm.EntitySchema<unknown>>;

  export type ValidateErrors = Array<{
    message: string;
    key?: string;
    value?: string;
  }>;

  export type ValidatorHandler<I = any> = (
    provider: Joi.Root,
    localization: NSchemaAgent.Localization,
    data: I
  ) => ValidateErrors | void;

  export type ValidatorStructure<T extends AnyObject = AnyObject> = {
    [K in keyof T]: T[K] extends infer I ? ValidatorHandler<I> : T[K];
  };

  export type TypeormSchema<T = any> = (
    agent: Agents
  ) => Typeorm.EntitySchemaOptions<T>;

  export type TypeormHandler<S = any, D = any> = (
    provider: Typeorm.Repository<S>,
    agents: Agents,
    data: D
  ) => R;

  export type MongoSchema<T = any> = (
    agents: Agents
  ) => NMongoProvider.SchemaFn<T>;

  export type MongoHandler<S = any, D = any> = (
    provider: NMongoProvider.Repository<S>,
    agents: Agents,
    data: D
  ) => R;

  export type Domain = {
    routes: Map<string, Route>;
    events: Map<string, Event>;
    streams: Map<string, Stream>;
    helper: Map<string, AnyFn>;
    broker: Map<string, NRabbitMQConnector.Topic>;
    dictionaries: Map<string, ExtendedRecordObject>;
    validator: Map<string, ValidatorHandler>;
    typeorm?: {
      name: string;
      schema: TypeormSchema;
      repository: Map<string, TypeormHandler>;
    };
    mongo?: {
      name: string;
      schema: MongoSchema;
      repository: Map<string, MongoHandler>;
    };
  };

  export type Service = Map<string, Domain>;
  export type BusinessScheme = Map<string, Service>;
}

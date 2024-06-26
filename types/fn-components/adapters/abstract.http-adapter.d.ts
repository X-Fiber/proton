import type { Express, Fastify } from "../../packages";
import type { HttpMethod, ModeObject, StringObject } from "../utils";
import type { NAbstractFileStorageStrategy } from "../strategies";
import type {
  NContextService,
  NDiscoveryService,
  NSchemeService,
  NStreamService,
} from "../services";

export interface IAbstractHttpAdapter {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export namespace NAbstractHttpAdapter {
  export type ValidateMessage = {
    type: "FAIL";
    code: string;
    message: string;
  };

  type StorageSuccess = {
    type: "success";
    domain: NSchemeService.Domain;
  };

  type StorageFail = {
    type: "fail";
    message: NAbstractHttpAdapter.ValidateMessage;
  };

  type StorageResult = StorageSuccess | StorageFail;

  export type AdapterKind = "express" | "fastify";

  export type AdapterInstance<K extends AdapterKind> = K extends "express"
    ? Express.Instance
    : K extends "fastify"
    ? Fastify.Instance
    : never;

  export type AdapterRequest<K extends AdapterKind> = K extends "express"
    ? Express.Request
    : K extends "fastify"
    ? Fastify.Request
    : never;

  export type AdapterResponse<K extends AdapterKind> = K extends "express"
    ? Express.Response
    : K extends "fastify"
    ? Fastify.Response
    : never;

  export type Config = Pick<
    NDiscoveryService.CoreConfig["adapters"]["http"],
    "enable" | "kind" | "protocol" | "host" | "port" | "urls"
  > &
    Pick<NDiscoveryService.CoreConfig["adapters"], "serverTag">;

  export type ApiRequest<
    BODY = any,
    PARAMS extends StringObject = never,
    HEADERS extends StringObject = never,
    QUERIES extends ModeObject = never
  > = {
    url: string;
    path: string;
    method: HttpMethod;
    body: BODY;
    headers: HEADERS;
    params: PARAMS;
    queries: QUERIES;
  };

  export type StreamRequest<
    P extends StringObject = never,
    H extends StringObject = never,
    Q extends ModeObject = never
  > = {
    url: string;
    path: string;
    files: Map<string, NAbstractFileStorageStrategy.FileInfo>;
    headers: H;
    params: P;
    queries: Q;
  };

  export type ResponseFormat = "json" | "redirect" | "status";
  export type JsonFormatType = "ok" | "error" | "exception" | "validation";

  interface BaseResponse<HEADERS extends StringObject = never> {
    format: ResponseFormat;
    headers?: HEADERS;
    statusCode?: number;
  }

  interface JsonResponse<BODY = any, HEADERS extends StringObject = never>
    extends BaseResponse<HEADERS> {
    format: "json";
    type: JsonFormatType;
    data: BODY;
  }
  interface RedirectResponse<HEADERS extends StringObject = never>
    extends BaseResponse<HEADERS> {
    url: string;
  }

  export type Response<
    BODY = any,
    HEADERS extends StringObject = StringObject
  > =
    | BaseResponse<HEADERS>
    | JsonResponse<BODY, HEADERS>
    | RedirectResponse<HEADERS>;

  export type Context<
    USER_INFO = any,
    SYSTEM_INFO = any,
    AUTH_SCOPE extends NSchemeService.AuthScope = NSchemeService.AuthScope
  > = {
    store: NContextService.RouteStore;
  } & (AUTH_SCOPE extends "public:route"
    ? {}
    : AUTH_SCOPE extends "private:user"
    ? {
        user: USER_INFO;
      }
    : AUTH_SCOPE extends "private:system"
    ? {
        user: USER_INFO;
        system: SYSTEM_INFO;
      }
    : never);

  export type ApiHandler = (
    request: ApiRequest<any, any, any, any>,
    agents: NSchemeService.Agents,
    context: Context
  ) => Promise<Response<any, any, any> | void>;

  export type StreamHandler = (
    request: StreamRequest<any, any, any, any>,
    agents: NSchemeService.Agents,
    context: Context
  ) => Promise<Response<any, any, any> | void>;
}

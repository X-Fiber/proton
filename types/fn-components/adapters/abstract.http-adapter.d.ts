import { Express, Fastify } from "../../packages";
import { HttpMethod, ModeObject, StringObject } from "../utils";
import {
  NContextService,
  NDiscoveryService,
  NSchemaService,
} from "../services";
import { AuthScope } from "../services/schema.service";

export interface IAbstractHttpAdapter {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export namespace NAbstractHttpAdapter {
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

  export type Request<
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

  export type Response<BODY = never, HEADERS extends StringObject = never> =
    | BaseResponse<HEADERS>
    | JsonResponse<BODY, HEADERS>
    | RedirectResponse<HEADERS>;

  export type Context<
    USER_INFO = any,
    SYSTEM_INFO = any,
    AUTH_SCOPE extends NSchemaService.AuthScope = NSchemaService.AuthScope
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

  export type Handler = (
    request: Request<any, any, any, any>,
    agents: NSchemaService.Agents,
    context: Context
  ) => Promise<Response | void>;
}

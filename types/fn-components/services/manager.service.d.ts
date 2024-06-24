import type { IAbstractService, NDiscoveryService } from "../services";
import type { AnyFn } from "../utils";

export interface IManagerService extends IAbstractService {
  once(event: NManagerService.Events, listener: AnyFn);
  on(event: NManagerService.Events, listener: AnyFn);
  off(event: NManagerService.Events, listener: AnyFn);
  clear();
}

export namespace NManagerService {
  export type Config = Pick<
    NDiscoveryService.CoreConfig["services"]["manager"],
    "secret" | "users" | "enable" | "connect" | "communicationUrl"
  >;

  export type Events = "discovery:core:re:config" | "logger:set:log:level";

  export type Scope = "auth" | "logger" | "discovery";
  export type LoginCommands = "login";
  export type LoggerCommands = "set-logger-level" | "set-logger-transport";
  export type DiscoveryCommands =
    | "get-service-status"
    | "get-service-config"
    | "reload-core-config"
    | "reload-scheme-config";

  export type ResponseKind = "ok" | "validation" | "fail";

  export interface BaseResponse {
    kind: ResponseKind;
  }
  export interface OkResponse extends BaseResponse {
    kind: "ok";
    code: string;
    headers?: Record<string, string>;
    data?: any;
  }
  export interface ValidationResponse extends BaseResponse {
    kind: "validation";
    code: string;
  }
  export interface FailResponse extends BaseResponse {
    kind: "fail";
    code: string;
  }

  export type Response = OkResponse | ValidationResponse | FailResponse;
}

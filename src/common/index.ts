import type { NSchemaLoader } from "~types";

export * from "./schema.headers";
export * from "./status-code";
export * from "./response-type";
export * from "./core-errors";
export * from "./default-config";

export const SCHEMA_SERVICES: NSchemaLoader.ServiceStructure[] = [];

export const MANAGER_AUTH_HEADER = "x-manager-authorization-secret";
export const MANAGER_USER_HEADER = "x-manager-user";
export const MANAGER_TOKEN_HEADER = "x-manager-access-token";

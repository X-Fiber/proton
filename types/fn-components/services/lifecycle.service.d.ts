import { IAbstractService } from "../services";
import { AnyFn } from "../utils";

export interface ILifecycleService extends IAbstractService {
  emit(event: NLifecycleProvider.Events, data?: unknown): void;
  on(event: NLifecycleProvider.Events, listener: AnyFn): void;
  once(event: NLifecycleProvider.Events, listener: AnyFn): void;
  off(event: NLifecycleProvider.Events, listener: AnyFn): void;
}

export namespace NLifecycleProvider {
  export type Events =
    | "MongoConnector:init"
    | "MongoConnector:destroy"
    | "TypeormConnector:init"
    | "TypeormConnector:destroy"
    | "TypeormConnector:schema-loads"
    | "RedisConnector:init"
    | "RedisConnector:destroy"
    | "RabbitMQConnector:init"
    | "RabbitMQConnector:destroy"
    | "RabbitMQConnector:subscribe-fns"
    | "ServiceConnector:init"
    | "ServiceConnector:destroy"
    | "ServiceConnector:DiscoveryService:pre"
    | "ServiceConnector:DiscoveryService:post"
    | "ServiceConnector:LoggerService:pre"
    | "ServiceConnector:LoggerService:post"
    | "DiscoveryService:init"
    | "DiscoveryService:reload"
    | "DiscoveryService:destroy"
    | "LoggerService:init"
    | "LoggerService:destroy"
    | "ContextService:init"
    | "ContextService:destroy"
    | "CombinationService:init"
    | "CombinationService:destroy"
    | "SchemaService:init"
    | "SchemaService:destroy"
    | "SchemaService:load"
    | "ManagerService:init"
    | "ManagerService:destroy";
}

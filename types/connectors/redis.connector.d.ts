import type { IoRedis } from "../packages";
import type { AnyFn, NDiscoveryService } from "../fn-components";
import type {
  IAbstractConnector,
  NAbstractConnector,
} from "./abstract.connector";

export interface IRedisConnector extends IAbstractConnector {
  readonly connection: IoRedis.IoRedis;

  on(
    events: NAbstractConnector.Events<"RedisConnector">,
    listener: AnyFn
  ): void;
  once(
    events: NAbstractConnector.Events<"RedisConnector">,
    listener: AnyFn
  ): void;
  off(
    events: NAbstractConnector.Events<"RedisConnector">,
    listener: AnyFn
  ): void;
}

export namespace NRedisConnector {
  export type Config = Pick<
    NDiscoveryService.CoreConfig["connectors"]["redis"],
    "enable" | "connect"
  > &
    Pick<
      NDiscoveryService.CoreConfig["connectors"]["redis"]["options"],
      "retryTimeout" | "retryCount" | "showFriendlyErrorStack"
    >;
}

import type { IoRedis } from "../packages";
import type { NDiscoveryService } from "../fn-components";
import type { IAbstractConnector } from "./abstract.connector";

export interface IRedisConnector extends IAbstractConnector {
  readonly connection: IoRedis.IoRedis;
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

import { IAbstractConnector } from "./abstract.connector";
import { IoRedis } from "../packages";
import { NDiscoveryService } from "../fn-components";

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

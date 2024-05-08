import { injectable } from "~packages";

import type {
  IAbstractWsAdapter,
  IDiscoveryService,
  ILoggerService,
  NAbstractWsAdapter,
} from "~types";

@injectable()
export abstract class AbstractWsAdapter<K extends NAbstractWsAdapter.WsKind>
  implements IAbstractWsAdapter
{
  protected abstract readonly _ADAPTER_NAME: string;
  protected abstract _config: NAbstractWsAdapter.Config;
  protected abstract _instance: NAbstractWsAdapter.Instance<K> | undefined;
  protected abstract readonly _discoveryService: IDiscoveryService;
  protected abstract readonly _loggerService: ILoggerService;

  public abstract send(sessionId: string, type: any, payload: any): void;
  public abstract broadcast(sessionId: string[], type: any, payload: any): void;

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;
}

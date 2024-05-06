import { injectable } from "~packages";

import type {
  IAbstractWsAdapter,
  IDiscoveryService,
  ILoggerService,
  NAbstractWebsocketAdapter,
} from "~types";

@injectable()
export abstract class AbstractWsAdapter<
  K extends NAbstractWebsocketAdapter.WsKind
> implements IAbstractWsAdapter
{
  protected abstract readonly _ADAPTER_NAME: string;
  protected abstract _config: NAbstractWebsocketAdapter.Config;
  protected abstract _instance:
    | NAbstractWebsocketAdapter.Instance<K>
    | undefined;
  protected abstract readonly _discoveryService: IDiscoveryService;
  protected abstract readonly _loggerService: ILoggerService;

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;
}

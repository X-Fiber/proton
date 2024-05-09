import { injectable } from "~packages";
import { SchemaHeaders } from "~common";

import {
  UnknownObject,
  IContextService,
  IDiscoveryService,
  ILoggerService,
  IAbstractHttpAdapter,
  NAbstractHttpAdapter,
} from "~types";

@injectable()
export abstract class AbstractHttpAdapter<
  K extends NAbstractHttpAdapter.AdapterKind
> implements IAbstractHttpAdapter
{
  protected abstract readonly _ADAPTER_NAME: string;
  protected abstract _instance:
    | NAbstractHttpAdapter.AdapterInstance<K>
    | undefined;
  protected abstract _config: NAbstractHttpAdapter.Config;
  protected abstract _setConfig(): void;

  protected abstract _discoveryService: IDiscoveryService;
  protected abstract _loggerService: ILoggerService;
  protected abstract _contextService: IContextService;

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  protected abstract _callApi(
    req: NAbstractHttpAdapter.AdapterRequest<K>,
    context: NAbstractHttpAdapter.Context<UnknownObject>
  ): Promise<NAbstractHttpAdapter.AdapterResponse<K>>;
}

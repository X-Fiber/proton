import { injectable } from "~packages";
import { SchemaHeaders } from "~common";

import type {
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

  protected abstract _apiHandler(
    req: NAbstractHttpAdapter.AdapterRequest<K>,
    context: NAbstractHttpAdapter.Context<UnknownObject>
  ): Promise<NAbstractHttpAdapter.AdapterResponse<K>>;

  protected _resolveSchemaHeaders(headers: Record<string, string>): any {
    if (!headers[SchemaHeaders.X_SERVICE_NAME]) {
      return {
        ok: false,
        message: '"x-service-name" header not found',
      };
    }
    if (!headers[SchemaHeaders.X_DOMAIN_NAME]) {
      return {
        ok: false,
        message: '"x-domain-name" header not found',
      };
    }
    if (!headers[SchemaHeaders.X_ACTION_NAME]) {
      return {
        ok: false,
        message: '"x-action-name" header not found',
      };
    }

    return {
      ok: true,
      service: headers[SchemaHeaders.X_SERVICE_NAME],
      domain: headers[SchemaHeaders.X_DOMAIN_NAME],
      action: headers[SchemaHeaders.X_ACTION_NAME],
    };
  }
}

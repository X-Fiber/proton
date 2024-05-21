import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { container } from "~container";

import type {
  ICoreError,
  IRedisTunnel,
  ICacheProvider,
  NCacheProvider,
  IContextService,
  IExceptionProvider,
  IScramblerService,
} from "~types";

@injectable()
export class CacheProvider implements ICacheProvider {
  constructor(
    @inject(CoreSymbols.ScramblerService)
    private readonly _scramblerService: IScramblerService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {}

  public async setItem<T>(
    name: string,
    item: T,
    ttl?: number
  ): Promise<NCacheProvider.CacheIdentifier> {
    const tunnel = container.get<IRedisTunnel>(CoreSymbols.RedisTunnel);

    const payload = JSON.stringify(item);
    const hash = await this._scramblerService.hashPayload(payload);

    try {
      if (ttl) {
        await tunnel.set.addWithTTl(`cache:${name}:${hash}`, [payload], ttl);
      } else {
        await tunnel.set.add(`cache:${name}:${hash}`, [payload]);
      }

      return { hash, name };
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private _catchError(e: any): ICoreError {
    return container
      .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
      .throwError(e, {
        tag: "Execution",
        namespace: CacheProvider.name,
        errorType: "FAIL",
        requestId: this._contextService.store?.requestId,
        sessionId: this._contextService.store?.requestId,
      });
  }
}

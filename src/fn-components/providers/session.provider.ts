import { injectable, inject, uuid } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";

import type {
  ICoreError,
  UnknownObject,
  IRedisTunnel,
  ILoggerService,
  ISessionProvider,
  NSessionProvider,
  IScramblerService,
  IExceptionProvider,
  IContextService,
} from "~types";

@injectable()
export class SessionProvider implements ISessionProvider {
  protected _config: NSessionProvider.Config | undefined;

  constructor(
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ScramblerService)
    private readonly _scramblerService: IScramblerService,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {}

  public async open<T extends UnknownObject>(payload: T): Promise<string> {
    const sessionId = uuid.v4();
    try {
      await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .hash.hsetWithExpire<T>(
          sessionId,
          payload,
          this._scramblerService.accessExpiredAt
        );

      return sessionId;
    } catch (e) {
      throw this._catch(e, sessionId);
    }
  }

  public async getById<T extends UnknownObject>(
    sessionId: string
  ): Promise<T | null> {
    try {
      const info = await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .hash.hgetall<T>(sessionId);

      return info ?? null;
    } catch (e) {
      throw this._catch(e, sessionId);
    }
  }

  public async getCount(sessionId: string): Promise<number> {
    try {
      const sessions = await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .keys.getAll(sessionId);

      return sessions.length;
    } catch (e) {
      throw this._catch(e, sessionId);
    }
  }

  public async update<T extends Record<string, unknown>>(
    sessionId: string,
    field: keyof T,
    value: T[keyof T]
  ): Promise<void> {
    try {
      await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .hashMulti.hset(sessionId, field, value);
    } catch (e) {
      throw this._catch(e, sessionId);
    }
  }

  public async removeById(sessionId: string): Promise<void> {
    try {
      await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .keys.delete(sessionId);
    } catch (e) {
      throw this._catch(e, sessionId);
    }
  }

  private _catch(e: any, sessionId?: string): ICoreError {
    this._loggerService.error(e, {
      sessionId: sessionId,
      tag: "Execution",
      errorType: "FATAL",
      namespace: SessionProvider.name,
      scope: "Core",
      requestId: this._contextService.store.requestId,
    });

    return container
      .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
      .throwError(e, {
        sessionId: sessionId ?? undefined,
        errorType: "FATAL",
        tag: "Execution",
        namespace: SessionProvider.name,
        requestId: this._contextService.store.requestId,
      });
  }
}

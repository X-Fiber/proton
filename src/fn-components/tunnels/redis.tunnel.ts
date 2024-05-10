import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { container } from "~container";
import { Guards } from "~utils";

import {
  Nullable,
  UnknownObject,
  ICoreError,
  IContextService,
  IExceptionProvider,
  IRedisConnector,
  IRedisTunnel,
  NRedisTunnel,
} from "~types";
import { log } from "winston";

@injectable()
export class RedisTunnel implements IRedisTunnel {
  constructor(
    @inject(CoreSymbols.RedisConnector)
    private readonly _redisConnector: IRedisConnector,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {}

  private get _connection() {
    return this._redisConnector.connection;
  }

  // hash
  public get hash(): NRedisTunnel.Hash {
    return {
      hsetWithExpire: <T extends UnknownObject>(
        id: string,
        info: T,
        ttl: number
      ): Promise<void> => {
        return this._hsetWithExpire<T>(id, info, ttl);
      },
      hset: <T extends UnknownObject>(id: string, data: T): Promise<void> => {
        return this._hashSet(id, data);
      },
      hgetall: <T extends UnknownObject>(id: string): Promise<Nullable<T>> => {
        return this._hashGetAll<T>(id);
      },
      getHashById: <T extends UnknownObject>(id: string): Promise<T | null> => {
        return this._getHashById(id);
      },
    };
  }

  private async _hsetWithExpire<T extends UnknownObject>(
    id: string,
    info: T,
    ttl: number
  ): Promise<void> {
    try {
      await this._connection.multi().hset(id, info).expire(id, ttl).exec();
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _hashSet<T extends UnknownObject>(
    id: string,
    data: T
  ): Promise<void> {
    const record: Record<string, string> = {};

    try {
      for (const [name, value] of Object.entries(data)) {
        if (typeof value === "object") {
          record[name] = JSON.stringify(value);
        } else {
          if (Guards.isString(value)) {
            record[name] = value;
          }
        }
      }
    } catch (e) {
      throw this._catchError(e);
    }

    try {
      await this._connection.hset(id, record);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _hashGetAll<T extends UnknownObject>(
    id: string
  ): Promise<Nullable<T>> {
    const item: T = {} as T;
    let record: Record<string, string>;

    try {
      record = await this._redisConnector.connection.hgetall(id);
    } catch (e) {
      throw e;
    }

    try {
      for (const [name, value] of Object.entries(record)) {
        try {
          item[name as keyof T] = JSON.parse(value as string);
        } catch (e) {
          item[name as keyof T] = value as T[keyof T];
        }
      }

      return Object.keys(item).length > 0 ? (item as T) : null;
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _getHashById<T extends UnknownObject>(
    id: string
  ): Promise<T | null> {
    try {
      const ids = await this._connection.keys(id);
      const item = await this._hashGetAll<T>(ids[0]);
      return item ?? null;
    } catch (e) {
      throw this._catchError(e);
    }
  }

  // keys
  public get keys(): NRedisTunnel.Keys {
    return {
      checkOne: (id: string): Promise<boolean> => {
        return this._checkKey(id);
      },
      getAll: (id: string): Promise<string[]> => {
        return this._getAllKeys(id);
      },
      rename: (oldKey: string, newKey: string): Promise<"OK"> => {
        return this._renameKey(oldKey, newKey);
      },
      delete: (id: string): Promise<number> => {
        return this._deleteKey(id);
      },
    };
  }

  private async _checkKey(id: string): Promise<boolean> {
    try {
      const keys = await this._connection.keys(id);
      return keys.length > 0;
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _getAllKeys(id: string): Promise<string[]> {
    try {
      return await this._connection.keys(`${id}:*`);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _renameKey(oldKey: string, newKey: string): Promise<"OK"> {
    try {
      return await this._connection.rename(oldKey, newKey);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _deleteKey(id: string): Promise<number> {
    try {
      return await this._connection.del(id);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  // hashMulti
  public get hashMulti(): NRedisTunnel.HashMulti {
    return {
      hmset: <T extends UnknownObject>(
        id: string,
        field: keyof T,
        value: T[keyof T]
      ): Promise<void> => {
        return this._setHashMultiById(id, field, value);
      },
      hset: <T extends UnknownObject>(
        id: string,
        field: keyof T,
        value: T[keyof T]
      ): Promise<void> => {
        return this._setHashMultiField(id, field, value);
      },
    };
  }

  private async _setHashMultiById<T extends UnknownObject>(
    id: string,
    field: keyof T,
    value: T[keyof T]
  ): Promise<void> {
    try {
      await this._connection.hmset(id, { [field]: value });
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _setHashMultiField<T extends UnknownObject>(
    id: string,
    field: keyof T,
    value: T[keyof T]
  ): Promise<void> {
    try {
      await this._connection.hset(id, { [field]: value });
    } catch (e) {
      throw this._catchError(e);
    }
  }

  // set
  public get set(): NRedisTunnel.Set {
    return {
      get: (id: string): Promise<Nullable<string[]>> => {
        return this._getSet(id);
      },
      add: (id: string, value: string[]): Promise<void> => {
        return this._addSet(id, value);
      },
      addWithTTl: (id: string, value: string[], ttl: number): Promise<void> => {
        return this._addSetWithTTl(id, value, ttl);
      },
      update: (id: string, value: string[]): Promise<void> => {
        return this._updateSet(id, value);
      },
      remove: (id: string, item: string | string[]): Promise<void> => {
        return this._removeSetItem(id, item);
      },
    };
  }

  private async _getSet(id: string): Promise<Nullable<string[]>> {
    try {
      const routes = await this._connection.smembers(id);
      return routes.length > 0 ? routes : null;
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _addSet(id: string, value: string[]): Promise<void> {
    try {
      await this._connection.sadd(id, value);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _addSetWithTTl(
    id: string,
    value: string[],
    ttl: number
  ): Promise<void> {
    try {
      await this._connection.multi().sadd(id, value).expire(id, ttl).exec();
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _updateSet(id: string, value: string[]): Promise<void> {
    try {
      await this._connection.multi().del(id).sadd(id, value).exec();
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _removeSetItem(
    id: string,
    item: string | string[]
  ): Promise<void> {
    try {
      await this._connection.srem(id, Array.isArray(item) ? item : [item]);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  public get streams(): NRedisTunnel.Streams {
    return {
      addExpiredStream: <T>(name: string, item: T, ttl: number) => {
        return this._addExpiredStream<T>(name, item, ttl);
      },
      addExpiredStreams: <T>(item: T[], ttl: number) => {
        return this._addExpiredStreams<T>(item, ttl);
      },
    };
  }

  private async _addExpiredStream<T>(
    name: string,
    item: T,
    ttl: number
  ): Promise<void> {
    try {
      await this._connection
        .multi()
        .set(name, JSON.stringify(item))
        .expire(name, ttl)
        .exec();
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _addExpiredStreams<T>(
    structure: T[],
    ttl: number
  ): Promise<void> {
    // TODO: need implemented
  }

  private _catchError(e: any): ICoreError {
    return container
      .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
      .throwError(e, {
        namespace: RedisTunnel.name,
        tag: "EXECUTE",
        errorType: "FATAL",
        requestId: this._contextService.store.requestId,
        sessionId: this._contextService.store.sessionId,
      });
  }
}

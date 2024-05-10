import { Nullable, UnknownObject } from "../utils";

export interface IRedisTunnel {
  readonly hash: NRedisTunnel.Hash;
  readonly hashMulti: NRedisTunnel.HashMulti;
  readonly keys: NRedisTunnel.Keys;
  readonly set: NRedisTunnel.Set;
  readonly streams: NRedisTunnel.Streams;
}

export namespace NRedisTunnel {
  export type Repository = {
    hash: Hash;
    hashMulti: HashMulti;
    keys: Keys;
    set: Set;
  };

  export type Hash = {
    hsetWithExpire<T extends UnknownObject>(
      id: string,
      info: T,
      ttl: number
    ): Promise<void>;
    hset<T extends UnknownObject>(id: string, data: T): Promise<void>;
    hgetall<T extends UnknownObject>(id: string): Promise<Nullable<T>>;
    getHashById<T extends UnknownObject>(id: string): Promise<T | null>;
  };

  export type Keys = {
    checkOne(id: string): Promise<boolean>;
    getAll(id: string): Promise<string[]>;
    rename(oldKey: string, newKey: string): Promise<"OK">;
    delete(id: string): Promise<number>;
  };

  export type HashMulti = {
    hmset<T extends UnknownObject>(
      id: string,
      field: keyof T,
      value: T[keyof T]
    ): Promise<void>;
    hset<T extends UnknownObject>(
      id: string,
      field: keyof T,
      value: T[keyof T]
    ): Promise<void>;
  };

  export type Set = {
    get(id: string): Promise<Nullable<string[]>>;
    add(id: string, value: string[]): Promise<void>;
    addWithTTl(id: string, value: string[], ttl: number): Promise<void>;
    update(id: string, value: string[]): Promise<void>;
    remove(id: string, item: string | string[]): Promise<void>;
  };

  export type Streams = {
    addExpiredStream<T>(name: string, item: T, ttl: number): Promise<void>;
    addExpiredStreams<T>(item: T[], ttl: number): Promise<void>;
  };
}

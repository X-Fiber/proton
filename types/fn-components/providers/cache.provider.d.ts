export interface ICacheProvider {
  setItem<N extends string, T>(
    name: N,
    item: T,
    ttl?: number
  ): Promise<NCacheProvider.CacheIdentifier>;
}

export namespace NCacheProvider {
  export type CacheIdentifier = {
    name: string;
    hash: string;
  };
}

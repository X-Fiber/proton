export interface IExpiringMap<K, V> extends Map<K, V> {
  destroy: () => void;
  on(event: "timeout", listener: (key: K, val?: V) => void): void;
  on(event: "delete", listener: (key: K) => void): void;
  on(event: string | symbol, listener: (...args: any[]) => void): void;
  once(event: string | symbol, listener: (...args: any[]) => void): void;
  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void
  ): void;
}

export namespace NExpiringMap {
  export type Options = {
    valueTimeout?: number;
    interval?: number;
    updateTimeOnGet?: boolean;
  };
}

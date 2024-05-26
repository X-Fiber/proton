import type { Voidable } from "../utils";

export interface IAbstractService {
  readonly isStarted: boolean;

  start(): Promise<void>;
  stop(): Promise<void>;
}

export namespace NAbstractService {
  export type Event<T extends string = string> = T;
  export type Listener = () => void;
  export type Data<T> = Voidable<T>;
}

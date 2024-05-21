import type { Voidable } from "../utils";

export interface IAbstractService {
  readonly isStarted: boolean;

  start(): Promise<void>;
  stop(): Promise<void>;

  on(event: NAbstractService.Event, listener: NAbstractService.Listener): void;
  once(
    event: NAbstractService.Event,
    listener: NAbstractService.Listener
  ): void;
  emit<T = void>(
    event: NAbstractService.Event,
    data?: NAbstractService.Data<T>
  ): void;
  off(event: NAbstractService.Event, listener: NAbstractService.Listener): void;
}

export namespace NAbstractService {
  export type Event<T extends string = string> = T;
  export type Listener = () => void;
  export type Data<T> = Voidable<T>;
}

import type { Voidable } from "../fn-components";

export interface IAbstractConnector {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export namespace NAbstractConnector {
  export type Events<T extends string = string> =
    | `${T}:init`
    | `${T}:destroy`
    | string;

  export type Listener = () => void;
  export type Data<T = any> = Voidable<T>;
}

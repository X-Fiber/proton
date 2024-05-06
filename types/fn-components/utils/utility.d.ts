import { NDiscoveryService } from "../services";

export type Voidable<T> = T | void;
export type Nullable<T> = T | null;
export type UnknownObject = Record<string, unknown>;
export type StringObject = Record<string, string>;
export type AnyObject = Record<string, any>;
export type AnyFunction = (...args: any[]) => any;
export type AnyFn = ((...args) => any) | ((...args: any) => Promise<any>);
export type FnObject = Record<string, AnyFunction>;
export type ModeObject<T = (string | number | boolean)[]> = {
  [key in string]:
    | T
    | string
    | string[]
    | number
    | number[]
    | boolean
    | boolean[]
    | (string | number | boolean)[];
};

export type ExtendedRecordObject = Record<
  string,
  ExtendedRecordObject | string
>;

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD"
  | "TRACE";

export type UTCDate = {
  date: string;
  time: string;
  utc: string;
};

export type KeyStringLiteralBuilder<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]: T[K] extends Record<string, unknown>
        ? `${string & K}.${KeyStringLiteralBuilder<T[K]>}`
        : `${string & K}`;
    }[keyof T]
  : string;

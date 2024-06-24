import type { Typeorm } from "../packages";
import type { AnyFn } from "../fn-components";
import type {
  IAbstractConnector,
  NAbstractConnector,
} from "./abstract.connector";

export interface ITypeormConnector extends IAbstractConnector {
  readonly connection: Typeorm.DataSource;
  getRepository<T>(name: string): Typeorm.Repository<T>;

  on(
    event: NAbstractConnector.Events<"TypeormConnector">,
    listener: AnyFn
  ): void;
  once(
    event: NAbstractConnector.Events<"TypeormConnector">,
    listener: AnyFn
  ): void;
  off(
    event: NAbstractConnector.Events<"TypeormConnector">,
    listener: AnyFn
  ): void;
}

export namespace NTypeormConnector {
  export type Events =
    | "connector:TypeormConnector:start"
    | "connector:TypeormConnector:entities:load";
  export type DatabaseType = Typeorm.DatabaseType;

  export type Config = {
    enable: boolean;
    type: DatabaseType;
    protocol: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    schema: string;
  };
}

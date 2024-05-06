import { IAbstractConnector } from "./abstract.connector";
import { Typeorm } from "../packages";
import { Voidable } from "../fn-components";

export interface ITypeormConnector extends IAbstractConnector {
  readonly connection: Typeorm.DataSource;
  getRepository<T>(name: string): Typeorm.Repository<T>;

  emit<T>(event: NTypeormConnector.Events, data?: Voidable<T>): void;
  on(event: NTypeormConnector.Events, listener: () => void): void;
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

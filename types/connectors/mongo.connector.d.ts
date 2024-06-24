import type { Mongoose } from "../packages";
import { IAbstractConnector, NAbstractConnector } from "./abstract.connector";
import type { AnyFn } from "../fn-components";

export interface IMongoConnector extends IAbstractConnector {
  readonly connection: Mongoose.Mongoose;

  on(event: NAbstractConnector.Events<"MongoConnector">, listener: AnyFn): void;
  once(
    event: NAbstractConnector.Events<"MongoConnector">,
    listener: AnyFn
  ): void;
  off(
    event: NAbstractConnector.Events<"MongoConnector">,
    listener: AnyFn
  ): void;
}

export namespace NMongoConnector {
  export type Events = NAbstractConnector.Events<"MongoConnector">;

  export type Config = {
    enable: boolean;
    database: string;
    connect: {
      protocol: string;
      host: string;
      port: number;
    };
    auth: {
      username: string;
      password: string;
    };
  };
}

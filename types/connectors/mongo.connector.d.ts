import { IAbstractConnector } from "./abstract.connector";
import { Mongoose } from "../packages";

export interface IMongoConnector extends IAbstractConnector {
  readonly connection: Mongoose.Mongoose;
  on(event: NMongodbConnector.Events, listener: (...args: any[]) => void): void;
}

export namespace NMongodbConnector {
  export type Events = "connector:MongoDbConnector:init";
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

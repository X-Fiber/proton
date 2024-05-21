import type { Mongoose } from "../packages/packages";
import type { NSchemeService } from "../services";

export interface IMongoTunnel {
  setModels(models: NMongoTunnel.SchemaInfo[]): void;
  getRepository<S>(): NMongoTunnel.Repository<S>;
}

export namespace NMongoTunnel {
  export type Repository<P> = {
    create: IMongoTunnel["create"];
    insertMany: IMongoTunnel["insertMany"];
    aggregate: IMongoTunnel["_aggregate"];
    hydrate: IMongoTunnel["_hydrate"];
    populate: IMongoTunnel["_populate"];
    validate: IMongoTunnel["_validate"];
    countDocuments: IMongoTunnel["_countDocuments"];
    exists: IMongoTunnel["_exists"];
    find: IMongoTunnel["find"];
    findById: IMongoTunnel["findById"];
    findByIdAndUpdate: IMongoTunnel["findByIdAndUpdate"];
    findByIdAndDelete: IMongoTunnel["findByIdAndDelete"];
    findOne: IMongoTunnel["findOne"];
    findOneAndUpdate: IMongoTunnel["findOneAndUpdate"];
    findOneAndReplace: IMongoTunnel["findOneAndReplace"];
    findOneAndDelete: IMongoTunnel["findOneAndDelete"];
    updateOne: IMongoTunnel["updateOne"];
    updateMany: IMongoTunnel["updateMany"];
    replaceOne: IMongoTunnel["replaceOne"];
    deleteOne: IMongoTunnel["deleteOne"];
    deleteMany: IMongoTunnel["deleteMany"];
  };

  export type Schema<T> = {
    definition: Mongoose.SchemaDefinition<T>;
    options?: Mongoose.SchemaOptions;
  };

  export type SchemaInfo<T = any> = {
    model: string;
    getSchema: SchemaFn<T>;
  };
  export type SchemaFn<T> = (agents: NSchemeService.Agents) => Schema<T>;
}

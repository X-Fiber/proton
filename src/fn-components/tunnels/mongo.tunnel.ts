import { injectable, inject } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";

import type {
  Mongoose,
  Nullable,
  UnknownObject,
  ICoreError,
  ISchemeAgent,
  IMongoTunnel,
  NMongoTunnel,
  NSchemeService,
  IContextService,
  IMongoConnector,
  IIntegrationAgent,
  IExceptionProvider,
  IFunctionalityAgent,
} from "~types";

@injectable()
export class MongoTunnel implements IMongoTunnel {
  constructor(
    @inject(CoreSymbols.MongoConnector)
    private readonly _mongodbConnector: IMongoConnector,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {}

  public setModels(fnModels: NMongoTunnel.SchemaInfo<unknown>[]) {
    const { connection } = this._mongodbConnector;

    fnModels.forEach((fn) => {
      const agents: NSchemeService.Agents = {
        fnAgent: container.get<IFunctionalityAgent>(
          CoreSymbols.FunctionalityAgent
        ),
        schemaAgent: container.get<ISchemeAgent>(CoreSymbols.SchemaAgent),
        inAgent: container.get<IIntegrationAgent>(CoreSymbols.IntegrationAgent),
      };

      const model = fn.getSchema(agents);

      const schema = model.options
        ? new connection.Schema(model.definition, model.options)
        : new connection.Schema(model.definition);

      connection.model(fn.model, schema);
    });
  }

  public getRepository<S>(): NMongoTunnel.Repository<S> {
    return {
      create: async <T>(
        model: string,
        docs: Mongoose.Docs<T>,
        options: Mongoose.SaveOptions
      ): Promise<Mongoose.AnyKeys<T>> => {
        return this._create<T>(model, docs, options);
      },
      insertMany: async <TRawDocType>(
        model: string,
        docs: Mongoose.Docs<TRawDocType>,
        options?: Mongoose.InsertManyOptions
      ): Promise<Mongoose.InsertManyResult> => {
        return this._insertMany<TRawDocType>(model, docs, options);
      },
      aggregate: async <TRawDocType>(
        model: string,
        pipeline?: Mongoose.PipelineStage[],
        options?: Mongoose.AggregateOptions
      ): Promise<Mongoose.AggregateResult<TRawDocType>> => {
        return this._aggregate<TRawDocType>(model, pipeline, options);
      },
      hydrate: async <TRawDocType>(
        model: string,
        obj: UnknownObject,
        projection?: Mongoose.AnyObject,
        options?: Mongoose.HydrateOptions
      ): Promise<Mongoose.HydrateResult<TRawDocType>> => {
        return this._hydrate<TRawDocType>(model, obj, projection, options);
      },
      populate: async <TRawDocType>(
        model: string,
        docs: Array<Mongoose.Docs<TRawDocType>>,
        options:
          | Mongoose.PopulateOptions
          | Array<Mongoose.PopulateOptions>
          | string
      ): Promise<Mongoose.PopulateResult<TRawDocType>> => {
        return this._populate<TRawDocType>(model, docs, options);
      },
      validate: async (
        name: string,
        optional: unknown,
        pathsToValidate: Mongoose.PathsToValidate
      ): Promise<void> => {
        return this._validate(name, optional, pathsToValidate);
      },
      countDocuments: async <TRawDocType>(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.CountDocumentsResult<TRawDocType>> => {
        return this._countDocuments<TRawDocType>(model, filter, options);
      },
      exists: async <TRawDocType>(
        model: string,
        filter: Mongoose.FilterQuery<TRawDocType>
      ): Promise<Mongoose.ExistsResult<TRawDocType>> => {
        return this._exists<TRawDocType>(model, filter);
      },
      find: async <TRawDocType>(
        model: string,
        filter: Mongoose.FilterQuery<TRawDocType>,
        projection?: Nullable<Mongoose.ProjectionType<TRawDocType>>,
        options?: Nullable<Mongoose.QueryOptions<TRawDocType>>
      ): Mongoose.FindResult<TRawDocType> => {
        return this._find<TRawDocType>(model, filter, projection, options);
      },
      findById: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        id: string,
        projection?: Mongoose.ProjectionType<TRawDocType | null>,
        options?: Mongoose.QueryOptions<TRawDocType | null>
      ): Promise<Mongoose.FindByIdResult<ResultDoc>> => {
        return this._findById<TRawDocType, ResultDoc>(
          model,
          id,
          projection,
          options
        );
      },
      findByIdAndUpdate: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        id: string,
        update: Mongoose.UpdateQuery<TRawDocType>,
        options: Mongoose.QueryOptions<TRawDocType> & { rawResult?: true }
      ): Promise<Mongoose.FindByIdAndUpdateResult<ResultDoc>> => {
        return this._findByIdAndUpdate<TRawDocType, ResultDoc>(
          model,
          id,
          update,
          options
        );
      },
      findByIdAndDelete: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        id: string,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.FindByIdAndDeleteResult<ResultDoc>> => {
        return this._findByIdAndDelete<TRawDocType, ResultDoc>(
          model,
          id,
          options
        );
      },
      findOne: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        projection?: Mongoose.ProjectionType<TRawDocType>,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.FindOneResult<ResultDoc>> => {
        return this._findOne<TRawDocType, ResultDoc>(
          model,
          filter,
          projection,
          options
        );
      },
      findOneAndUpdate: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        id: string,
        update: Mongoose.UpdateQuery<TRawDocType>,
        options: Mongoose.QueryOptions<TRawDocType> & { rawResult: true }
      ): Promise<Mongoose.FindOneAndUpdateResult<ResultDoc>> => {
        return this._findOneAndUpdate<TRawDocType, ResultDoc>(
          model,
          id,
          update,
          options
        );
      },
      findOneAndReplace: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter: Mongoose.FilterQuery<TRawDocType>,
        replacement: TRawDocType | Mongoose.AnyObject,
        options: Mongoose.QueryOptions<TRawDocType> & { rawResult: true }
      ): Promise<Mongoose.FindOneAndReplaceResult<ResultDoc>> => {
        return this._findOneAndReplace<TRawDocType, ResultDoc>(
          model,
          filter,
          replacement,
          options
        );
      },
      findOneAndDelete: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter: Mongoose.FilterQuery<TRawDocType>,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.FindOneAndDeleteResult<ResultDoc>> => {
        return this._findOneAndDelete<TRawDocType, ResultDoc>(
          model,
          filter,
          options
        );
      },
      updateOne: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        update?: Mongoose.UpdateQuery<
          TRawDocType | Mongoose.UpdateWithAggregationPipeline
        >,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.UpdateOneResult<ResultDoc>> => {
        return this._updateOne<TRawDocType, ResultDoc>(
          model,
          filter,
          update,
          options
        );
      },
      updateMany: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        update?: Mongoose.UpdateQuery<
          TRawDocType | Mongoose.UpdateWithAggregationPipeline
        >,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.UpdateManyResult<ResultDoc>> => {
        return this._updateMany<TRawDocType, ResultDoc>(
          model,
          filter,
          update,
          options
        );
      },
      replaceOne: async <
        TRawDocType,
        ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
      >(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        replacement?: TRawDocType | Mongoose.AnyObject,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.ReplaceOneResult<ResultDoc>> => {
        return this._replaceOne<TRawDocType, ResultDoc>(
          model,
          filter,
          replacement,
          options
        );
      },
      deleteOne: async <TRawDocType>(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.DeleteOne<TRawDocType>> => {
        return this._deleteOne<TRawDocType>(model, filter, options);
      },
      deleteMany: async <TRawDocType>(
        model: string,
        filter?: Mongoose.FilterQuery<TRawDocType>,
        options?: Mongoose.QueryOptions<TRawDocType>
      ): Promise<Mongoose.DeleteMany<TRawDocType>> => {
        return this._deleteMany<TRawDocType>(model, filter, options);
      },
    };
  }

  private async _create<TRawDocType>(
    model: string,
    docs: Mongoose.Docs<TRawDocType>,
    options?: Mongoose.SaveOptions
  ): Promise<Mongoose.AnyKeys<TRawDocType>> {
    try {
      return options
        ? await this._models[model].create<TRawDocType>(docs, options)
        : await this._models[model].create<TRawDocType>(docs);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private get _models(): Mongoose.Models {
    const models = this._mongodbConnector.connection.models;
    if (!models) {
      throw container
        .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
        .throwError("Models not initialize", {
          namespace: MongoTunnel.name,
          errorType: "FAIL",
          requestId: this._contextService.store.requestId,
        });
    }

    return models;
  }

  private async _insertMany<TRawDocType>(
    model: string,
    docs: Mongoose.Docs<TRawDocType>,
    options?: Mongoose.InsertManyOptions
  ): Promise<Mongoose.InsertManyResult> {
    try {
      return options
        ? await this._models[model].insertMany(docs, options)
        : await this._models[model].insertMany(docs);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _countDocuments<TRawDocType>(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.CountDocumentsResult<TRawDocType>> {
    try {
      return options
        ? await this._models[model].countDocuments(filter, options)
        : await this._models[model].countDocuments(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _aggregate<TRawDocType>(
    model: string,
    pipeline?: Mongoose.PipelineStage[],
    options?: Mongoose.AggregateOptions
  ): Promise<Mongoose.AggregateResult<TRawDocType>> {
    try {
      return options
        ? await this._models[model].aggregate(pipeline, options)
        : await this._models[model].aggregate(pipeline);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _hydrate<TRawDocType>(
    model: string,
    obj: UnknownObject,
    projection?: Mongoose.AnyObject,
    options?: Mongoose.HydrateOptions
  ): Promise<Mongoose.HydrateResult<TRawDocType>> {
    try {
      return options && projection
        ? await this._models[model].hydrate(obj, projection, options)
        : projection
        ? await this._models[model].hydrate(obj, projection)
        : await this._models[model].hydrate(obj);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _populate<TRawDocType>(
    model: string,
    docs: Array<Mongoose.Docs<TRawDocType>>,
    options: Mongoose.PopulateOptions | Array<Mongoose.PopulateOptions> | string
  ): Promise<Mongoose.PopulateResult<TRawDocType>> {
    try {
      return this._models[model].populate(docs, options);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _validate(
    model: string,
    optional: unknown,
    pathsToValidate: Mongoose.PathsToValidate
  ): Promise<void> {
    try {
      return this._models[model].validate(optional, pathsToValidate);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _exists<TRawDocType>(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>
  ): Promise<Mongoose.ExistsResult<TRawDocType>> {
    try {
      return this._models[model].exists(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _find<TRawDocType>(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>,
    projection?: Nullable<Mongoose.ProjectionType<TRawDocType>>,
    options?: Nullable<Mongoose.QueryOptions<TRawDocType>>
  ): Mongoose.FindResult<TRawDocType> {
    try {
      return options && projection
        ? await this._models[model].find(filter, projection, options)
        : projection
        ? await this._models[model].find(filter, projection)
        : await this._models[model].find(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _findById<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id: string,
    projection?: Mongoose.ProjectionType<Nullable<TRawDocType>>,
    options?: Mongoose.QueryOptions<Nullable<TRawDocType>>
  ): Promise<Mongoose.FindByIdResult<ResultDoc>> {
    try {
      return options && projection
        ? await this._models[model].findById(id, projection, options)
        : projection
        ? await this._models[model].findById(id, projection)
        : await this._models[model].findById(id);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _findByIdAndUpdate<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id: string,
    update: Mongoose.UpdateQuery<TRawDocType>,
    options: Mongoose.QueryOptions<TRawDocType> & { rawResult?: true }
  ): Promise<Mongoose.FindByIdAndUpdateResult<ResultDoc>> {
    try {
      return this._models[model].findByIdAndUpdate(id, update, options);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _findByIdAndDelete<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id: string,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.FindByIdAndDeleteResult<ResultDoc>> {
    try {
      return options
        ? await this._models[model].findByIdAndDelete(id, options)
        : await this._models[model].findByIdAndDelete(id);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _findOne<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    projection?: Mongoose.ProjectionType<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.FindOneResult<ResultDoc>> {
    try {
      return options && projection
        ? await this._models[model].findOne(filter, projection, options)
        : projection
        ? await this._models[model].findOne(filter, projection)
        : await this._models[model].findOne(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _findOneAndUpdate<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    id: string,
    update: Mongoose.UpdateQuery<TRawDocType>,
    options: Mongoose.QueryOptions<TRawDocType> & { rawResult: true }
  ): Promise<Mongoose.FindOneAndUpdateResult<ResultDoc>> {
    try {
      return this._models[model].findByIdAndUpdate(id, update, options);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _findOneAndReplace<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>,
    replacement: TRawDocType | Mongoose.AnyObject,
    options: Mongoose.QueryOptions<TRawDocType> & { rawResult: true }
  ): Promise<Mongoose.FindOneAndReplaceResult<ResultDoc>> {
    try {
      return this._models[model].findOneAndReplace(
        filter,
        replacement,
        options
      );
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _findOneAndDelete<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.FindOneAndDeleteResult<ResultDoc>> {
    try {
      return options
        ? this._models[model].findByIdAndDelete(filter, options)
        : this._models[model].findByIdAndDelete(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _updateOne<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    update?: Mongoose.UpdateQuery<
      TRawDocType | Mongoose.UpdateWithAggregationPipeline
    >,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.UpdateOneResult<ResultDoc>> {
    try {
      return options && update
        ? await this._models[model].updateOne(filter, update, options)
        : update
        ? await this._models[model].updateOne(filter, update)
        : await this._models[model].updateOne(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _updateMany<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    update?: Mongoose.UpdateQuery<
      TRawDocType | Mongoose.UpdateWithAggregationPipeline
    >,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.UpdateManyResult<ResultDoc>> {
    try {
      return options && update
        ? await this._models[model].updateMany(filter, update, options)
        : update
        ? await this._models[model].updateMany(filter, update)
        : await this._models[model].updateMany(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _replaceOne<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>
  >(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    replacement?: TRawDocType | Mongoose.AnyObject,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.ReplaceOneResult<ResultDoc>> {
    try {
      return options && replacement
        ? await this._models[model].replaceOne(filter, replacement, options)
        : replacement
        ? await this._models[model].replaceOne(filter, replacement)
        : await this._models[model].replaceOne(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _deleteOne<TRawDocType>(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.DeleteOne<TRawDocType>> {
    try {
      return options
        ? await this._models[model].deleteOne(filter, options)
        : await this._models[model].deleteOne(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private async _deleteMany<TRawDocType>(
    model: string,
    filter?: Mongoose.FilterQuery<TRawDocType>,
    options?: Mongoose.QueryOptions<TRawDocType>
  ): Promise<Mongoose.DeleteMany<TRawDocType>> {
    try {
      return options
        ? await this._models[model].deleteMany(filter, options)
        : await this._models[model].deleteMany(filter);
    } catch (e) {
      throw this._catchError(e);
    }
  }

  private _catchError(e: any): ICoreError {
    return container
      .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
      .throwError(e, {
        namespace: MongoTunnel.name,
        tag: "EXECUTE",
        errorType: "FATAL",
        requestId: this._contextService.store.requestId,
        sessionId: this._contextService.store.sessionId,
      });
  }
}

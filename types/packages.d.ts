// internal
import type events from "events";
import type http from "http";
import type https from "https";
import type async_hooks from "async_hooks";

// external
import type colors from "colors";
import type inversify from "inversify";
import type typeorm from "typeorm";
import type jwt from "jsonwebtoken";
import type mongoose from "mongoose";
import type winston from "winston";
import type joi from "joi";
import type nodemailer from "nodemailer";
import type fastify from "fastify";
import type express from "express";
import type { Redis, RedisOptions } from "ioredis";
import type ws from "ws";
import type libAmqp from "amqplib/callback_api";
import type workerpool from "workerpool";
import type SeedsDiscovery from "@chaminjector/seeds-discovery-service";

// utils
import type { StringObject, UnknownObject } from "../utils";

export namespace Inversify {
  export namespace interfaces {
    export type Bind = inversify.interfaces.Bind;
    export type Container = inversify.interfaces.Container;
  }
}

export namespace Events {
  export type EventEmitter = events.EventEmitter;
}

export namespace Winston {
  export type format = winston.format;
  export type Logger = winston.Logger;
  export type Container = winston.Container;
  export type transport = winston.transport;
}

export namespace Color {
  export type Color = colors.Color;
}

export namespace AsyncHooks {
  export type AsyncLocalStorage<T> = async_hooks.AsyncLocalStorage<T>;
}

export namespace Fastify {
  export type Request = fastify.FastifyRequest;
  export type Response = fastify.FastifyReply;
  export type Instance = fastify.FastifyInstance;
  export type FastifyError = fastify.FastifyError;

  export type SchemaRequest<
    BODY = UnknownObject,
    PARAMS extends StringObject = StringObject,
    HEADERS extends StringObject = StringObject
  > = {
    url: string;
    headers: HEADERS & fastify.FastifyRequest["headers"];
    method: fastify.FastifyRequest["method"];
    path: string;
    params: PARAMS;
    body: BODY;
    query: fastify.FastifyRequest["query"];
  };
}

export namespace Express {
  export type Application = express.Express;
  export type Request<P = any, B = any> = express.Request<P, B>;
  export type Response = express.Response;
  export type Instance = express.Express;
}

export namespace Mongoose {
  export type Mongoose = mongoose.Mongoose;
  export type Models = mongoose.Models;
  export type AnyObject = mongoose.AnyObject;
  export type THydratedDocumentType<DocType> =
    mongoose.HydratedDocument<DocType>;
  export type ConnectionOptions = mongoose.ConnectOptions;
  export type SchemaDefinition<T> = mongoose.SchemaDefinition<T>;
  export type DeleteResult = mongodb.DeleteResult;
  export type SchemaOptions = mongoose.SchemaOptions;
  export type PipelineStage = mongoose.PipelineStage;
  export type PathsToValidate = mongoose.PathsToValidate;
  export type HydrateOptions = { setters?: boolean };
  export type AggregateOptions = mongoose.AggregateOptions;
  export type UpdateQuery<TRawDocType> = mongoose.UpdateQuery<TRawDocType>;
  export type UpdateWithAggregationPipeline =
    mongoose.UpdateWithAggregationPipeline;
  export type PopulateOptions = mongoose.PopulateOptions;
  export type AggregateResult<TRowDocType> = mongoose.Aggregate<
    Array<TRowDocType>
  >;
  export type AnyKeys<T> = mongoose.AnyKeys<T>;
  export type Docs<TRawDocType, DocContents = AnyKeys<TRawDocType>> = Array<
    TRawDocType | DocContents
  >;
  export type InsertManyOptions = mongoose.InsertManyOptions & { lean: true };
  export type SaveOptions = mongoose.SaveOptions;
  export type FilterQuery<TRawDocType> = mongoose.FilterQuery<TRawDocType>;
  export type ProjectionType<TRawDocType> =
    mongoose.ProjectionType<TRawDocType>;
  export type QueryOptions<TRawDocType> = mongoose.QueryOptions<TRawDocType>;
  export type QueryWithHelpers<
    ResultType,
    DocType,
    THelpers,
    RawDocType,
    QueryOp
  > = mongoose.QueryWithHelpers<
    ResultType,
    DocType,
    THelpers,
    RawDocType,
    QueryOp
  >;

  export type InsertManyResult<TRawDocType = TRawDocType> =
    Mongoose.InsertManyResult;
  export type HydrateResult<
    TRawDocType,
    THydratedDocumentType = Mongoose.THydratedDocumentType<TRawDocType>
  > = THydratedDocumentType;
  export type PopulateResult<
    TRawDocType,
    THydratedDocumentType = Mongoose.THydratedDocumentType<TRawDocType>
  > = Array<THydratedDocumentType>;
  export type CountDocumentsResult<
    TRawDocType,
    THydratedDocumentType = Mongoose.THydratedDocumentType<TRawDocType>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    number,
    THydratedDocumentType,
    TQueryHelpers,
    TRawDocType,
    "countDocuments"
  >;
  export type ExistsResult<
    TRawDocType,
    THydratedDocumentType = Mongoose.THydratedDocumentType<TRawDocType>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    { _id: Mongoose.InferId<TRawDocType> } | null,
    THydratedDocumentType,
    TQueryHelpers,
    TRawDocType,
    "exists"
  >;
  export type FindResult<
    TRawDocType,
    ResultDoc = Mongoose.THydratedDocumentType<TRawDocType>,
    TQueryHelpers = {}
  > = Promise<
    Mongoose.QueryWithHelpers<
      Array<ResultDoc>,
      ResultDoc,
      TQueryHelpers,
      TRawDocType,
      "find"
    >
  >;
  export type FindByIdResult<
    TRawDocType,
    THydratedDocumentType = Mongoose.THydratedDocumentType<TRawDocType>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    Mongoose.DeleteResult,
    THydratedDocumentType,
    TQueryHelpers,
    TRawDocType,
    "findById"
  >;
  export type FindByIdAndUpdateResult<
    ResultDoc,
    THydratedDocumentType = Mongoose.THydratedDocumentType<ResultDoc>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    Mongoose.ModifyResult<ResultDoc>,
    ResultDoc,
    TQueryHelpers,
    ResultDoc,
    "findByIdAndUpdate"
  > | null;
  export type FindByIdAndDeleteResult<
    TRawDocType,
    THydratedDocumentType = Mongoose.THydratedDocumentType<TRawDocType>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    ResultDoc | null,
    ResultDoc,
    TQueryHelpers,
    TRawDocType,
    "findByIdAndDelete"
  >;
  export type FindOneResult<
    TRawDocType,
    THydratedDocumentType = Mongoose.THydratedDocumentType<TRawDocType>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    Mongoose.DeleteResult,
    THydratedDocumentType,
    TQueryHelpers,
    TRawDocType,
    "findOne"
  >;
  export type FindOneAndUpdateResult<
    ResultDoc,
    THydratedDocumentType = Mongoose.THydratedDocumentType<ResultDoc>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    Mongoose.ModifyResult<ResultDoc>,
    ResultDoc,
    TQueryHelpers,
    ResultDoc,
    "findOneAndUpdate"
  >;
  export type FindOneAndReplaceResult<
    ResultDoc,
    THydratedDocumentType = Mongoose.THydratedDocumentType<ResultDoc>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    Mongoose.ModifyResult<ResultDoc>,
    ResultDoc,
    TQueryHelpers,
    ResultDoc,
    "findOneAndReplace"
  >;
  export type FindOneAndDeleteResult<
    ResultDoc,
    THydratedDocumentType = Mongoose.THydratedDocumentType<ResultDoc>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    ResultDoc | null,
    ResultDoc,
    TQueryHelpers,
    ResultDoc,
    "findOneAndDelete"
  >;
  export type ReplaceOneResult<
    ResultDoc,
    THydratedDocumentType = Mongoose.THydratedDocumentType<ResultDoc>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    Mongoose.UpdateWriteOpResult,
    ResultDoc,
    TQueryHelpers,
    ResultDoc,
    "replaceOne"
  >;
  export type UpdateOneResult<
    ResultDoc,
    THydratedDocumentType = Mongoose.THydratedDocumentType<ResultDoc>,
    TQueryHelpers = {}
  > = Promise<
    Mongoose.QueryWithHelpers<
      Mongoose.UpdateWriteOpResult,
      ResultDoc,
      TQueryHelpers,
      ResultDoc,
      "updateOne"
    >
  >;
  export type UpdateManyResult<
    ResultDoc,
    THydratedDocumentType = Mongoose.THydratedDocumentType<ResultDoc>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    Mongoose.UpdateWriteOpResult,
    ResultDoc,
    TQueryHelpers,
    ResultDoc,
    "updateMany"
  >;
  export type DeleteOne<
    TRawDocType,
    THydratedDocumentType = Mongoose.THydratedDocumentType<TRawDocType>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    Mongoose.DeleteResult,
    THydratedDocumentType,
    TQueryHelpers,
    TRawDocType,
    "deleteOne"
  >;
  export type DeleteMany<
    TRawDocType,
    THydratedDocumentType = Mongoose.THydratedDocumentType<TRawDocType>,
    TQueryHelpers = {}
  > = Mongoose.QueryWithHelpers<
    Mongoose.DeleteResult,
    THydratedDocumentType,
    TQueryHelpers,
    TRawDocType,
    "deleteMany"
  >;
}

export namespace Typeorm {
  export type DataSource = typeorm.DataSource;
  export type DataSourceOptions = typeorm.DataSourceOptions;
  export type EntitySchema<T> = typeorm.EntitySchema<T>;
  export type EntitySchemaOptions<T> = typeorm.EntitySchemaOptions<T>;
  export type DatabaseType = Exclude<"oracle", typeorm.DatabaseType>;
  export type Repository<T> = typeorm.Repository<T>;
}

export namespace Joi {
  export type Root = joi.Root;
}

export namespace IoRedis {
  export type IoRedis = Redis;
  export type IoRedisOptions = RedisOptions;
}

export namespace Jwt {
  export type Algorithm = jwt.Algorithm;
}

export namespace Nodemailer {
  export type Transporter = nodemailer.Transporter<nodemailer.SentMessageInfo>;
  export type SMTPOptions = nodemailer.SMTPTransport.Options;
}

export namespace Ws {
  export type WebSocketServer = ws.WebSocketServer;

  export type FiberSticky = {
    $__fiber__: {
      connectionId: string;
      serverTag: string;
    };
  };
  export type WebSocket = ws.WebSocket & FiberSticky;
  export type RawData = ws.RawData;
}

export namespace Http {
  export type Server = http.Server;
}

export namespace Https {
  export type Server = https.Server;
}

export namespace Seeds {
  export type IAbstractDiscoveryService =
    SeedsDiscovery.IAbstractDiscoveryService;
}

export namespace RabbitMQ {
  export type Connection = libAmqp.Connection;
  export type Channel = libAmqp.Channel;
  export type QueueOptions = libAmqp.Options.AssertQueue;
  export type ExchangeOptions = libAmqp.Options.AssertExchange;
  export type ConsumeOptions = libAmqp.Options.Consume;
  export type Message = libAmqp.Message;
}

export namespace WorkerPool {
  export type WorkerPool = workerpool.Pool;
  export type WorkerPoolOptions = workerpool.WorkerPoolOptions;
}

// internal
import libEvents from "events";
import libHttp from "http";
import libHttps from "https";
import libAsync_hooks from "async_hooks";
import libCrypto from "crypto";

// external
import colors from "colors";
import { Container, ContainerModule } from "inversify";
import { DataSource, EntitySchema } from "typeorm";
import libJwt from "jsonwebtoken";
import { format } from "date-fns";
import libMongoose from "mongoose";
import libBcrypt from "bcrypt";
import libWinston from "winston";
import libJoi from "joi";
import libNodemailer from "nodemailer";
import libFastify from "fastify";
import libIoredis from "ioredis";
import libWs from "ws";
import { v4 } from "uuid";
import libAmqp from "amqplib/callback_api";
import libWorkerpool from "workerpool";

export { injectable, inject } from "inversify";

export const inversify = {
  ContainerModule,
  Container,
};

export const typeorm = {
  DataSource,
  EntitySchema,
};

export const winston = {
  format: libWinston.format,
  Logger: libWinston.Logger,
  transports: libWinston.transports,
  Container: libWinston.Container,
  addColors: libWinston.addColors,
};

export const events = {
  EventEmitter: libEvents.EventEmitter,
};

export const joi = {
  joi: libJoi,
};

export const async_hooks = {
  AsyncLocalStorage: libAsync_hooks.AsyncLocalStorage,
};

export const jwt = {
  TokenExpiredError: libJwt.TokenExpiredError,
  sign: libJwt.sign,
  verify: libJwt.verify,
};
export const crypto = {
  randomBytes: libCrypto.randomBytes,
  createHash: libCrypto.createHash,
};

export const bcrypt = {
  compare: libBcrypt.compare,
  hash: libBcrypt.hash,
};

export const dateFns = {
  format: format,
};

export const mongoose = {
  connect: libMongoose.connect,
};

export const rabbitMQ = {
  connect: libAmqp.connect,
};

export const nodemailer = {
  createTransport: libNodemailer.createTransport,
};

export const uuid = {
  v4,
};

export const http = {
  createServer: libHttp.createServer,
};

export const https = {
  createServer: libHttps.createServer,
};

export const fastify = {
  fastify: libFastify,
};

export const ws = {
  WebSocketServer: libWs.WebSocketServer,
};

export const ioredis = {
  ioredis: libIoredis,
};

export const workerpool = {
  pool: libWorkerpool.pool,
};

export { colors };

export { AbstractDiscoveryService } from "@chaminjector/seeds-discovery-service";

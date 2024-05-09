import { AnyObject } from "../utils";
import { IAbstractService, NAbstractService } from "./abstract.service";

export interface IDiscoveryService extends IAbstractService {
  readonly serverTag: string;

  on(event: NDiscoveryService.Event, listener: NAbstractService.Listener): void;
  reloadConfigurations(): Promise<void>;

  getMandatory<T>(
    name: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, T>
  ): T;
  getString(
    name: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, string>,
    def: string
  ): string;
  getNumber(
    name: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, number>,
    def: number
  ): number;
  getBoolean(
    name: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, boolean>,
    def: boolean
  ): boolean;
  getArray<T>(name: string, def: Array<T>): Array<T>;
  getCertificateBuffer(
    name: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, string>
  ): Promise<Buffer>;
  getCertificateString(
    name: NDiscoveryService.KeyBuilder<NDiscoveryService.CoreConfig, string>
  ): Promise<string>;

  getSchemaMandatory<T, C extends AnyObject = AnyObject>(
    name: NDiscoveryService.KeyBuilder<C, T>
  ): T;
  getSchemaString<C extends AnyObject = AnyObject>(
    name: NDiscoveryService.KeyBuilder<C, string>,
    def: string
  ): string;
  getSchemaNumber<C extends AnyObject = AnyObject>(
    name: NDiscoveryService.KeyBuilder<C, number>,
    def: number
  ): number;
  getSchemaBoolean<C extends AnyObject = AnyObject>(
    name: NDiscoveryService.KeyBuilder<C, boolean>,
    def: boolean
  ): boolean;
  getSchemaArray<T, C extends AnyObject = AnyObject>(
    name: NDiscoveryService.KeyBuilder<C, Array<T>>,
    def: Array<T>
  ): Array<T>;
  getSchemaBuffer<C extends AnyObject = AnyObject>(
    path: NDiscoveryService.KeyBuilder<C, string>
  ): Promise<Buffer>;
}

export namespace NDiscoveryService {
  export type Event =
    | "service:DiscoveryService:start"
    | "service:DiscoveryService:reload";

  export type KeyBuilder<
    T,
    F extends string | boolean | number
  > = T extends Record<string, unknown>
    ? {
        [K in keyof T]: T[K] extends F
          ? `${string & K}`
          : K extends string
          ? `${string & K}.${KeyBuilder<T[K], F>}`
          : never;
      }[keyof T]
    : string;

  export type TypeormDatabaseType = "mysql" | "mariadb" | "postgres" | "sqlite";
  export type CredentialsOptions = {
    protocol: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };

  export type MySqlOptions = {
    type: "mysql" | "mariadb";
    credentials: CredentialsOptions;
    options: {
      timezone: string;
      connectTimeout: number;
      acquireTimeout: number;
      insecureAuth: boolean;
      supportBigNumbers: boolean;
      bigNumberStrings: boolean;
      dateStrings: boolean | string[];
      debug: boolean | string[];
      trace: boolean;
      multipleStatements: boolean;
      legacySpatialSupport: boolean;
      connectorPackage: "mysql" | "mariadb";
      replication: {
        master: CredentialsOptions;
        slaves: CredentialsOptions[];
        canRetry: boolean;
        removeNodeErrorCount: number;
        restoreNodeTimeout: number;
        selector: "RR" | "RANDOM" | "ORDER";
      };
    };
  };

  export type PostgresOptions = {
    credentials: CredentialsOptions;
    options: {
      schema: string;
      useUTC: boolean;
      connectTimeoutMS: number;
      uuidExtension: "pgcrypto" | "uuid-ossp";
      logNotifications: boolean;
      installExtensions: boolean;
      applicationName: string;
      parseInt8: boolean;
      replication: {
        master: CredentialsOptions;
        slaves: CredentialsOptions[];
      };
    };
  };

  export type SqlLiteOptions = {
    database: string;
    key: string;
    busyErrorRetry: number;
    enableWAL: boolean;
    flags: number;
    busyTimeout: number;
  };

  export type CoreConfig = {
    connectors: {
      mongodb: {
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
        options: {
          bufferCommands: boolean;
          autoIndex: boolean;
          autoCreate: boolean;
          tls: {
            enable: boolean;
            tlsCertificateFile: string;
            tlsCertificateKeyFile: string;
            tlsCertificateKeyFilePassword: string;
            tlsCAFile: string;
            tlsAllowInvalidCertificates: boolean;
            tlsInsecure: boolean;
          };
          replicaSet: string;
          replicates: { host: string; port: number }[];
          connectTimeoutMS: number;
          socketTimeoutMS: number;
          zlibCompressionLevel: number;
          maxPoolSize: number;
          minPoolSize: number;
          maxConnecting: number;
          maxIdleTimeMS: number;
          waitQueueTimeoutMS: number;
          serverSelectionTimeoutMS: number;
          heartbeatFrequencyMS: number;
          minHeartbeatFrequencyMS: number;
          retryReads: boolean;
          retryWrites: boolean;
          readConcernLevel:
            | "local"
            | "majority"
            | "linearizable"
            | "available"
            | "snapshot";
          readPreference:
            | "primary"
            | "primaryPreferred"
            | "secondary"
            | "secondaryPreferred"
            | "nearest";
        };
      };
      typeorm: {
        enable: boolean;
        type: TypeormDatabaseType;
        mysql: MySqlOptions;
        postgres: PostgresOptions;
        sqlite: SqlLiteOptions;
      };
      redis: {
        enable: boolean;
        connect: {
          protocol: string;
          host: string;
          port: number;
        };
        options: {
          keyPrefix: string;
          showFriendlyErrorStack: boolean;
          retryTimeout: number;
          retryCount: number;
          common: {
            commandTimeout: number;
            keepAlive: number;
            noDelay: boolean;
            connectionName: string;
            username: string;
            password: string;
            autoResendUnfulfilledCommands: boolean;
            connectTimeout: number;
            maxRetriesPerRequest: number;
            maxLoadingRetryTime: number;
            enableAutoPipelining: boolean;
            autoPipeliningIgnoredCommands: string[];
            enableOfflineQueue: boolean;
            enableReadyCheck: boolean;
          };
          sentinel: {
            name: string;
            role: string;
            sentinelUsername: string;
            sentinelPassword: string;
            sentinels: Array<{ port: number; host: string; family?: number }>;
            connectTimeout: number;
            disconnectTimeout: number;
            sentinelCommandTimeout: number;
            enableTLSForSentinelMode: boolean;
            updateSentinels: boolean;
            sentinelMaxConnections: number;
            failoverDetector: boolean;
          };
        };
      };
      rabbitMQ: {
        enable: boolean;
        protocol: string;
        host: string;
        port: number;
        username: string;
        password: string;
        locale: string;
        frameMax: number;
        heartBeat: number;
        vhost: string;
      };
    };
    adapters: {
      serverTag: string;
      http: {
        enable: boolean;
        kind: string;
        protocol: string;
        host: string;
        port: number;
        https: {
          key: string;
          cert: string;
        };
        fastify: {
          connectionTimeout: number;
          keepAliveTimeout: number;
          maxRequestsPerSocket: number;
          forceCloseConnections: boolean;
          requestTimeout: number;
          bodyLimit: number;
        };
        urls: {
          api: string;
        };
      };
      ws: {
        enable: boolean;
        kind: string;
        protocol: string;
        host: string;
        port: number;
        wss: {
          key: string;
          cert: string;
        };
        ws: {
          backlog: number;
          maxPayload: number;
          skipUTF8Validation: boolean;
          perMessageDeflate: {
            enable: boolean;
            serverNoContextTakeover: boolean;
            serverMaxWindowBits: number;
            threshold: number;
            concurrencyLimit: number;
          };
        };
      };
    };
    integrations: {
      mail: {
        enable: boolean;
        host: string;
        port: number;
        secure: {
          enable: boolean;
          auth: {
            user: string;
            pass: string;
          };
        };
        contact: {
          from: string;
        };
        withMessageId: boolean;
      };
    };
    services: {
      localization: {
        enable: boolean;
        supportedLanguages: string[];
        defaultLanguages: string;
      };
      logger: {
        enable: boolean;
        loggers: {
          core: boolean;
          schema: boolean;
        };
        transports: {
          console: {
            core: {
              enable: boolean;
              level: string;
            };
            schema: {
              enable: boolean;
              level: string;
            };
          };
        };
      };
      scrambler: {
        enable: boolean;
        salt: number;
        secret: string;
        randomBytes: number;
        accessExpiredAt: number;
        refreshExpiredAt: number;
        defaultAlgorithm: string;
      };
    };
  };
}

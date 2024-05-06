import { inversify } from "~packages";
import { CoreSymbols } from "~symbols";

import { Initiator } from "../initiator";
import {
  IntegrationConnector,
  RedisConnector,
  TypeormConnector,
  MongoConnector,
  ComputeConnector,
} from "../connectors";
import {
  SchemaLoader,
  FunctionalityAgent,
  SchemaAgent,
  IntegrationAgent,
} from "~ba-communication";
import {
  ContextService,
  DiscoveryService,
  ConfigurationService,
  LocalizationProvider,
  LoggerService,
  PermissionProvider,
  SchemaService,
  ScramblerService,
  SessionService,
  MailIntegration,
  ExceptionProvider,
  MongoTunnel,
  TypeormTunnel,
  RedisTunnel,
  FastifyHttpAdapter,
  HttpFactory,
  WsFactory,
  WsAdapter,
} from "~fn-components";

import type {
  Inversify,
  IAbstractFactory,
  IAbstractHttpAdapter,
  IContextService,
  IExceptionProvider,
  IFunctionalityAgent,
  IInitiator,
  ILoggerService,
  IMongoConnector,
  IMongoTunnel,
  ISchemaAgent,
  ISchemaLoader,
  ISchemaService,
  IComputeConnector,
  ITypeormConnector,
  ITypeormTunnel,
  IRedisConnector,
  IRedisTunnel,
  IScramblerService,
  ISessionService,
  ILocalizationProvider,
  IMailIntegration,
  IIntegrationConnector,
  IIntegrationAgent,
  IAbstractWsAdapter,
  IDiscoveryService,
  IAbstractService,
  IPermissionProvider,
} from "~types";

export const CoreModule = new inversify.ContainerModule(
  (bind: Inversify.interfaces.Bind) => {
    // Initiator
    bind<IInitiator>(CoreSymbols.Initiator).to(Initiator).inRequestScope();

    // Connectors
    bind<IComputeConnector>(CoreSymbols.ServiceConnector)
      .to(ComputeConnector)
      .inSingletonScope();
    bind<IMongoConnector>(CoreSymbols.MongoConnector)
      .to(MongoConnector)
      .inSingletonScope();
    bind<ITypeormConnector>(CoreSymbols.TypeormConnector)
      .to(TypeormConnector)
      .inSingletonScope();
    bind<IRedisConnector>(CoreSymbols.RedisConnector)
      .to(RedisConnector)
      .inSingletonScope();
    bind<IIntegrationConnector>(CoreSymbols.IntegrationConnector)
      .to(IntegrationConnector)
      .inSingletonScope();

    // Services
    bind<IDiscoveryService>(CoreSymbols.DiscoveryService)
      .to(DiscoveryService)
      .inSingletonScope();
    bind<ILoggerService>(CoreSymbols.LoggerService)
      .to(LoggerService)
      .inSingletonScope();
    bind<ISchemaService>(CoreSymbols.SchemaService)
      .to(SchemaService)
      .inSingletonScope();
    bind<IContextService>(CoreSymbols.ContextService)
      .to(ContextService)
      .inSingletonScope();
    bind<IScramblerService>(CoreSymbols.ScramblerService)
      .to(ScramblerService)
      .inSingletonScope();
    bind<ISessionService>(CoreSymbols.SessionService)
      .to(SessionService)
      .inSingletonScope();
    bind<IAbstractService>(CoreSymbols.GetawayService)
      .to(ConfigurationService)
      .inSingletonScope();

    // Providers
    bind<IExceptionProvider>(CoreSymbols.ExceptionProvider)
      .to(ExceptionProvider)
      .inTransientScope();
    bind<ILocalizationProvider>(CoreSymbols.LocalizationProvider)
      .to(LocalizationProvider)
      .inSingletonScope();
    bind<IPermissionProvider>(CoreSymbols.PermissionProvider)
      .to(PermissionProvider)
      .inSingletonScope();

    // Tunnels
    bind<IMongoTunnel>(CoreSymbols.MongoTunnel)
      .to(MongoTunnel)
      .inTransientScope();
    bind<ITypeormTunnel>(CoreSymbols.TypeormTunnel)
      .to(TypeormTunnel)
      .inTransientScope();
    bind<IRedisTunnel>(CoreSymbols.RedisTunnel)
      .to(RedisTunnel)
      .inTransientScope();

    // Integrations
    bind<IMailIntegration>(CoreSymbols.MailIntegration)
      .to(MailIntegration)
      .inSingletonScope();

    // Loaders
    bind<ISchemaLoader>(CoreSymbols.SchemaLoader)
      .to(SchemaLoader)
      .inSingletonScope();

    // Agents
    bind<ISchemaAgent>(CoreSymbols.SchemaAgent)
      .to(SchemaAgent)
      .inTransientScope();
    bind<IIntegrationAgent>(CoreSymbols.IntegrationAgent)
      .to(IntegrationAgent)
      .inTransientScope();
    bind<IFunctionalityAgent>(CoreSymbols.FunctionalityAgent)
      .to(FunctionalityAgent)
      .inTransientScope();

    // Adapters
    bind<IAbstractHttpAdapter>(CoreSymbols.FastifyAdapter)
      .to(FastifyHttpAdapter)
      .inSingletonScope();
    bind<IAbstractWsAdapter>(CoreSymbols.WsAdapter)
      .to(WsAdapter)
      .inSingletonScope();

    // Factories
    bind<IAbstractFactory>(CoreSymbols.HttpFactory)
      .to(HttpFactory)
      .inSingletonScope();
    bind<IAbstractFactory>(CoreSymbols.WsFactory)
      .to(WsFactory)
      .inSingletonScope();
  }
);

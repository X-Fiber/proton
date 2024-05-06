export const CoreSymbols = {
  // Initiator
  Initiator: Symbol("Initiator"),

  // Connectors
  ServiceConnector: Symbol("ServiceConnector"),
  MongoConnector: Symbol("MongoConnector"),
  TypeormConnector: Symbol("TypeormConnector"),
  RedisConnector: Symbol("RedisConnector"),
  IntegrationConnector: Symbol("IntegrationConnector"),

  // Services
  DiscoveryService: Symbol("DiscoveryService"),
  LoggerService: Symbol("LoggerService"),
  SchemaService: Symbol("SchemaService"),
  GetawayService: Symbol("GetawayService"),
  ContextService: Symbol("ContextService"),
  ScramblerService: Symbol("ScramblerService"),
  SessionService: Symbol("SessionService"),

  // Providers
  ExceptionProvider: Symbol("ExceptionProvider"),
  LocalizationProvider: Symbol("LocalizationProvider"),
  PermissionProvider: Symbol("PermissionProvider"),

  // Tunnels
  MongoTunnel: Symbol("MongoTunnel"),
  TypeormTunnel: Symbol("TypeormTunnel"),
  RedisTunnel: Symbol("RedisTunnel"),

  // Integrations
  MailIntegration: Symbol("MailIntegration"),

  // Loader
  SchemaLoader: Symbol("SchemaLoader"),

  // Agents
  FunctionalityAgent: Symbol("FunctionalityAgent"),
  SchemaAgent: Symbol("SchemaAgent"),
  IntegrationAgent: Symbol("IntegrationAgent"),

  // Adapters
  FastifyAdapter: Symbol("FastifyAdapter"),
  WsAdapter: Symbol("WsAdapter"),

  // Factories
  HttpFactory: Symbol("HttpFactory"),
  WsFactory: Symbol("WsFactory"),
} as const;

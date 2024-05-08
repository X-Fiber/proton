export const CoreSymbols = {
  // Initiator
  Initiator: Symbol("Initiator"),

  // Connectors
  ServiceConnector: Symbol("ServiceConnector"),
  IntegrationConnector: Symbol("IntegrationConnector"),
  MongoConnector: Symbol("MongoConnector"),
  TypeormConnector: Symbol("TypeormConnector"),
  RedisConnector: Symbol("RedisConnector"),
  RabbitMQConnector: Symbol("RabbitMQConnector"),

  // Services
  DiscoveryService: Symbol("DiscoveryService"),
  LoggerService: Symbol("LoggerService"),
  SchemaService: Symbol("SchemaService"),
  CombinationService: Symbol("CombinationService"),
  ContextService: Symbol("ContextService"),
  ScramblerService: Symbol("ScramblerService"),
  SessionProvider: Symbol("SessionProvider"),

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

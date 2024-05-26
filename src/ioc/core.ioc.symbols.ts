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
  SchemeService: Symbol("SchemeService"),
  CombinationService: Symbol("CombinationService"),
  ContextService: Symbol("ContextService"),
  ScramblerService: Symbol("ScramblerService"),
  TaskService: Symbol("TaskService"),
  StreamService: Symbol("StreamService"),
  ManagerService: Symbol("ManagerService"),

  // Providers
  ExceptionProvider: Symbol("ExceptionProvider"),
  LocalizationProvider: Symbol("LocalizationProvider"),
  PermissionProvider: Symbol("PermissionProvider"),
  SessionProvider: Symbol("SessionProvider"),
  CacheProvider: Symbol("CacheProvider"),

  // Tunnels
  MongoTunnel: Symbol("MongoTunnel"),
  TypeormTunnel: Symbol("TypeormTunnel"),
  RedisTunnel: Symbol("RedisTunnel"),
  RabbitMQTunnel: Symbol("RabbitMQTunnel"),

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
  FileStorageFactory: Symbol("FileStorageFactory"),

  // Strategies
  BufferFileStorageStrategy: Symbol("BufferFileStorageStrategy"),
  RedisFileStorageStrategy: Symbol("RedisFileStorageStrategy"),
} as const;

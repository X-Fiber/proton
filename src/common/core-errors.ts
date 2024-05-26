/**
/ error code structure - "0001.0001.0001" where
/ - first element - abstraction level code (connectors, fn-components, etc.)
/ - second element - module identifier (HttpAdapter, RabbitMQConnector, etc.)
/ - third element - error type identifier (SERVICE_NOT_FOUND, EMPTY_ROUTES_MAP, etc.)
/ */

export const ErrorCodes = {
  conn: {},
  fn: {
    HttpAdapter: {
      SERVICE_NOT_FOUND: "0002.0001.0001",
      DOMAIN_NOT_FOUND: "0002.0001.0002",
      HEADER_IS_REQUIRED: "0002.0001.0004",
      DYNAMIC_PARAM_IS_REQUIRED: "0002.0001.0005",
      QUERY_PARAM_IS_REQUIRED: "0002.0001.0006",
      MISSED_AUTH_TOKEN: "0002.0001.0007",
      AUTH_TOKEN_EXPIRED: "0002.0001.0008",
      EMPTY_ROUTES_MAP: "0002.0001.0009",
      ROUTE_NOT_FOUND: "0002.0001.0010",
      EMPTY_STREAM_MAP: "0002.0001.0011",
      STREAM_NOT_FOUND: "0002.0001.0012",
      TOO_LARGE_FILE: "0002.0001.0013",
      ETAG_REQUIRED: "0002.0001.0014",
      UNSUPPORTED_PROTOCOL: "0002.0001.9990",
      INTERNAL_SERVER_ERROR: "0002.0001.9991",
    },
    WsAdapter: {
      UNSUPPORTED_PROTOCOL: "0002.0002.9990",
      CATCH: "0002.0002.9999",
    },
  },
  ba: {},
} as const;

export const CommunicateCodes = {
  ws: {
    HANDSHAKE_SUCCESSFUL: "0002.0001.0000",
    INVALID_DATA_STRUCTURE: "0002.0001.0001",
    UNKNOWN_EVENT_KIND: "0002.0001.0002",
    SERVICE_NOT_FOUND: "0002.0001.0003",
    DOMAIN_NOT_FOUND: "0002.0001.0004",
    EVENT_NOT_FOUND: "0002.0001.0005",
  },
} as const;

export const ManagerCodes = {
  validation: {
    SCOPE_NOT_FOUND: "0001.0.0001",
    COMMAND_NOT_FOUND: "0001.0.0002",
    SECRET_NOT_FOUND: "0001.0.0003",
    USER_NOT_FOUND: "0001.0.0004",
  },
  auth: {
    NOT_SUPPORTED_ENTITY: "0002.0.0001",
    SUCCESS: "0002.1.0001",
  },
};

import { injectable, uuid } from "~packages";
import { ErrorCodes, ResponseType, StatusCode } from "~common";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { Helpers } from "~utils";

import type {
  Fastify,
  UnknownObject,
  IDiscoveryService,
  ILoggerService,
  IContextService,
  NContextService,
  IAbstractHttpAdapter,
  NAbstractHttpAdapter,
  IFunctionalityAgent,
  ISchemeService,
  NSchemeService,
  ISessionProvider,
  IScramblerService,
  NScramblerService,
  ISchemeAgent,
  IIntegrationAgent,
} from "~types";

@injectable()
export abstract class AbstractHttpAdapter<
  K extends NAbstractHttpAdapter.AdapterKind
> implements IAbstractHttpAdapter
{
  protected abstract readonly _ADAPTER_NAME: string;
  protected abstract _instance:
    | NAbstractHttpAdapter.AdapterInstance<K>
    | undefined;
  protected abstract _config: NAbstractHttpAdapter.Config;
  protected abstract _setConfig(): void;

  protected abstract _discoveryService: IDiscoveryService;
  protected abstract _loggerService: ILoggerService;
  protected abstract _contextService: IContextService;
  protected abstract _schemaService: ISchemeService;
  protected abstract _scramblerService: IScramblerService;

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;

  protected abstract _callApi(
    req: NAbstractHttpAdapter.AdapterRequest<K>,
    context: NAbstractHttpAdapter.Context<UnknownObject>
  ): Promise<NAbstractHttpAdapter.AdapterResponse<K>>;

  protected _getDomainStorage(
    service: string,
    domain: string
  ): NAbstractHttpAdapter.StorageResult {
    const sStorage = this._schemaService.schema.get(service);
    if (!sStorage) {
      return {
        type: "fail",
        message: this._buildApiMessage(
          ErrorCodes.fn.HttpAdapter.SERVICE_NOT_FOUND,
          `Service '${sStorage}' not found. Supported services: ${Array.from(
            this._schemaService.schema.keys()
          )}`
        ),
      };
    }

    const dStorage = sStorage.get(domain);
    if (!dStorage) {
      return {
        type: "fail",
        message: this._buildApiMessage(
          ErrorCodes.fn.HttpAdapter.DOMAIN_NOT_FOUND,
          `Domain '${domain}' not found in '${sStorage}' service. Supported domains: ${Array.from(
            sStorage.keys()
          )}`
        ),
      };
    }

    return { type: "success", domain: dStorage };
  }

  protected _buildApiMessage(
    code: string,
    message: string
  ): NAbstractHttpAdapter.ValidateMessage {
    return { type: "FAIL", code, message };
  }

  protected _formedStore(req: Fastify.Request): NContextService.RouteStore {
    return {
      service: req.params.service,
      domain: req.params.domain,
      action: req.params.action,
      version: req.params.version,
      method: req.method,
      path: req.url,
      ip: req.ip,
      requestId: uuid.v4(),
      schema: this._schemaService.schema,
      language: req.headers["accept-language"],
    };
  }

  protected _getHeaders(
    reqHhs: Record<string, string>,
    hhs: NSchemeService.HeaderParams[] | null,
    res: Fastify.Response
  ) {
    let headers: Record<string, string | null> = {};
    if (hhs && hhs.length > 0) {
      headers = hhs.reduce(
        (
          acc: { [key: string]: string | null },
          header: NSchemeService.HeaderParams
        ) => {
          const h: string | null = reqHhs[header.name];
          switch (header.scope) {
            case "required":
              if (!h) {
                return res
                  .status(StatusCode.BAD_REQUEST)
                  .send(
                    this._buildApiMessage(
                      ErrorCodes.fn.HttpAdapter.HEADER_IS_REQUIRED,
                      `Header '${header.name}' is required`
                    )
                  );
              }
              acc[header.name] = h;
              break;
            case "optional":
              acc[header.name] = h ?? null;
              break;
            default:
              throw Helpers.switchChecker(header.scope);
          }
          return acc;
        },
        {}
      );
    }
    return headers;
  }

  protected _getParams(
    param: { "*": string },
    aParams: NSchemeService.RouteParams[] | null,
    res: Fastify.Response
  ) {
    let params: Record<string, string | null> = {};
    const dynamicParams = param["*"];
    if (
      aParams &&
      aParams.length > 0 &&
      dynamicParams &&
      dynamicParams.length > 0
    ) {
      const dynamic: string[] = dynamicParams.split("/");

      const obj: Record<
        string,
        { scope: "required" | "optional"; value: string }
      > = {};
      aParams.forEach(
        (p, i) => (obj[p.name] = { scope: p.scope, value: dynamic[i] })
      );

      params = aParams.reduce(
        (
          acc: Record<string, string | null>,
          param: NSchemeService.RouteParams
        ) => {
          const parameter = obj[param.name];
          switch (parameter.scope) {
            case "required":
              if (!parameter.value) {
                return res
                  .status(StatusCode.BAD_REQUEST)
                  .send(
                    this._buildApiMessage(
                      ErrorCodes.fn.HttpAdapter.DYNAMIC_PARAM_IS_REQUIRED,
                      `Header '${param.name}' is required`
                    )
                  );
              } else {
                acc[param.name] = parameter.value;
              }
              break;
            case "optional":
              acc[param.name] = parameter.value ?? null;
              break;
          }
          return acc;
        },
        {}
      );
    }

    return params;
  }

  protected async _getContext(
    store: NContextService.RouteStore,
    scope: NSchemeService.AuthScope,
    req: Fastify.Request,
    res: Fastify.Response
  ): Promise<NAbstractHttpAdapter.Context> {
    const context: NAbstractHttpAdapter.Context = {
      store: store,
      user: {},
      system: {},
    };

    const sessions = container.get<ISessionProvider>(
      CoreSymbols.SessionProvider
    );

    switch (scope) {
      case "public:route":
        break;
      case "private:user":
        const accessToken = req.headers["x-user-access-token"];
        if (!accessToken) {
          return res.status(StatusCode.FORBIDDEN).send({
            responseType: ResponseType.AUTHENTICATED,
            data: {
              code: ErrorCodes.fn.HttpAdapter.MISSED_AUTH_TOKEN,
              message: "Missed user access token",
            },
          });
        }
        const jwtPayload = await this._scramblerService.verifyToken<
          UnknownObject & NScramblerService.SessionIdentifiers
        >(accessToken);

        context.user = {
          userId: jwtPayload.payload.userId,
          sessionId: jwtPayload.payload.sessionId,
          ...(await sessions.getById<any>(jwtPayload.payload.sessionId)),
        };
        break;
      case "private:system":
        const accessToken2 = req.headers["x-user-access-token"];
        if (!accessToken2) {
          return res.status(StatusCode.FORBIDDEN).send({
            responseType: ResponseType.AUTHENTICATED,
            data: {
              code: ErrorCodes.fn.HttpAdapter.MISSED_AUTH_TOKEN,
              message: "Missed user access token",
            },
          });
        }
        const jwtPayload2 = await this._scramblerService.verifyToken<
          UnknownObject & NScramblerService.SessionIdentifiers
        >(accessToken2);

        context.user = {
          userId: jwtPayload2.payload.userId,
          sessionId: jwtPayload2.payload.sessionId,
          ...(await sessions.getById<any>(jwtPayload2.payload.sessionId)),
        };

        break;
    }

    return context;
  }

  protected _getAgents(): NSchemeService.Agents {
    return {
      fnAgent: container.get<IFunctionalityAgent>(
        CoreSymbols.FunctionalityAgent
      ),
      schemaAgent: container.get<ISchemeAgent>(CoreSymbols.SchemaAgent),
      inAgent: container.get<IIntegrationAgent>(CoreSymbols.IntegrationAgent),
    };
  }
}

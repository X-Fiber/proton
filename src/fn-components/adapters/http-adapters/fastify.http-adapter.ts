import { injectable, inject, fastify, uuid, jwt } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { Helpers, Guards } from "~utils";
import { ResponseType, SchemaHeaders, StatusCode } from "~common";

import { AbstractHttpAdapter } from "./abstract.http-adapter";

import {
  Fastify,
  HttpMethod,
  ModeObject,
  UnknownObject,
  IContextService,
  IDiscoveryService,
  ILoggerService,
  IAbstractHttpAdapter,
  NAbstractHttpAdapter,
  IFunctionalityAgent,
  NContextService,
  ISchemaAgent,
  IExceptionProvider,
  IScramblerService,
  ISessionService,
  NScramblerService,
  ILocalizationProvider,
  IIntegrationAgent,
  NSchemaService,
} from "~types";

@injectable()
export class FastifyHttpAdapter
  extends AbstractHttpAdapter<"fastify">
  implements IAbstractHttpAdapter
{
  protected readonly _ADAPTER_NAME = FastifyHttpAdapter.name;
  protected _config: NAbstractHttpAdapter.Config;
  protected _instance:
    | NAbstractHttpAdapter.AdapterInstance<"fastify">
    | undefined;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ContextService)
    protected readonly _contextService: IContextService,
    @inject(CoreSymbols.ScramblerService)
    private readonly _scramblerService: IScramblerService,
    @inject(CoreSymbols.SessionService)
    private readonly _sessionService: ISessionService,
    @inject(CoreSymbols.LocalizationProvider)
    private readonly _localizationService: ILocalizationProvider
  ) {
    super();

    this._config = {
      enable: false,
      kind: "fastify",
      serverTag: "ANONYMOUS_01",
      protocol: "http",
      host: "0.0.0.0",
      port: 11000,
      urls: {
        api: "/v1/call/api",
      },
    };
  }

  protected _setConfig(): void {
    this._config = {
      enable: this._discoveryService.getBoolean(
        "adapters.http.enable",
        this._config.enable
      ),
      kind: this._discoveryService.getString(
        "adapters.http.kind",
        this._config.kind
      ),
      serverTag: this._discoveryService.getString(
        "adapters.http.serverTag",
        this._config.serverTag
      ),
      protocol: this._discoveryService.getString(
        "adapters.http.protocol",
        this._config.protocol
      ),
      host: this._discoveryService.getString(
        "adapters.http.host",
        this._config.host
      ),
      port: this._discoveryService.getNumber(
        "adapters.http.port",
        this._config.port
      ),
      urls: {
        api: this._discoveryService.getString(
          "adapters.http.urls.api",
          this._config.urls.api
        ),
      },
    };
  }

  public async start(): Promise<void> {
    this._setConfig();

    this._instance = fastify.fastify({
      ignoreTrailingSlash: true,
      ignoreDuplicateSlashes: true,
    });
    this._instance.all(this._config.urls.api + "*", this._apiHandler);

    this._instance.addHook(
      "onRequest",
      (
        request: Fastify.Request,
        reply: Fastify.Response,
        done: () => void
      ): void => {
        reply.headers(this._corsHeaders());

        if (request.method === "OPTIONS") {
          reply.status(200).send();
          return;
        }

        done();
      }
    );

    const { protocol, host, port } = this._config;

    try {
      await this._instance.listen({ host, port }, () => {
        this._loggerService.system(
          `Http server listening on ${protocol}://${host}:${port}`,
          {
            scope: "Core",
            namespace: this._ADAPTER_NAME,
            tag: "Connection",
          }
        );
      });
    } catch (e) {
      console.error(e);
    }
  }

  private _corsHeaders() {
    const httpMethods: HttpMethod[] = [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "HEAD",
      "OPTIONS",
      "TRACE",
    ];
    const standardHeaders = ["Content-Type", "Authorization"];
    const schemaHeaders: (typeof SchemaHeaders)[keyof typeof SchemaHeaders][] =
      [
        "x-service-name",
        "x-service-version",
        "x-domain-name",
        "x-action-name",
        "x-action-version",
      ];
    const tokenHeaders = ["x-user-access-token", "x-user-refresh-token"];
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": httpMethods.join(", "),
      "Access-Control-Allow-Headers":
        standardHeaders.join(", ") +
        ", " +
        schemaHeaders.join(", ") +
        ", " +
        tokenHeaders.join(", "),
      "Access-Control-Expose-Headers": tokenHeaders.join(", "),
    };
  }

  public async stop(): Promise<void> {
    if (!this._instance) return;

    await this._instance.close();
    this._instance = undefined;

    this._loggerService.system(`Http server has been stopped.`, {
      scope: "Core",
      namespace: this._ADAPTER_NAME,
      tag: "Destroy",
    });
  }

  protected _apiHandler = async (
    req: NAbstractHttpAdapter.AdapterRequest<"fastify">,
    res: NAbstractHttpAdapter.AdapterResponse<"fastify">
  ): Promise<void> => {
    // const chunks = req.url
    //   .replace(this._config.urls.api, "")
    //   .replace(/\/{2,}/g, "/")
    //   .substring(1)
    //   .split("/");
    //
    // if (chunks.length >= 4) {
    //   console.log("assasaas");
    // }
    //
    // const service1 = chunks[0]
    // const domain1 = chunks[1]
    // const version1 = chunks[2]
    // const action1 = chunks[3]

    const schemaResult = this._resolveSchemaHeaders(req.headers);
    if (!schemaResult.ok) {
      return res.status(StatusCode.BAD_REQUEST).send({
        ResponseType: ResponseType.FAIL,
        data: {
          message: schemaResult.message,
        },
      });
    }

    const service = this._contextService.store.schema.get(schemaResult.service);
    if (!service) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .send(this._getNotFoundStructure("service"));
    }

    const domain = service.get(schemaResult.domain);
    if (!domain) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .send(this._getNotFoundStructure("domain"));
    }

    if (!domain.routes) {
      return res.status(StatusCode.BAD_REQUEST).send({
        responseType: ResponseType.FAIL,
        data: {
          message: "Domain does not have any routes",
        },
      });
    }

    const act = schemaResult.action + "{{" + req.method.toUpperCase() + "}}";
    const action = domain.routes.get(act);
    if (!action) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .send(this._getNotFoundStructure("action"));
    }

    const inputParams: string[] = [];
    if (req.url.includes("?")) {
      const [params] = req.url.split("?");

      inputParams.push(
        ...params
          .replace(this._config.urls.api, "")
          .split("/")
          .filter((p: string) => p.length > 0)
      );
    } else {
      inputParams.push(
        ...req.url
          .replace(this._config.urls.api, "")
          .split("/")
          .filter((p: string) => p.length > 0)
      );
    }

    let params: Record<string, string> = {};
    if (action.params && inputParams.length > 0) {
      params = action.params.reduce(
        (
          obj: Record<string, string>,
          k: NSchemaService.RouteParams,
          i: number
        ) => {
          obj[k["name"]] = inputParams[i];
          return obj;
        },
        {}
      );
    }

    let queries: ModeObject = {};
    if (req.query) {
      queries = Helpers.parseQueryParams(Object.assign({}, req.query));
    }

    const acceptLanguage = req.headers["accept-language"];

    const store: NContextService.Store = {
      service: schemaResult.service,
      domain: schemaResult.domain,
      action: schemaResult.action,
      method: req.method,
      path: req.url,
      ip: req.ip,
      requestId: uuid.v4(),
      schema: this._contextService.store.schema,
      language: acceptLanguage,
    };

    try {
      await this._contextService.storage.run(store, async () => {
        const context: NAbstractHttpAdapter.Context<
          any,
          any,
          "private:system"
        > = {
          store: store,
          user: {},
          system: {},
        };

        switch (action.scope) {
          case "public:route":
            break;
          case "private:user":
            const accessToken = req.headers["x-user-access-token"];
            if (!accessToken) {
              return res.status(StatusCode.FORBIDDEN).send({
                responseType: ResponseType.AUTHENTICATED,
                data: {
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
              ...(await this._sessionService.getHttpSessionInfo(
                jwtPayload.payload.userId,
                jwtPayload.payload.sessionId
              )),
            };
            break;
          case "private:system":
            const accessToken2 = req.headers["x-user-access-token"];
            if (!accessToken2) {
              return res.status(StatusCode.FORBIDDEN).send({
                responseType: ResponseType.AUTHENTICATED,
                data: {
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
              ...(await this._sessionService.getHttpSessionInfo(
                jwtPayload2.payload.userId,
                jwtPayload2.payload.sessionId
              )),
            };

            break;
        }

        const result = await action.handler(
          {
            method: req.method,
            headers: req.headers,
            body: req.body,
            params: params,
            path: req.routeOptions.url,
            url: req.url,
            query: queries,
          },
          {
            fnAgent: container.get<IFunctionalityAgent>(
              CoreSymbols.FunctionalityAgent
            ),
            schemaAgent: container.get<ISchemaAgent>(CoreSymbols.SchemaAgent),
            inAgent: container.get<IIntegrationAgent>(
              CoreSymbols.IntegrationAgent
            ),
          },
          context
        );

        if (!result) {
          return res.status(StatusCode.NO_CONTENT).send();
        }

        if (result.payload.headers) res.headers(result.payload.headers);

        if (Guards.isJsonResponse(result.payload) && result.format === "json") {
          return res
            .status(result.payload.statusCode || StatusCode.SUCCESS)
            .send({
              type: result.payload.type,
              data: result.payload.data,
            });
        } else if (
          Guards.isRedirectResponse(result.payload) &&
          result.format === "redirect"
        ) {
          return res
            .status(result.payload.statusCode || StatusCode.FOUND)
            .redirect(result.payload.url);
        } else {
          return res
            .status(result.payload.statusCode || StatusCode.NO_CONTENT)
            .send();
        }
      });
    } catch (e) {
      console.error(e);

      // TODO: add resolve error
      if (e instanceof jwt.TokenExpiredError) {
        res.status(StatusCode.FORBIDDEN).send({
          responseType: ResponseType.AUTHENTICATED,
          data: {
            message: "Access jwt token expired",
          },
        });
      }
    } finally {
      this._contextService.exit();
    }
  };

  private _getNotFoundStructure(param: any) {
    let message: string;
    switch (param) {
      case "service":
        message = `Service "${param}" not found`;
        break;
      case "domain":
        message = `Service "${param}" not found`;
        break;
      case "action":
        message = `Service "${param}" not found`;
        break;
      default:
        throw Helpers.switchChecker(param);
    }

    return {
      responseType: ResponseType.FAIL,
      data: { message },
    };
  }
}

import { injectable, inject, fastify, uuid, jwt } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { Helpers } from "~utils";
import { ResponseType, SchemaHeaders, StatusCode } from "~common";

import { AbstractHttpAdapter } from "./abstract.http-adapter";

import {
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
  IScramblerService,
  NScramblerService,
  ILocalizationProvider,
  IIntegrationAgent,
  NSchemaService,
  ISchemaService,
  ISessionProvider,
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
    @inject(CoreSymbols.SchemaService)
    private readonly _schemaService: ISchemaService
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
        "adapters.serverTag",
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
    const httpMethods = [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
      "HEAD",
      "TRACE",
    ];
    this._instance.route({
      method: httpMethods,
      handler: this._apiHandler,
      url: this._config.urls.api + "/:service/:domain/:version/:action",
    });
    this._instance.route({
      method: httpMethods,
      handler: this._apiHandler,
      url: this._config.urls.api + "/:service/:domain/:version/:action/*",
    });

    // this._instance.addHook(
    //   "onRequest",
    //   (
    //     request: Fastify.Request,
    //     reply: Fastify.Response,
    //     done: () => void
    //   ): void => {
    //     reply.headers(this._corsHeaders());
    //
    //     if (request.method === "OPTIONS") {
    //       reply.status(200).send();
    //       return;
    //     }
    //
    //     done();
    //   }
    // );

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
    const service = this._schemaService.schema.get(req.params.service);
    if (!service) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .send(
          this._buildApiMessage(
            "0001.0001",
            `Service '${
              req.params.service
            }' not found. Supported services: ${Array.from(
              this._schemaService.schema.keys()
            )}`
          )
        );
    }

    const domain = service.get(req.params.domain);
    if (!domain) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .send(
          this._buildApiMessage(
            "0001.0002",
            `Domain '${req.params.domain}' not found in '${
              req.params.service
            }' service. Supported domains: ${Array.from(service.keys())}`
          )
        );
    }

    if (!domain.routes) {
      return res.status(StatusCode.BAD_REQUEST).send({
        responseType: ResponseType.FAIL,
        data: {
          message: "Domain does not have any routes",
        },
      });
    }

    const act = `${req.params.version}.${
      req.params.action
    }.${req.method.toUpperCase()}`;

    const action = domain.routes.get(act);
    if (!action) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .send(
          this._buildApiMessage(
            "0001.0003",
            `Action '${req.params.action}' in version '${
              req.params.version
            }' and with http method '${req.method.toUpperCase()}' not found in '${
              req.params.domain
            }' domain in '${req.params.service}' service.`
          )
        );
    }

    let headers: Record<string, string | null> = {};
    if (action.headers && action.headers.length > 0) {
      headers = action.headers.reduce(
        (
          acc: { [key: string]: string | null },
          header: NSchemaService.HeaderParams
        ) => {
          const h: string | null = req.headers[header.name];
          switch (header.scope) {
            case "required":
              if (!h) {
                return res
                  .status(StatusCode.BAD_REQUEST)
                  .send(
                    this._buildApiMessage(
                      "0001.0004",
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

    let params: Record<string, string | null> = {};
    const dynamicParams = req.params["*"];
    if (
      action.params &&
      action.params.length > 0 &&
      dynamicParams &&
      dynamicParams.length > 0
    ) {
      const dynamic: string[] = dynamicParams.split("/");

      const obj: Record<
        string,
        { scope: "required" | "optional"; value: string }
      > = {};
      action.params.forEach(
        (p, i) => (obj[p.name] = { scope: p.scope, value: dynamic[i] })
      );

      params = action.params.reduce(
        (
          acc: Record<string, string | null>,
          param: NSchemaService.RouteParams
        ) => {
          const parameter = obj[param.name];
          switch (parameter.scope) {
            case "required":
              if (!parameter.value) {
                return res
                  .status(StatusCode.BAD_REQUEST)
                  .send(
                    this._buildApiMessage(
                      "0001.0004",
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

    // TODO: resolve query params
    let queries: ModeObject = {};
    if (req.query) {
      queries = Helpers.parseQueryParams(Object.assign({}, req.query));
    }

    const acceptLanguage = req.headers["accept-language"];

    const store: NContextService.RouteStore = {
      service: req.params.service,
      domain: req.params.domain,
      action: req.params.action,
      version: req.params.version,
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

        const sessionProvider = container.get<ISessionProvider>(
          CoreSymbols.SessionProvider
        );

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
              ...(await sessionProvider.getById<any>(
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
              ...(await sessionProvider.getById<any>(
                jwtPayload2.payload.sessionId
              )),
            };

            break;
        }

        const result = await action.handler(
          {
            method: req.method,
            headers: headers,
            body: req.body,
            params: params,
            path: req.routeOptions.url,
            url: req.url,
            queries: queries,
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

        //   if (result.payload.headers) res.headers(result.payload.headers);
        //
        //   if (Guards.isJsonResponse(result.payload) && result.format === "json") {
        //     return res
        //       .status(result.payload.statusCode || StatusCode.SUCCESS)
        //       .send({
        //         type: result.payload.type,
        //         data: result.payload.data,
        //       });
        //   } else if (
        //     Guards.isRedirectResponse(result.payload) &&
        //     result.format === "redirect"
        //   ) {
        //     return res
        //       .status(result.payload.statusCode || StatusCode.FOUND)
        //       .redirect(result.payload.url);
        //   } else {
        //     return res
        //       .status(result.payload.statusCode || StatusCode.NO_CONTENT)
        //       .send();
        //   }
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

  private _buildApiMessage(code: string, message: string) {
    return { type: "FAIL", code, message };
  }
}

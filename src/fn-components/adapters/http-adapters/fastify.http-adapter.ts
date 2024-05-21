import { injectable, inject, fastify, uuid, jwt } from "~packages";
import { ErrorCodes, ResponseType, SchemaHeaders, StatusCode } from "~common";
import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { Helpers } from "~utils";

import { AbstractHttpAdapter } from "./abstract.http-adapter";

import type {
  ModeObject,
  Fastify,
  IRedisTunnel,
  ISchemeService,
  ILoggerService,
  IContextService,
  IDiscoveryService,
  IScramblerService,
  IAbstractHttpAdapter,
  NAbstractHttpAdapter,
  NAbstractFileStorageStrategy,
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

  protected readonly _httpMethods: string[];

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.ContextService)
    protected readonly _contextService: IContextService,
    @inject(CoreSymbols.SchemeService)
    protected readonly _schemaService: ISchemeService,
    @inject(CoreSymbols.ScramblerService)
    protected readonly _scramblerService: IScramblerService
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
        stream: "/v1/call/stream",
        cache: "/v1/call/cache",
      },
    };

    this._httpMethods = [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
      "HEAD",
      "TRACE",
    ];
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
        stream: this._discoveryService.getString(
          "adapters.http.urls.stream",
          this._config.urls.stream
        ),
        cache: this._discoveryService.getString(
          "adapters.http.urls.cache",
          this._config.urls.cache
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
    this._instance.register(require("@fastify/multipart"), {
      limits: {
        // fileSize: 50 * 1024 * 1024,
      },
    });

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

    this._setRoutes();

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

  private _setRoutes(): void {
    this._instance.route({
      method: this._httpMethods,
      handler: this._callApi,
      url: this._config.urls.api + "/:service/:domain/:version/:action",
    });
    this._instance.route({
      method: this._httpMethods,
      handler: this._callApi,
      url: this._config.urls.api + "/:service/:domain/:version/:action/*",
    });
    this._instance.route({
      method: "POST",
      handler: this._callStream,
      url: this._config.urls.stream + "/:service/:domain/:version/:stream",
    });
    this._instance.route({
      method: "POST",
      handler: this._callStream,
      url: this._config.urls.stream + "/:service/:domain/:version/:stream/*",
    });
    this._instance.route({
      method: "PATCH",
      handler: this._callCache,
      url: this._config.urls.cache + "/:name",
    });
  }

  private _corsHeaders() {
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
      "Access-Control-Allow-Methods": this._httpMethods.join(", "),
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
    if (this._instance) {
      await this._instance.close();
      this._instance = undefined;
    }

    this._loggerService.system(`Http server has been stopped.`, {
      scope: "Core",
      namespace: this._ADAPTER_NAME,
      tag: "Destroy",
    });
  }

  protected _callApi = async (
    req: NAbstractHttpAdapter.AdapterRequest<"fastify">,
    res: NAbstractHttpAdapter.AdapterResponse<"fastify">
  ): Promise<void> => {
    console.log(req.params);

    const domain = this._getDomainStorage(
      req.params.service,
      req.params.domain
    );

    if (domain.type === "fail") {
      return res.status(StatusCode.BAD_REQUEST).send(domain.message);
    }

    if (!domain.domain.routes) {
      return res.status(StatusCode.BAD_REQUEST).send({
        responseType: ResponseType.FAIL,
        data: {
          code: ErrorCodes.fn.HttpAdapter.EMPTY_ROUTES_MAP,
          message: "Domain does not have any routes",
        },
      });
    }

    const act = `${req.params.version}.${
      req.params.action
    }.${req.method.toUpperCase()}`;

    const action = domain.domain.routes.get(act);
    if (!action) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .send(
          this._buildApiMessage(
            ErrorCodes.fn.HttpAdapter.ROUTE_NOT_FOUND,
            `Action '${req.params.action}' in version '${
              req.params.version
            }' and with http method '${req.method.toUpperCase()}' not found in '${
              req.params.domain
            }' domain in '${req.params.service}' service.`
          )
        );
    }

    // TODO: resolve query params
    let queries: ModeObject = {};
    if (req.query) {
      queries = Helpers.parseQueryParams(Object.assign({}, req.query));
    }

    const store = this._formedStore(req);
    const headers = this._getHeaders(req.headers, action.headers, res);
    const params = this._getParams(req.params, action.params, res);

    try {
      await this._contextService.storage.run(store, async () => {
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
          this._getAgents(),
          await this._getContext(store, action.scope, req, res)
        );

        if (!result) {
          return res.status(StatusCode.NO_CONTENT).send();
        }

        if (result.headers) res.headers(result.headers);

        switch (result.format) {
          case "json":
            return res.status(result.statusCode || StatusCode.SUCCESS).send({
              type: result.type,
              data: result.data,
            });
          case "redirect":
            return res
              .status(result.statusCode || StatusCode.FOUND)
              .redirect(result.url);
          case "status":
            return res
              .status(result.statusCode || StatusCode.NO_CONTENT)
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

  private _callStream = async (
    req: NAbstractHttpAdapter.AdapterRequest<"fastify">,
    res: NAbstractHttpAdapter.AdapterResponse<"fastify">
  ): Promise<void> => {
    const domain = this._getDomainStorage(
      req.params.service,
      req.params.domain
    );

    if (domain.type === "fail") {
      return res.status(StatusCode.BAD_REQUEST).send(domain.message);
    }

    if (!domain.domain.streams) {
      return res.status(StatusCode.BAD_REQUEST).send({
        responseType: ResponseType.FAIL,
        data: {
          code: ErrorCodes.fn.HttpAdapter.EMPTY_STREAM_MAP,
          message: "Domain does not have any streams",
        },
      });
    }

    const act = `${req.params.version}.${req.params.stream}`;

    const stream = domain.domain.streams.get(act);
    if (!stream) {
      return res
        .status(StatusCode.BAD_REQUEST)
        .send(
          this._buildApiMessage(
            ErrorCodes.fn.HttpAdapter.STREAM_NOT_FOUND,
            `Action '${req.params.action}' in version '${
              req.params.version
            }' and with http method '${req.method.toUpperCase()}' not found in '${
              req.params.domain
            }' domain in '${req.params.service}' service.`
          )
        );
    }

    const store = this._formedStore(req);

    const files: NAbstractFileStorageStrategy.FilesInfo = new Map();

    let streams: AsyncGenerator<NAbstractFileStorageStrategy.StreamInfo>;
    if (stream.limits) {
      streams = req.files({ limits: stream.limits });
    } else {
      streams = req.files({ limits: { fileSize: 50 * 1024 * 1024 } });
    }

    try {
      await this._contextService.storage.run(store, async () => {
        for await (const streamInfo of streams) {
          try {
            const file: NAbstractFileStorageStrategy.FileInfo = {
              type: streamInfo.type,
              fieldName: streamInfo.fieldname,
              fileName: streamInfo.filename,
              encoding: streamInfo.encoding,
              mimetype: streamInfo.mimetype,
              file: await streamInfo.toBuffer(),
            };

            files.set(uuid.v4(), file);
          } catch (e: any) {
            const error = e as Fastify.FastifyError;

            const response: Record<string, unknown> = {
              type: ResponseType.FAIL,
              code: ErrorCodes.fn.HttpAdapter.TOO_LARGE_FILE,
              message: `Request file '${streamInfo.filename}' with mimetype '${streamInfo.mimetype}' too large.`,
            };

            if (stream.limits) {
              response["limits"] = stream.limits;
            }

            return res.status(error.statusCode).send(response);
          }
        }

        const headers = this._getHeaders(req.headers, stream.headers, res);
        const params = this._getParams(req.params, stream.params, res);

        const result = await stream.handler(
          {
            method: req.method,
            headers: headers,
            files: files,
            params: params,
            path: req.routeOptions.url,
            url: req.url,
            queries: {},
          },
          this._getAgents(),
          await this._getContext(store, stream.scope, req, res)
        );

        if (!result) {
          return res.status(StatusCode.NO_CONTENT).send();
        }

        if (result.headers) res.headers(result.headers);

        switch (result.format) {
          case "json":
            return res.status(result.statusCode || StatusCode.SUCCESS).send({
              type: result.type,
              data: result.data,
            });
          case "redirect":
            return res
              .status(result.statusCode || StatusCode.FOUND)
              .redirect(result.url);
          case "status":
            return res
              .status(result.statusCode || StatusCode.NO_CONTENT)
              .send();
        }
      });
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      this._contextService.exit();
    }
  };

  private _callCache = async (
    req: NAbstractHttpAdapter.AdapterRequest<"fastify">,
    res: NAbstractHttpAdapter.AdapterResponse<"fastify">
  ): Promise<void> => {
    const name = req.params.name;
    const tag = req.headers["etag"];

    if (tag) {
      return res.status(StatusCode.BAD_REQUEST).send({
        type: "fail",
        code: ErrorCodes.fn.HttpAdapter.ETAG_REQUIRED,
        message: "Etag header is required.",
      });
    }

    try {
      const validCache = await container
        .get<IRedisTunnel>(CoreSymbols.RedisTunnel)
        .keys.checkOne(`cache:${name}:${tag}`);

      return res
        .status(validCache ? StatusCode.SUCCESS : StatusCode.BAD_REQUEST)
        .send({ valid: validCache });
    } catch (e) {
      this._loggerService.error(e, {
        namespace: FastifyHttpAdapter.name,
        tag: "Execution",
        scope: "Core",
        errorType: "FATAL",
      });
      return res.status(StatusCode.SERVER_ERROR).send({
        type: "fatal",
        code: ErrorCodes.fn.HttpAdapter.INTERNAL_SERVER_ERROR,
        message: "Internal server error.",
      });
    }
  };
}

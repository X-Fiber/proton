import { injectable } from "~packages";
import { ResponseType, StatusCode } from "~common";

import type {
  UTCDate,
  ICoreError,
  NSchemeService,
  IRouteException,
  IValidatorError,
  IExceptionProvider,
  NExceptionProvider,
} from "~types";

class ValidatorError extends Error implements IValidatorError {
  public readonly errors: NSchemeService.ValidateErrors;

  constructor(message: string, errors: NSchemeService.ValidateErrors) {
    super(message);

    this.errors = errors;
  }
}

class RouteError extends Error implements IRouteException {
  public readonly processingType: NExceptionProvider.ProcessingType;
  public readonly statusCode: number;
  public readonly responseType: string;
  public readonly errorCode?: number;
  public readonly trace?: boolean;
  public readonly responseTime: UTCDate;
  public readonly requestId: string;
  public readonly sessionId?: string;
  public readonly userId?: string;
  public readonly redirect?: {
    url: string;
    statusCode?: number;
    headers?: {
      addHeaders?: Record<string, string>;
      removeHeaders?: Record<string, string>;
    };
  };

  constructor(options: IRouteException) {
    super(options.message);

    this.statusCode = options.statusCode;
    this.responseType = options.responseType;
    this.errorCode = options.errorCode;
    this.trace = options.trace;
    this.responseTime = options.responseTime;
    this.redirect = options.redirect;
    this.requestId = options.requestId;
    this.sessionId = options.sessionId;
    this.userId = options.userId;
    this.processingType = options.processingType;
  }
}

class CoreError extends Error implements ICoreError {
  public readonly namespace: string;
  public readonly tag: string | undefined;
  public readonly requestId: string | undefined;
  public readonly sessionId: string | undefined;
  public readonly trace: string | undefined;
  public readonly msg: string | undefined;

  constructor(message: string, options: NExceptionProvider.CoreError) {
    super(message);

    this.namespace = options.namespace;
    this.tag = options.tag;
    this.requestId = options.requestId;
    this.sessionId = options.sessionId;
    this.trace = this.stack;
    this.msg = this.message;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

@injectable()
export class ExceptionProvider implements IExceptionProvider {
  public throwValidation(
    errors: NSchemeService.ValidateErrors
  ): IValidatorError {
    return new ValidatorError("Validation error", errors);
  }

  public resolveValidation(
    e: IValidatorError
  ): NExceptionProvider.ResolveValidationStructure {
    return {
      statusCode: StatusCode.BAD_REQUEST,
      payload: {
        responseType: ResponseType.VALIDATION,
        data: { errors: e.errors },
      },
    };
  }

  public throwRoute(e: IRouteException): IRouteException {
    return new RouteError(e);
  }

  public resolveRoute(
    options: IRouteException
  ): NExceptionProvider.ResolveRouteStructure {
    const payload: NExceptionProvider.ResolveRouteStructure["payload"] = {
      responseType: options.responseType,
      responseTime: options.responseTime,
      processingType: options.processingType,
    };

    if (options.errorCode) {
      payload["errorCode"] = options.errorCode;
    }
    if (options.trace) {
      payload["trace"] = options.trace;
    }
    if (payload.redirect) {
      payload["redirect"] = options.redirect;
    }

    return {
      statusCode: options.statusCode ?? StatusCode.BAD_REQUEST,
      payload,
    };
  }

  public throwError(
    message: string,
    options: NExceptionProvider.CoreError
  ): ICoreError {
    return new CoreError(message, options);
  }
}

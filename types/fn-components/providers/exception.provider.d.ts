import type { UnknownObject, UTCDate } from "../utils";
import type { NLoggerService, NSchemeService } from "../services";

export interface IExceptionProvider {
  throwValidation(errors: NSchemeService.ValidateErrors): IValidatorError;
  resolveValidation(
    e: IValidatorError
  ): NExceptionProvider.ResolveValidationStructure;
  throwRoute(e: IRouteException): IRouteException;
  resolveRoute(
    options: IRouteException
  ): NExceptionProvider.ResolveRouteStructure;
  throwError(message: any, options: NExceptionProvider.CoreError): ICoreError;
}

export interface IValidatorError {
  errors: NSchemeService.ValidateErrors;
}

export interface IRouteException {
  processingType: NExceptionProvider.ProcessingType;
  statusCode: number;
  responseType: string;
  errorCode?: number;
  trace?: boolean;
  responseTime: UTCDate;
  message: string;
  requestId: string;
  sessionId?: string;
  userId?: string;
  redirect?: {
    url: string;
    statusCode?: number;
    headers?: {
      addHeaders?: Record<string, string>;
      removeHeaders?: Record<string, string>;
    };
  };
}

export interface ICoreError {
  namespace: string;
  tag?: string;
  requestId?: string;
  sessionId?: string;
  trace?: string;
  msg?: string;
}

export namespace NExceptionProvider {
  export type RouteErrorOptions = IRouteException;

  export type ProcessingType = "CATCH" | "EXCEPTION";

  export type ResolveRouteStructure = {
    statusCode: number;
    payload: Pick<
      RouteErrorOptions,
      | "processingType"
      | "responseType"
      | "responseTime"
      | "errorCode"
      | "trace"
      | "redirect"
    >;
  };

  export type ResolveValidationStructure = {
    statusCode: number;
    payload: {
      responseType: string;
      data: {
        errors: NSchemeService.ValidateErrors;
      };
    };
  };

  export type ErrorTag = "Init" | "Destroy" | "Execution" | string;

  export type CoreError = {
    namespace: string;
    requestId?: string;
    sessionId?: string;
    tag?: ErrorTag;
    code?: string;
    errorType: NLoggerService.ErrorType;
  };
}

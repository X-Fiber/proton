import type {
  ModeObject,
  StringObject,
  NAbstractHttpAdapter,
} from "./fn-components";

export type * from "./connectors";
export type * from "./ba-communication";
export type * from "./fn-components";
export type * from "./packages";
export type * from "./initiator";

export type ApiRequest<
  BODY = any,
  PARAMS extends StringObject = StringObject,
  HEADERS extends StringObject = StringObject,
  QUERIES extends ModeObject = ModeObject
> = NAbstractHttpAdapter.ApiRequest<BODY, PARAMS, HEADERS, QUERIES>;

export type ApiContext = NAbstractHttpAdapter.Context;

export type ApiResponse<
  BODY = any,
  HEADERS extends StringObject = StringObject
> = NAbstractHttpAdapter.Response<BODY, HEADERS>;

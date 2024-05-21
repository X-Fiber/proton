import type { Jwt } from "../../packages";
import type { UnknownObject } from "../utils";
import type { IAbstractService } from "./abstract.service";
import type { NDiscoveryService } from "./discovery.service";

export interface IScramblerService extends IAbstractService {
  readonly accessExpiredAt: number;
  readonly refreshExpiredAt: number;

  generateAccessToken<
    P extends UnknownObject & NScramblerService.SessionIdentifiers
  >(
    payload: P,
    algorithm?: Jwt.Algorithm
  ): NScramblerService.ConvertJwtInfo;
  generateRefreshToken<
    P extends UnknownObject & NScramblerService.SessionIdentifiers
  >(
    payload: P,
    algorithm?: Jwt.Algorithm
  ): NScramblerService.ConvertJwtInfo;
  verifyToken<T extends UnknownObject>(
    token: string
  ): Promise<NScramblerService.JwtTokenPayload<T>>;
  createHash(algorithm?: Jwt.Algorithm): string;
  hashPayload(payload: string): Promise<string>;
  compareHash(candidate: string, exists: string): Promise<boolean>;
}

export namespace NScramblerService {
  export type Config = Pick<
    NDiscoveryService.CoreConfig["services"]["scrambler"],
    | "enable"
    | "salt"
    | "secret"
    | "randomBytes"
    | "accessExpiredAt"
    | "refreshExpiredAt"
    | "defaultAlgorithm"
  >;

  export type ConvertJwtInfo = {
    jwt: string;
    jwtId: string;
  };

  export type JwtTokenPayload<T extends UnknownObject> = {
    iat: number;
    exp: number;
    payload: T;
  };

  export type SessionIdentifiers = {
    userId: string;
    sessionId: string;
  };
}

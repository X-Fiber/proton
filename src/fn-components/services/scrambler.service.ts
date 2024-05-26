import { bcrypt, injectable, inject, jwt, uuid, crypto } from "~packages";
import { CoreSymbols } from "~symbols";
import { AbstractService } from "./abstract.service";

import type {
  Jwt,
  UnknownObject,
  ILoggerService,
  IDiscoveryService,
  IScramblerService,
  NScramblerService,
} from "~types";

@injectable()
export class ScramblerService
  extends AbstractService
  implements IScramblerService
{
  protected readonly _SERVICE_NAME = ScramblerService.name;
  protected _config: NScramblerService.Config;

  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService
  ) {
    super();

    this._config = {
      enable: false,
      salt: 5,
      secret: "default",
      randomBytes: 10,
      accessExpiredAt: 10,
      refreshExpiredAt: 30,
      defaultAlgorithm: "MD5",
    };
  }

  private _setConfig(): NScramblerService.Config {
    return {
      enable: this._discoveryService.getBoolean(
        "services.scrambler.enable",
        this._config.enable
      ),
      salt: this._discoveryService.getNumber(
        "services.scrambler.salt",
        this._config.salt
      ),
      secret: this._discoveryService.getString(
        "services.scrambler.secret",
        this._config.secret
      ),
      randomBytes: this._discoveryService.getNumber(
        "services.scrambler.randomBytes",
        this._config.randomBytes
      ),
      accessExpiredAt: this._discoveryService.getNumber(
        "services.scrambler.accessExpiredAt",
        this._config.accessExpiredAt
      ),
      refreshExpiredAt: this._discoveryService.getNumber(
        "services.scrambler.refreshExpiredAt",
        this._config.refreshExpiredAt
      ),
      defaultAlgorithm: this._discoveryService.getString(
        "services.scrambler.defaultAlgorithm",
        this._config.defaultAlgorithm
      ),
    };
  }

  protected async init(): Promise<boolean> {
    this._config = this._setConfig();

    if (!this._config.enable) return false;

    return true;
  }

  protected async destroy(): Promise<void> {
    // Not implemented
  }

  public get accessExpiredAt(): number {
    if (!this._config) throw this._throwConfigError();
    return this._config.accessExpiredAt * 60;
  }

  public get refreshExpiredAt(): number {
    if (!this._config) throw this._throwConfigError();
    return this._config.refreshExpiredAt * 60 * 60 * 24;
  }

  public generateAccessToken<P extends UnknownObject>(
    payload: P,
    alg?: Jwt.Algorithm
  ): NScramblerService.ConvertJwtInfo {
    if (!this._config) throw this._throwConfigError();

    try {
      return this._generateToken(payload, this.accessExpiredAt, alg);
    } catch (e) {
      throw e;
    }
  }

  public generateRefreshToken<P extends UnknownObject>(
    payload: P,
    alg?: Jwt.Algorithm
  ): NScramblerService.ConvertJwtInfo {
    if (!this._config) throw this._throwConfigError();

    try {
      return this._generateToken(payload, this.refreshExpiredAt, alg);
    } catch (e) {
      throw e;
    }
  }

  private _generateToken<T = UnknownObject>(
    payload: T,
    expiresIn: number,
    alg?: Jwt.Algorithm
  ) {
    if (!this._config) throw this._throwConfigError();
    const algorithm = alg ?? "HS256";

    const jwtId = uuid.v4();
    try {
      return {
        jwt: jwt.sign({ payload }, this._config.secret, {
          expiresIn,
          algorithm,
          jwtid: jwtId,
        }),
        jwtId,
      };
    } catch (e) {
      throw e;
    }
  }

  public async verifyToken<T extends UnknownObject>(
    token: string
  ): Promise<NScramblerService.JwtTokenPayload<T>> {
    try {
      return new Promise<NScramblerService.JwtTokenPayload<T>>(
        (resolve, reject) => {
          if (!this._config) throw this._throwConfigError();

          jwt.verify(token, this._config.secret, (err, data) => {
            if (err) return reject(err);
            return resolve(data as NScramblerService.JwtTokenPayload<T>);
          });
        }
      );
    } catch (e) {
      throw e;
    }
  }

  public createHash(algorithm?: Jwt.Algorithm): string {
    if (!this._config) throw this._throwConfigError();
    const alg = algorithm ?? (this._config.defaultAlgorithm as Jwt.Algorithm);

    try {
      const bytes = crypto
        .randomBytes(this._config.randomBytes)
        .toString("hex");
      return crypto.createHash(alg).update(bytes).digest("hex");
    } catch (e) {
      throw e;
    }
  }

  public async hashPayload(password: string): Promise<string> {
    if (!this._config) throw this._throwConfigError();

    try {
      return bcrypt.hash(password, this._config.salt);
    } catch (e) {
      throw e;
    }
  }

  public async compareHash(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(candidatePassword, userPassword);
    } catch (e) {
      throw e;
    }
  }

  private _throwConfigError(): Error {
    return new Error("Config not set");
  }
}

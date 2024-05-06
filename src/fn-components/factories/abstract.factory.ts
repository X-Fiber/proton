import { injectable } from "~packages";

import {
  IAbstractFactory,
  IDiscoveryService,
  ILoggerService,
  NDiscoveryService,
} from "~types";

@injectable()
export abstract class AbstractFactory implements IAbstractFactory {
  protected abstract _FACTORY_NAME: string;
  protected abstract _CONF_VARIABLE_PATH: NDiscoveryService.KeyBuilder<
    NDiscoveryService.CoreConfig,
    string
  >;
  protected abstract _CONF_VARIABLE_ENABLE: NDiscoveryService.KeyBuilder<
    NDiscoveryService.CoreConfig,
    boolean
  >;
  protected abstract _DEF_CONF_VARIABLE: string;
  protected _KIND: string | undefined;

  protected abstract _discoveryService: IDiscoveryService;
  protected abstract _loggerService: ILoggerService;
  protected abstract start(): Promise<void>;
  protected abstract stop(): Promise<void>;

  protected _getKind<T extends string>(): T {
    if (!this._KIND) {
      throw new Error("Scope case not found.");
    }

    return this._KIND as T;
  }

  public async run(): Promise<void> {
    const scope = this._CONF_VARIABLE_PATH.startsWith("adapters")
      ? "adapter"
      : "strategy";

    const enable = this._discoveryService.getBoolean(
      this._CONF_VARIABLE_ENABLE,
      false
    );

    if (!enable) {
      this._loggerService.warn(`${this._FACTORY_NAME} ${scope} not enabled`, {
        scope: "Core",
        tag: "Init",
        namespace: this._FACTORY_NAME,
      });

      return;
    }

    this._KIND = this._discoveryService.getString(
      this._CONF_VARIABLE_PATH,
      this._DEF_CONF_VARIABLE
    );

    try {
      await this.start();

      this._loggerService.system(
        `${this._FACTORY_NAME} has been run "${this._KIND}" ${scope}`,
        {
          scope: "Core",
          tag: "Init",
          namespace: this._FACTORY_NAME,
        }
      );
    } catch (e) {
      this._loggerService.error(e, {
        scope: "Core",
        tag: "Init",
        errorType: "FATAL",
        namespace: this._FACTORY_NAME,
      });
    }
  }
  public async stand(): Promise<void> {
    const scope = this._CONF_VARIABLE_PATH.startsWith("adapters")
      ? "adapter"
      : "strategy";

    try {
      await this.stop();

      this._loggerService.system(
        `${this._FACTORY_NAME} has been stand "${this._KIND}" ${scope} kind`,
        {
          scope: "Core",
          tag: "Init",
          namespace: this._FACTORY_NAME,
        }
      );
    } catch (e) {
      this._loggerService.error(e, {
        scope: "Core",
        tag: "Init",
        errorType: "FATAL",
        namespace: this._FACTORY_NAME,
      });
    }
  }
}

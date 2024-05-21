import { injectable } from "~packages";

import type {
  ILoggerService,
  IDiscoveryService,
  IAbstractIntegration,
} from "~types";

@injectable()
export abstract class AbstractIntegration implements IAbstractIntegration {
  protected abstract readonly _INTEGRATION_NAME: string;
  protected abstract readonly _discoveryService: IDiscoveryService;
  protected abstract readonly _loggerService: ILoggerService;

  protected abstract init(): Promise<boolean>;
  protected abstract destroy(): Promise<void>;

  public async start(): Promise<void> {
    try {
      if (await this.init()) {
        this._loggerService.system(
          this._INTEGRATION_NAME + " integration has started.",
          {
            namespace: this._INTEGRATION_NAME,
            scope: "Core",
            tag: "Connection",
          }
        );
      }
    } catch (e) {
      this._loggerService.error(e, {
        namespace: this._INTEGRATION_NAME,
        scope: "Core",
        errorType: "FATAL",
        tag: "Connection",
      });
    }
  }
  public async stop(): Promise<void> {
    try {
      await this.destroy();

      this._loggerService.system(
        this._INTEGRATION_NAME + " integration has stopped.",
        {
          namespace: this._INTEGRATION_NAME,
          scope: "Core",
          tag: "Connection",
        }
      );
    } catch (e) {
      this._loggerService.error(e, {
        namespace: this._INTEGRATION_NAME,
        scope: "Core",
        errorType: "FATAL",
        tag: "Destroy",
      });
    }
  }
}

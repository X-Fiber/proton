import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { AbstractConnector } from "./abstract.connector";

import type { IMailIntegration, IIntegrationConnector } from "~types";

@injectable()
export class IntegrationConnector
  extends AbstractConnector
  implements IIntegrationConnector
{
  protected readonly _CONNECTOR_NAME = IntegrationConnector.name;

  constructor(
    @inject(CoreSymbols.MailIntegration)
    private readonly _mailIntegration: IMailIntegration
  ) {
    super();
  }

  public async start(): Promise<void> {
    try {
      await this._mailIntegration.start();
    } catch (e) {
      throw this._catchError(e, "Init");
    }
  }

  public async stop(): Promise<void> {
    try {
      await this._mailIntegration.stop();
    } catch (e) {
      throw this._catchError(e, "Destroy");
    }
  }
}

import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { AbstractConnector } from "./abstract.connector";

import type { IMailIntegration, IIntegrationConnector } from "~types";

@injectable()
export class IntegrationConnector
  extends AbstractConnector
  implements IIntegrationConnector
{
  constructor(
    @inject(CoreSymbols.MailIntegration)
    private readonly _mailIntegration: IMailIntegration
  ) {
    super();
  }

  public async start(): Promise<void> {
    await this._mailIntegration.start();
  }

  public async stop(): Promise<void> {
    await this._mailIntegration.stop();
  }
}

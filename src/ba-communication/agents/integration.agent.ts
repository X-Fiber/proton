import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";

import type {
  IMailIntegration,
  NMailIntegration,
  IIntegrationAgent,
  NIntegrationAgent,
} from "~types";

@injectable()
export class IntegrationAgent implements IIntegrationAgent {
  constructor(
    @inject(CoreSymbols.MailIntegration)
    private readonly _mailIntegration: IMailIntegration
  ) {}

  public get mailer(): NIntegrationAgent.Mailer {
    return {
      sendMailWithStaticSender: async (
        mail: NMailIntegration.StaticMail
      ): Promise<void> => {
        return this._mailIntegration.sendMailWithStaticSender(mail);
      },
      sendMailWithDynamicSender: async (
        mail: NMailIntegration.DynamicMail
      ): Promise<void> => {
        return this._mailIntegration.sendMailWithDynamicSender(mail);
      },
    };
  }
}

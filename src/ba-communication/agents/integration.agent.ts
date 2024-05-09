import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";

import {
  IMailIntegration,
  NMailIntegration,
  IIntegrationAgent,
  NIntegrationAgent,
  IFileStorageFactory,
  NAbstractFileStorageStrategy,
} from "~types";

@injectable()
export class IntegrationAgent implements IIntegrationAgent {
  constructor(
    @inject(CoreSymbols.MailIntegration)
    private readonly _mailIntegration: IMailIntegration,
    @inject(CoreSymbols.FileStorageFactory)
    private readonly _fileStorage: IFileStorageFactory
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

  public get fileStorage(): NIntegrationAgent.FileStorage {
    return {
      set: async <N extends string>(
        name: N,
        files: NAbstractFileStorageStrategy.FileInfo
      ): Promise<void> => {
        await this._fileStorage.set(name, files);
      },
    };
  }
}

import {
  IAbstractFileStorageStrategy,
  IMailIntegration,
} from "../../fn-components";

export interface IIntegrationAgent {
  readonly mailer: NIntegrationAgent.Mailer;
  readonly fileStorage: NIntegrationAgent.FileStorage;
}

export namespace NIntegrationAgent {
  export type Mailer = {
    sendMailWithDynamicSender: IMailIntegration["sendMailWithDynamicSender"];
    sendMailWithStaticSender: IMailIntegration["sendMailWithStaticSender"];
  };

  export type FileStorage = {
    set: IAbstractFileStorageStrategy["set"];
  };
}

import { IMailIntegration } from "../../fn-components";

export interface IIntegrationAgent {
  readonly mailer: NIntegrationAgent.Mailer;
}

export namespace NIntegrationAgent {
  export type Mailer = {
    sendMailWithDynamicSender: IMailIntegration["sendMailWithDynamicSender"];
    sendMailWithStaticSender: IMailIntegration["sendMailWithStaticSender"];
  };
}

import { IAbstractIntegration } from "./abstract.integration";
import { NDiscoveryService } from "../services";

export interface IMailIntegration extends IAbstractIntegration {
  sendMailWithDynamicSender(
    mail: NMailIntegration.DynamicMail,
    options?: NMailIntegration.Options
  ): Promise<void>;
  sendMailWithStaticSender(
    mail: NMailIntegration.StaticMail,
    options?: NMailIntegration.Options
  ): Promise<void>;
}

export namespace NMailIntegration {
  export type Config = Pick<
    NDiscoveryService.CoreConfig["integrations"]["mail"],
    "enable" | "host" | "port" | "secure" | "contact" | "withMessageId"
  >;

  export type StaticMail = {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  };

  export type DynamicMail = StaticMail & {
    from: string;
  };

  export type Options = {
    logInfo: boolean;
    additionalMsg?: string;
  };
}

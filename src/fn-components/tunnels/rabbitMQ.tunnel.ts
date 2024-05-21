import { injectable, inject } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";

import type {
  ILoggerService,
  IRabbitMQTunnel,
  NRabbitMQTunnel,
  IExceptionProvider,
  IRabbitMQConnector,
} from "~types";

@injectable()
export class RabbitMQTunnel implements IRabbitMQTunnel {
  constructor(
    @inject(CoreSymbols.RabbitMQConnector)
    private readonly _rabbitMQConnector: IRabbitMQConnector,
    @inject(CoreSymbols.LoggerService)
    private readonly _loggerService: ILoggerService
  ) {}

  public sendToQueue(
    queue: string,
    data: any,
    context?: NRabbitMQTunnel.Context
  ): void {
    this._rabbitMQConnector.connection.createChannel((e, channel) => {
      if (e) {
        this._loggerService.error(e, {
          scope: "Core",
          namespace: RabbitMQTunnel.name,
          tag: "Execution",
          errorType: "FAIL",
          sessionId: context?.sessionId,
          requestId: context?.requestId,
        });

        throw container
          .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
          .throwError(e, {
            namespace: RabbitMQTunnel.name,
            tag: "EXECUTE",
            errorType: "FATAL",
            requestId: context?.requestId,
            sessionId: context?.sessionId,
          });
      }

      channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    });
  }
}

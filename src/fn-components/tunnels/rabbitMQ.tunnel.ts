import { injectable, inject } from "~packages";
import { container } from "~container";
import { CoreSymbols } from "~symbols";

import type {
  IContextService,
  ICoreError,
  IExceptionProvider,
  IRabbitMQConnector,
  IRabbitMQTunnel,
} from "~types";

@injectable()
export class RabbitMQTunnel implements IRabbitMQTunnel {
  constructor(
    @inject(CoreSymbols.RabbitMQConnector)
    private readonly _rabbitMQConnector: IRabbitMQConnector,
    @inject(CoreSymbols.ContextService)
    private readonly _contextService: IContextService
  ) {}

  public sendToQueue(queue: string, data: any): void {
    this._rabbitMQConnector.connection.createChannel((e, channel) => {
      if (e) {
        throw this._callbackError(e);
      }

      channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
    });
  }

  private _callbackError(e: any): ICoreError {
    return container
      .get<IExceptionProvider>(CoreSymbols.ExceptionProvider)
      .throwError(e, {
        namespace: RabbitMQTunnel.name,
        tag: "EXECUTE",
        errorType: "FATAL",
        requestId: this._contextService.store.requestId,
        sessionId: this._contextService.store.sessionId,
      });
  }
}

import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";

import type {
  IInitiator,
  IIntegrationConnector,
  IMongoConnector,
  IRedisConnector,
  IComputeConnector,
  ITypeormConnector,
} from "~types";

@injectable()
export class Initiator implements IInitiator {
  constructor(
    @inject(CoreSymbols.ServiceConnector)
    private readonly _serviceConnector: IComputeConnector,
    @inject(CoreSymbols.MongoConnector)
    private readonly _mongodbConnector: IMongoConnector,
    @inject(CoreSymbols.TypeormConnector)
    private readonly _typeormConnector: ITypeormConnector,
    @inject(CoreSymbols.RedisConnector)
    private readonly _redisConnector: IRedisConnector,
    @inject(CoreSymbols.IntegrationConnector)
    private readonly _integrationConnector: IIntegrationConnector
  ) {}

  public async start(): Promise<void> {
    await this._serviceConnector.start();
    await this._integrationConnector.start();
    await this._mongodbConnector.start();
    await this._typeormConnector.start();
    await this._redisConnector.start();
  }
  public async stop(): Promise<void> {
    await this._redisConnector.stop();
    await this._typeormConnector.stop();
    await this._mongodbConnector.stop();
    await this._integrationConnector.stop();
    await this._serviceConnector.stop();
  }
}

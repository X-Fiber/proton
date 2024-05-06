import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";

import type { Typeorm, ITypeormConnector, ITypeormTunnel } from "~types";

@injectable()
export class TypeormTunnel implements ITypeormTunnel {
  constructor(
    @inject(CoreSymbols.TypeormConnector)
    private readonly _typeormConnector: ITypeormConnector
  ) {}

  public getRepository<T>(name: string): Typeorm.Repository<T> {
    return this._typeormConnector.getRepository(name);
  }
}

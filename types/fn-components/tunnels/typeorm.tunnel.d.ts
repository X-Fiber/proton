import { Typeorm } from "../packages/packages";

export interface ITypeormTunnel {
  getRepository<T>(name: string): Typeorm.Repository<T>;
}

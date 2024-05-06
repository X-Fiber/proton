export interface IAbstractFactory {
  run(): Promise<void>;
  stand(): Promise<void>;
}

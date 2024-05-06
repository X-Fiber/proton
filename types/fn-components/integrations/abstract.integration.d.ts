export interface IAbstractIntegration {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export interface IInitiator {
  start(): Promise<void>;
  stop(): Promise<void>;
}

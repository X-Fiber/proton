import { NDiscoveryService, NStreamService } from "../services";

export interface IAbstractFileStorageStrategy {
  start(): Promise<void>;
  stop(): Promise<void>;

  set<N extends string>(
    name: N,
    files: NAbstractFileStorageStrategy.FileInfo
  ): Promise<void>;
}

export namespace NAbstractFileStorageStrategy {
  export type Config = Pick<
    NDiscoveryService.CoreConfig["strategies"]["fileStorage"],
    "enable" | "buffer"
  >;

  export type StreamLimits = {
    fieldNameSize?: number;
    fieldSize?: number;
    fields?: number;
    fileSize?: number;
    parts?: number;
  };

  interface StreamInfo {
    streamId: string;
    type: string;
    fieldname: string;
    filename: string;
    encoding: string;
    mimetype: string;
    file: Buffer;
    toBuffer(): Promise<Buffer>;
  }

  type FileInfo = Pick<
    NStreamService.StreamInfo,
    "type" | "encoding" | "mimetype" | "file"
  > & {
    streamId: string;
    fieldName: string;
    fileName: string;
  };
}

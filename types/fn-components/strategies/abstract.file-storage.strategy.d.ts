import type { NDiscoveryService } from "../services";

export interface IAbstractFileStorageStrategy {
  start(): Promise<void>;
  stop(): Promise<void>;

  count(): Promise<number>;
  setOne<N extends string>(
    name: N,
    files: NAbstractFileStorageStrategy.FileInfo
  ): Promise<void>;
  setMany(files: NAbstractFileStorageStrategy.FilesInfo): Promise<void>;
  getOne<N extends string>(
    name: N
  ): Promise<NAbstractFileStorageStrategy.FileInfo | null>;
  getAll(): Promise<NAbstractFileStorageStrategy.FilesInfo | null>;
  updateOne<N extends string>(
    name: N,
    file: NAbstractFileStorageStrategy.FileInfo
  ): Promise<void>;
  loadOne<N extends string>(
    name: N
  ): Promise<NAbstractFileStorageStrategy.FileInfo | null>;
  loadAll<>(): Promise<NAbstractFileStorageStrategy.FilesInfo | null>;
  removeOne<N extends string>(name: N): Promise<void>;
  clear(): Promise<void>;
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
    StreamInfo,
    "type" | "encoding" | "mimetype" | "file"
  > & {
    streamId: string;
    fieldName: string;
    fileName: string;
  };

  type FilesInfo = {
    name: string;
    file: NAbstractFileStorageStrategy.FileInfo;
  }[];
}

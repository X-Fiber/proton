import type { IAbstractFactory } from "./abstract.factory";
import type { IAbstractFileStorageStrategy } from "../strategies";

export interface IFileStorageFactory extends IAbstractFactory {
  readonly strategy: NFileStorageFactory.Strategy;
}

export namespace NFileStorageFactory {
  export type Strategy = {
    count: IAbstractFileStorageStrategy["count"];
    setOne: IAbstractFileStorageStrategy["setOne"];
    setMany: IAbstractFileStorageStrategy["setMany"];
    getOne: IAbstractFileStorageStrategy["getOne"];
    getAll: IAbstractFileStorageStrategy["getAll"];
    updateOne: IAbstractFileStorageStrategy["updateOne"];
    loadOne: IAbstractFileStorageStrategy["loadOne"];
    loadAll: IAbstractFileStorageStrategy["loadAll"];
    removeOne: IAbstractFileStorageStrategy["removeOne"];
    clear: IAbstractFileStorageStrategy["clear"];
  };
}

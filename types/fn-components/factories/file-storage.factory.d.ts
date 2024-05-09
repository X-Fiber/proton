import { IAbstractFactory } from "./abstract.factory";
import { IAbstractFileStorageStrategy } from "../strategies";

export interface IFileStorageFactory extends IAbstractFactory {
  set: IAbstractFileStorageStrategy["set"];
}

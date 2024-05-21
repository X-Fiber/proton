import type { ExtendedRecordObject } from "../utils";

export interface ILocalizationProvider {
  getDictionary<E extends ExtendedRecordObject = ExtendedRecordObject>(
    service: string,
    domain: string,
    language: string
  ): E;
  getResource(
    service: string,
    domain: string,
    language: string,
    resource: string,
    substitutions?: Record<string, string>
  ): string;
}

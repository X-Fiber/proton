import { injectable, inject } from "~packages";
import { CoreSymbols } from "~symbols";
import { Guards } from "~utils";

import type {
  IDiscoveryService,
  ILoggerService,
  ILocalizationProvider,
  ExtendedRecordObject,
  ISchemaService,
} from "~types";

@injectable()
export class LocalizationProvider implements ILocalizationProvider {
  constructor(
    @inject(CoreSymbols.DiscoveryService)
    protected readonly _discoveryService: IDiscoveryService,
    @inject(CoreSymbols.LoggerService)
    protected readonly _loggerService: ILoggerService,
    @inject(CoreSymbols.SchemaService)
    private readonly _schemaService: ISchemaService
  ) {}

  public getDictionary(service: string, domain: string, language: string) {
    const sStorage = this._schemaService.schema.get(service);
    if (!sStorage) {
      throw new Error("Service not found");
    }

    const dStorage = sStorage.get(domain);
    if (!dStorage) {
      throw new Error("Domain not found");
    }

    const dictionary = dStorage.dictionaries.get(language);
    if (!dictionary) {
      throw new Error("Dictionary language not supported");
    }
    return dictionary;
  }

  public getResource(
    service: string,
    domain: string,
    language: string,
    resource: string,
    substitutions?: Record<string, string>
  ): string {
    const dictionary = this.getDictionary(service, domain, language);

    try {
      const keys = resource.split(".");
      let record: ExtendedRecordObject = dictionary;

      if (keys.length > 1) {
        for (const key of keys) {
          if (!Guards.isString(record)) {
            record = record[key];
          } else {
            if (substitutions) {
              for (const substitution in substitutions) {
                record = record.replace(
                  "{{" + substitution + "}}",
                  substitutions[substitution]
                );
              }
            } else {
              return record;
            }
          }
        }
      }
      return record;
    } catch (e) {
      throw e;
    }
  }
}

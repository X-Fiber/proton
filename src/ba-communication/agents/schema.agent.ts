import { inject, injectable } from "~packages";
import { CoreSymbols } from "~symbols";

import {
  AnyObject,
  ExtendedRecordObject,
  FnObject,
  ISchemaAgent,
  ISchemaService,
  KeyStringLiteralBuilder,
  NSchemaService,
} from "~types";

@injectable()
export class SchemaAgent implements ISchemaAgent {
  constructor(
    @inject(CoreSymbols.SchemaService)
    private readonly _schemaService: ISchemaService
  ) {}

  public get schema(): NSchemaService.BusinessScheme {
    return this._schemaService.schema;
  }

  public getAnotherMongoRepository<T extends FnObject = FnObject>(
    name: string
  ): T {
    return this._schemaService.getAnotherMongoRepository(name);
  }

  public getMongoRepository<T extends FnObject = FnObject>(): T {
    return this._schemaService.getMongoRepository();
  }

  public getAnotherValidator<T extends Record<string, AnyObject>>(
    name: string
  ): NSchemaService.ValidatorStructure<T> {
    return this._schemaService.getAnotherValidator(name);
  }

  public getValidator<
    T extends Record<string, AnyObject>
  >(): NSchemaService.ValidatorStructure<T> {
    return this._schemaService.getValidator();
  }

  public getAnotherTypeormRepository<T extends FnObject = FnObject>(
    name: string
  ): T {
    return this._schemaService.getAnotherTypeormRepository(name);
  }

  public getTypeormRepository<T extends FnObject = FnObject>(): T {
    return this._schemaService.getTypeormRepository();
  }

  public getDictionary<L extends string, E extends ExtendedRecordObject>(
    language: L
  ): E {
    // return this._schemaService<E>(service, domain, language);

    return "" as E;
  }

  public getAnotherDictionary<
    D extends string,
    L extends string,
    E extends ExtendedRecordObject
  >(domain: D, language: E): E {
    // return this._schemaService<E>(service, domain, language);

    return "" as E;
  }

  public getAnotherResource<
    D extends string,
    DICT extends Record<string, unknown>,
    SUBS extends Record<string, string> | undefined | null =
      | Record<string, string>
      | undefined
      | null,
    L extends string = string
  >(
    domain: D,
    resource: KeyStringLiteralBuilder<DICT>,
    substitutions?: SUBS,
    language?: L
  ): string {
    return this._schemaService.getAnotherResource(
      domain,
      resource,
      substitutions,
      language
    );
  }

  public getResource<
    D extends Record<string, unknown>,
    SUBS extends Record<string, string> | undefined | null =
      | Record<string, string>
      | undefined
      | null,
    L extends string = string
  >(
    resource: KeyStringLiteralBuilder<D>,
    substitutions?: SUBS,
    language?: L
  ): string {
    return this._schemaService.getResource(resource, substitutions, language);
  }
}

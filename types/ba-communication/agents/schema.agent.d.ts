import {
  FnObject,
  KeyStringLiteralBuilder,
  NSchemaService,
} from "../../fn-components";

export interface ISchemaAgent {
  readonly schema: NSchemaService.BusinessScheme;

  getAnotherMongoRepository<D extends string, T extends FnObject = FnObject>(
    domain: D
  ): T;
  getMongoRepository<T extends FnObject = FnObject>(): T;
  getValidator<
    T extends Record<string, NSchemaService.ValidateObject>
  >(): NSchemaService.ValidatorStructure<T>;
  getAnotherValidator<
    D extends string,
    T extends Record<string, NSchemaService.ValidateObject>
  >(
    domain: D
  ): NSchemaService.ValidatorStructure<T>;
  getTypeormRepository<T extends FnObject = FnObject>(): T;
  getAnotherTypeormRepository<D extends string, T extends FnObject = FnObject>(
    domain: D
  ): T;
  getAnotherResource<
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
  ): string;
  getResource<
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
  ): string;
}

export namespace NSchemaAgent {
  export type Localization = {
    getDictionary: "";
    getAnotherDictionary: "";
    getResource: ISchemaAgent["getResource"];
    getAnotherResource: ISchemaAgent["getAnotherResource"];
  };
}

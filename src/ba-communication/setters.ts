import { AnyFn, AnyObject, ExtendedRecordObject, NSchemaLoader } from "~types";

export const setService = <S extends string>(
  service: S,
  domains: NSchemaLoader.DomainStructure[]
): NSchemaLoader.ServiceStructure<S> => {
  return { service, domains };
};

export const setPointer = <D extends string>(
  domain: D,
  documents: NSchemaLoader.DocumentsStructure
): NSchemaLoader.DomainStructure => {
  return { domain, documents };
};

export const setRouter = <R extends string>(
  structure: NSchemaLoader.RouterStructure<R>
): NSchemaLoader.RouterStructure => {
  return structure;
};

export const setEmitter = <E extends string>(
  structure: NSchemaLoader.EmitterStructure<E>
): NSchemaLoader.EmitterStructure => {
  return structure;
};

export const setBroker = <E extends string>(
  structure: NSchemaLoader.BrokerStructure<E>
): NSchemaLoader.BrokerStructure<E> => {
  return structure;
};

export const setStreamer = <E extends string>(
  structure: NSchemaLoader.StreamerStructure<E>
): NSchemaLoader.StreamerStructure<E> => {
  return structure;
};

export const setHelper = <T extends Record<string, AnyFn>>(structure: T) => {
  return structure;
};

export const setDictionary = <L extends string, D extends ExtendedRecordObject>(
  language: L | L[],
  dictionary: D
): NSchemaLoader.DictionaryStructure<L> => {
  return { language, dictionary };
};

export const setValidator = <T extends Record<string, any>>(
  structure: NSchemaLoader.ValidatorStructure<T>
): NSchemaLoader.ValidatorStructure<T> => {
  return structure;
};

export const setTypeormSchema = <T>(
  structure: NSchemaLoader.TypeormSchemaStructure<T>
): NSchemaLoader.TypeormSchemaStructure<T> => {
  return structure;
};

export const setTypeormRepository = <S, T extends AnyObject>(
  structure: NSchemaLoader.TypeormRepositoryStructure<S, T>
): NSchemaLoader.TypeormRepositoryStructure<S, T> => {
  return structure;
};

export const setMongoSchema = <T>(
  structure: NSchemaLoader.MongoSchemaStructure<T>
): NSchemaLoader.MongoSchemaStructure<T> => {
  return structure;
};

export const setMongoRepository = <
  S,
  T extends Record<string, NSchemaLoader.RepositoryHandler>
>(
  structure: NSchemaLoader.MongoRepositoryStructure<S, T>
): NSchemaLoader.MongoRepositoryStructure<S, T> => {
  return structure;
};

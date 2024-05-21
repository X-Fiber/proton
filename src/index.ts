export * from "./ba-communication/setters";
export * from "./fn-components/utils";
export * from "./common";

import { container } from "~container";
import { CoreSymbols } from "~symbols";
import { SCHEMA_SERVICES } from "~common";
import type { IInitiator, NSchemaLoader } from "~types";

const setServices = (services: NSchemaLoader.ServiceStructure[]): void => {
  SCHEMA_SERVICES.length = 0;
  SCHEMA_SERVICES.push(...services);
};

const initiator = container.get<IInitiator>(CoreSymbols.Initiator);
export { initiator, setServices };

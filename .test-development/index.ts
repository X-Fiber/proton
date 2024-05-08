import { setServices } from "../src";

export * from "../src/ba-communication/setters";
export * from "../src/fn-components/utils/helpers";
export * from "../src/fn-components/utils/guards";
export * from "../src/common";

import { container } from "../src/ioc/core.ioc";
import { CoreSymbols } from "../src/ioc/core.ioc.symbols";
import { SysAdminService } from "./test_schema/entry";
import type { IInitiator } from "../types";

const serverInitiator = container.get<IInitiator>(CoreSymbols.Initiator);
export { serverInitiator };

setServices([SysAdminService]);

serverInitiator.start();

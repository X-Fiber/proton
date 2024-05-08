import { setService } from "../../src";
import { TestEntryPoint } from "./domains/test.entry-point";

export const SysAdminService = setService("Test", [TestEntryPoint]);

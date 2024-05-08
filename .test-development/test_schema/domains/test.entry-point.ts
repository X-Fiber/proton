import { testRouter } from "./test.router";
import { TestTypeormSchema } from "./test.typeorm-schema";
import { setPointer } from "../../../src";

export const TestEntryPoint = setPointer("test", {
  router: testRouter,
  typeorm: {
    name: "TEST_DOMAIN",
    schema: TestTypeormSchema,
  },
});

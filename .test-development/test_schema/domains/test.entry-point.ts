import { testRouter } from "./test.router";
import { TestTypeormSchema } from "./test.typeorm-schema";
import { setPointer } from "../../../src";
import { testBroker } from "./test.broker";
import { testStreamer } from "./test.streamer";

export const TestEntryPoint = setPointer("test", {
  router: testRouter,
  typeorm: {
    name: "TEST_DOMAIN",
    schema: TestTypeormSchema,
  },
  broker: testBroker,
  streamer: testStreamer,
});

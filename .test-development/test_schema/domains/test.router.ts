import { setRouter } from "../../../src";
import { NTest } from "./test";

export const testRouter = setRouter<NTest.Paths>({
  test: {
    POST: {
      scope: "public:route",
      params: [
        {
          name: "rog",
          scope: "required",
        },
        {
          name: "userId",
          scope: "optional",
        },
        {
          name: "para",
          scope: "required",
        },
      ],
      queries: [
        {
          name: "limit",
          format: ["number"],
          scope: "required",
        },
        {
          name: "price",
          format: ["number[]", "number"],
          scope: "optional",
        },
      ],
      headers: [
        {
          name: "x-odk-language",
          scope: "required",
        },
        {
          name: "x-odk-resolve",
          scope: "optional",
        },
      ],
      handler: async (request: any, agents: any) => {},
    },
  },
});

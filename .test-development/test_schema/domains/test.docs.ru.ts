import { setDocumentation } from "../../../src/ba-communication/setters";

export const TestDocsRu = setDocumentation<"ru", "v1.0.0", "v1/test2">("ru", {
  release: "v1.0.0",
  info: {
    summary: "Тестовая прикладная область предназначена",
  },
  details: {
    common: {
      routes: {
        "v1/test2": {
          POST: {
            release: "v1.0.0",
            description: "assasaas",
            summary: "asassasaas",
          },
        },
      },
    },
  },
});

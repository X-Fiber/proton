import { setTypeormSchema } from "../../../src";

export const TestTypeormSchema = setTypeormSchema<{
  firstName: string;
  id: string;
}>((agents) => {
  return {
    name: "TEST_DOMAIN",
    columns: {
      id: {
        primary: true,
        type: "varchar",
        generated: "uuid",
      },
      firstName: {
        type: "varchar",
        comment: "Імʼя користувача",
      },
    },
  };
});

import {
  ControllerHandler,
  TypeormRepoHandlers,
  ValidateHandler,
  yup,
} from "@Core/Types";

export namespace NTest {
  export type Paths = "test";

  export type Entity = {
    firstName?: string;
    lastName: string;
  };
  export type Controller = {
    create: ControllerHandler<Entity>;
  };

  export type Validator = {
    sendTest: {
      in: ValidateHandler<Entity>;
    };
  };

  export type EntityValidator = {
    sendTest(): yup.ObjectSchema;
  };
}
